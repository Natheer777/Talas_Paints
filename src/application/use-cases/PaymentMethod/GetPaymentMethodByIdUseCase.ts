import { PaymentMethod } from '../../../domian/entities/PaymentMethod';
import { IPaymentMethodRepository } from '../../../domian/repository/IPaymentMethodRepository';

export class GetPaymentMethodByIdUseCase {
    constructor(
        private paymentMethodRepository: IPaymentMethodRepository
    ) {}

    async execute(id: string): Promise<PaymentMethod | null> {
        return await this.paymentMethodRepository.getById(id);
    }
}



