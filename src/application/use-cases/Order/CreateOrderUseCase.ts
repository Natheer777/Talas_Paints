import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { Order, OrderStatus, PaymentMethodType } from '@/domian/entities/Order';
import { INotificationService } from '@/application/services/NotificationService';
import { v4 as uuidv4 } from 'uuid';

interface OrderItemDTO {
    productId: string;
    quantity: number;
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

            // Use the first size's price (or you can enhance this to accept size selection)
            const price = product.sizes[0]?.price || 0;
            if (price <= 0) {
                throw new Error(`Product ${item.productId} has no valid price.`);
            }

            totalAmount += price * item.quantity;
            orderItems.push({
                product_id: item.productId,
                quantity: item.quantity,
                price: price
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

