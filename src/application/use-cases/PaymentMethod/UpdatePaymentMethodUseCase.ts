import { PaymentMethod, PaymentMethodStatus } from '../../../domian/entities/PaymentMethod';
import { IPaymentMethodRepository } from '../../../domian/repository/IPaymentMethodRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export interface UpdatePaymentMethodDTO {
    status?: PaymentMethodStatus;
    qrCodeFile?: Express.Multer.File;
}

export class UpdatePaymentMethodUseCase {
    constructor(
        private paymentMethodRepository: IPaymentMethodRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string, data: UpdatePaymentMethodDTO): Promise<PaymentMethod | null> {
        const { status, qrCodeFile } = data;

        const existingPaymentMethod = await this.paymentMethodRepository.getById(id);
        if (!existingPaymentMethod) {
            return null;
        }

        let qrCodeUrl = existingPaymentMethod.qrCodeUrl;

        if (qrCodeFile) {
            qrCodeUrl = await this.fileStorageService.UploadQRCode(qrCodeFile, id);
            await this.fileStorageService.DeleteOldQRCode(existingPaymentMethod.qrCodeUrl);
        }

        const updateData: Partial<PaymentMethod> = {
            ...((status !== undefined) && { status }),
            qrCodeUrl,
            updatedAt: new Date()
        };

        return await this.paymentMethodRepository.update(id, updateData);
    }
}


