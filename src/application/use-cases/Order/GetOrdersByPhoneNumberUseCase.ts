import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order } from '@/domian/entities/Order';

interface GetOrdersByPhoneNumberDTO {
    phoneNumber: string;
}

export class GetOrdersByPhoneNumberUseCase {
    constructor(private orderRepository: IOrderRepository) { }

    async execute(dto: GetOrdersByPhoneNumberDTO): Promise<Order[]> {
        const { phoneNumber } = dto;

        return await this.orderRepository.findByPhoneNumber(phoneNumber);
    }
}

