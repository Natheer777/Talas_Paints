import { IPaymentMethodRepository } from '../../../domian/repository/IPaymentMethodRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export class DeletePaymentMethodUseCase {
    constructor(
        private paymentMethodRepository: IPaymentMethodRepository,
        private fileStorageService: IFileStorageService
    ) {}

    async execute(id: string): Promise<boolean> {
        const paymentMethod = await this.paymentMethodRepository.getById(id);
        if (!paymentMethod) {
            return false;
        }

        // Delete the QR code from storage
        await this.fileStorageService.DeleteOldQRCode(paymentMethod.qrCodeUrl);

        // Delete the payment method from database
        return await this.paymentMethodRepository.delete(id);
    }
}







