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
                throw new Error(`Product with ID ${item.productId} not found.`);
            }

            if (product.status !== 'visible') {
                throw new Error(`Product '${product.name}' is currently not available for ordering.`);
            }

            // Validate and get price based on size
            let dbPrice = 0;
            if (item.size) {
                const selectedSize = product.sizes.find(s => s.size === item.size);
                if (!selectedSize) {
                    const availableSizes = product.sizes.map(s => s.size).join(', ');
                    throw new Error(`Size '${item.size}' is not available for product '${product.name}'. Available sizes: ${availableSizes}`);
                }
                dbPrice = selectedSize.price;
            } else {
                // If no size is provided, check if the product has multiple sizes
                if (product.sizes && product.sizes.length > 1) {
                    throw new Error(`Please specify a size for product '${product.name}'.`);
                }
                dbPrice = product.sizes[0]?.price || 0;
            }

            if (dbPrice <= 0) {
                throw new Error(`Product '${product.name}' (ID: ${item.productId}) has no valid price for the selected options.`);
            }

            // Price validation: compare user-sent price with database price
            if (item.price !== undefined && item.price !== null) {
                const sentPrice = parseFloat(item.price.toString());
                if (Math.abs(sentPrice - dbPrice) > 0.01) { // Use small epsilon for float comparison
                    throw new Error(`Price mismatch for product '${product.name}'. Sent: ${sentPrice}, Actual: ${dbPrice}. Please refresh your data.`);
                }
            }

            const finalPrice = dbPrice;

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
            },
            orderItems
        );

        // Notify admin about new order
        this.notificationService.notifyAdminNewOrder(order);

        return order;
    }
}

