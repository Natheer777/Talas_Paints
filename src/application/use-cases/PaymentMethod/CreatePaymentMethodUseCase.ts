import { PaymentMethod, PaymentMethodStatus } from '../../../domian/entities/PaymentMethod';
import { IPaymentMethodRepository } from '../../../domian/repository/IPaymentMethodRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePaymentMethodDTO {
    status?: PaymentMethodStatus;
    qrCodeFile: Express.Multer.File;
}

export class CreatePaymentMethodUseCase {
    constructor(
        private paymentMethodRepository: IPaymentMethodRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreatePaymentMethodDTO): Promise<PaymentMethod> {
        const { status, qrCodeFile } = data;
        const paymentMethodId = uuidv4();

        // Upload QR code image to S3
        const qrCodeUrl = await this.fileStorageService.UploadQRCode(
            qrCodeFile,
            paymentMethodId
        );

        const paymentMethod: PaymentMethod = {
            id: paymentMethodId,
            qrCodeUrl,
            status: status || PaymentMethodStatus.VISIBLE,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.paymentMethodRepository.create(paymentMethod);
    }
}


