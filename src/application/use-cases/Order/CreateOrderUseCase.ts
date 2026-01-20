import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { Order, OrderStatus, PaymentMethodType } from '@/domian/entities/Order';
import { INotificationService } from '@/application/services/NotificationService';
import { v4 as uuidv4 } from 'uuid';

interface OrderItemDTO {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
    price?: number;
}

interface CreateOrderDTO {
    phoneNumber: string;
    customerName: string;
    areaName: string;
    streetName?: string;
    buildingNumber?: string;
    additionalNotes?: string;
    deliveryAgentName: string;
    paymentMethod: PaymentMethodType;
    items: OrderItemDTO[];
}

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private productsRepository: IProductsRepository,
        private notificationService: INotificationService
    ) { }

    async execute(dto: CreateOrderDTO): Promise<Order> {
        const {
            phoneNumber,
            customerName,
            areaName,
            streetName,
            buildingNumber,
            additionalNotes,
            deliveryAgentName,
            paymentMethod,
            items
        } = dto;

        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item.');
        }

        // Validate and calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            if (item.quantity <= 0) {
                throw new Error(`Invalid quantity for product ${item.productId}. Quantity must be greater than 0.`);
            }

            const product = await this.productsRepository.findById(item.productId);
            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }

            // Check if product is visible
            if (product.status !== 'visible') {
                throw new Error(`Product ${product.name} is not available for ordering`);
            }

            // Validate color if provided
            if (item.color && product.colors && !product.colors.includes(item.color)) {
                throw new Error(`Color ${item.color} is not available for product ${product.name}`);
            }

            // Get price from size if provided, otherwise use first size price
            let dbPrice = 0;
            if (item.size && product.sizes && Array.isArray(product.sizes)) {
                const sizeInfo = product.sizes.find(s => typeof s === 'object' && s.size === item.size);
                if (sizeInfo && typeof sizeInfo === 'object' && 'price' in sizeInfo) {
                    dbPrice = sizeInfo.price;
                } else {
                    throw new Error(`Size ${item.size} not found for product ${product.name}`);
                }
            } else if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                // Use first size price if no size specified
                const firstSize = product.sizes[0];
                if (typeof firstSize === 'object' && 'price' in firstSize) {
                    dbPrice = firstSize.price;
                }
            }

            // Use provided price if available, otherwise use database price
            const finalPrice = item.price !== undefined ? item.price : dbPrice;

            // Validate color
            if (item.color) {
                if (!product.colors || product.colors.length === 0) {
                    throw new Error(`Product '${product.name}' does not support color selection.`);
                }
                if (!product.colors.includes(item.color)) {
                    const availableColors = product.colors.join(', ');
                    throw new Error(`Color '${item.color}' is not available for product '${product.name}'. Available colors: ${availableColors}`);
                }
            } else if (product.colors && product.colors.length > 0) {
                // If the product has colors, one must be selected
                throw new Error(`Please specify a color for product '${product.name}'.`);
            }

            totalAmount += finalPrice * item.quantity;
            orderItems.push({
                product_id: item.productId,
                quantity: item.quantity,
                price: finalPrice,
                color: item.color,
                size: item.size
            });
        }

        // Create order
        const orderId = uuidv4();
        const order = await this.orderRepository.create(
            {
                id: orderId,
                phone_number: phoneNumber,
                customer_name: customerName,
                area_name: areaName,
                street_name: streetName,
                building_number: buildingNumber,
                additional_notes: additionalNotes,
                delivery_agent_name: deliveryAgentName,
                payment_method: paymentMethod,
                status: OrderStatus.PENDING,
                total_amount: parseFloat(totalAmount.toFixed(2))
                // orderNumber is auto-generated by the database
            },
            orderItems
        );

        // Fetch the order with product details populated
        const orderWithDetails = await this.orderRepository.findById(order.id);
        if (!orderWithDetails) {
            throw new Error('Failed to retrieve created order');
        }

        // Notify admin about new order
        console.log(`🚀 Triggering admin notification for new order: ${orderWithDetails.id}`);

        // Send notification to default admin email (configured in .env)
        // If you have multiple admins, you can pass specific email array here
        await this.notificationService.notifyAdminNewOrder(orderWithDetails);

        return order;
    }
}