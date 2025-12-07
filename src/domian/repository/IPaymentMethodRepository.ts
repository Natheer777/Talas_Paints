import { PaymentMethod } from '../entities/PaymentMethod';

export interface IPaymentMethodRepository {
    create(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
    update(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | null>;
    delete(id: string): Promise<boolean>;
    getById(id: string): Promise<PaymentMethod | null>;
    getAll(): Promise<PaymentMethod[]>;
    getVisible(): Promise<PaymentMethod[]>;
}
