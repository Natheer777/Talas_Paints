import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order } from '@/domian/entities/Order';

interface GetOrderDTO {
    orderId: string;
}

export class GetOrderUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(dto: GetOrderDTO): Promise<Order> {
        const { orderId } = dto;

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }
}

