import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order } from '@/domian/entities/Order';

interface GetOrdersForAdminDTO {
    page?: number;
    limit?: number;
}

export class GetOrdersForAdminUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(dto: GetOrdersForAdminDTO = {}): Promise<{ orders: Order[]; total: number }> {
        const { page, limit } = dto;

        // Convert page/limit to offset/limit for repository
        const pageNum = Math.max(1, page || 1);
        const limitNum = Math.min(1000, Math.max(1, limit || 10));
        const offset = (pageNum - 1) * limitNum;

        const orders = await this.orderRepository.findAll(limitNum, offset);
        const total = await this.orderRepository.count();

        return {
            orders,
            total
        };
    }
}

