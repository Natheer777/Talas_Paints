import { IOrderRepository } from '@/domian/repository/IOrderRepository';

interface DeleteOrderDTO {
    orderId: string;
}

export class DeleteOrderUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(dto: DeleteOrderDTO): Promise<void> {
        const { orderId } = dto;

        // Check if order exists and get its status
        const existingOrder = await this.orderRepository.findById(orderId);
        if (!existingOrder) {
            throw new Error('Order not found');
        }

        // Only allow deletion of pending orders (for safety)
        if (existingOrder.status !== 'pending') {
            throw new Error('Only pending orders can be deleted. Please cancel the order by changing its status instead.');
        }

        // Delete the order
        await this.orderRepository.delete(orderId);
    }
}
