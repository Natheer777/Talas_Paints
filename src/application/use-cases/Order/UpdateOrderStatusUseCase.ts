import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order, OrderStatus } from '@/domian/entities/Order';
import { INotificationService } from '@/application/services/NotificationService';

interface UpdateOrderStatusDTO {
    orderId: string;
    status: OrderStatus;
}

export class UpdateOrderStatusUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private notificationService: INotificationService
    ) { }

    async execute(dto: UpdateOrderStatusDTO): Promise<Order> {
        const { orderId, status } = dto;

        // Validate status
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid order status. Valid statuses are: ${validStatuses.join(', ')}`);
        }

        // Get order before update to check if it exists
        const existingOrder = await this.orderRepository.findById(orderId);
        if (!existingOrder) {
            throw new Error('Order not found');
        }

        // Update order status
        const updatedOrder = await this.orderRepository.updateStatus(orderId, status);

        // Notify user about status change
        this.notificationService.notifyUserOrderStatusChange(updatedOrder.phone_number, updatedOrder);

        return updatedOrder;
    }
}

