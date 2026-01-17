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
        await this.orderRepository.updateStatus(orderId, status);

        // Fetch the updated order with product details populated
        const updatedOrder = await this.orderRepository.findById(orderId);
        if (!updatedOrder) {
            throw new Error('Order not found after status update');
        }

        // Notify user about status change (fire and forget - don't await to avoid blocking)
        console.log(`🚀 Triggering notifications for order ${updatedOrder.id} status change to ${updatedOrder.status}`);
        this.notificationService.notifyUserOrderStatusChange(updatedOrder.phone_number, updatedOrder).catch(error => {
            console.error('❌ Error in notification process:', error);
        });

        return updatedOrder;
    }
}

