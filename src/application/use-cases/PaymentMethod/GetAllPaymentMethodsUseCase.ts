import { PaymentMethod } from '../../../domian/entities/PaymentMethod';
import { IPaymentMethodRepository } from '../../../domian/repository/IPaymentMethodRepository';

export class GetAllPaymentMethodsUseCase {
    constructor(
        private paymentMethodRepository: IPaymentMethodRepository
    ) {}

    async execute(): Promise<PaymentMethod[]> {
        return await this.paymentMethodRepository.getAll();
    }
}







