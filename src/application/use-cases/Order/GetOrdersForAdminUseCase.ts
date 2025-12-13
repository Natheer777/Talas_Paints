import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order } from '@/domian/entities/Order';

interface GetOrdersForAdminDTO {
    limit?: number;
    offset?: number;
}

export class GetOrdersForAdminUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(dto: GetOrdersForAdminDTO = {}): Promise<{ orders: Order[]; total: number }> {
        const { limit, offset } = dto;

        const orders = await this.orderRepository.findAll(limit, offset);
        const total = await this.orderRepository.count();

        return {
            orders,
            total
        };
    }
}

