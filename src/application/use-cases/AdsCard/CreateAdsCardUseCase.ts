import { AdsCard, AdsCardStatus } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateAdsCardDTO {
    title: string;
    text: string;
    status?: AdsCardStatus;
    imageFile: Express.Multer.File;
}

export class CreateAdsCardUseCase {
    constructor(
        private adsCardRepository: IAdsCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreateAdsCardDTO): Promise<AdsCard> {
        const { title, text, status, imageFile } = data;
        const adsCardId = uuidv4();

        // Upload image to S3
        const imageUrl = await this.fileStorageService.UploadProductImage(
            imageFile,
            adsCardId,
            'ads-cards'
        );

        const adsCard: AdsCard = {
            id: adsCardId,
            title,
            text,
            imageUrl,
            status: status || AdsCardStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.adsCardRepository.create(adsCard);
    }
}
