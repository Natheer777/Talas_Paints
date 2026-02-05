
import { AdsCard, AdsCardStatus, MediaType } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateAdsCardDTO {
    title: string;
    text: string;
    status?: AdsCardStatus;
    mediaFile: Express.Multer.File;
}

export class CreateAdsCardUseCase {
    constructor(
        private adsCardRepository: IAdsCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreateAdsCardDTO): Promise<AdsCard> {
        const { title, text, status, mediaFile } = data;
        const adsCardId = uuidv4();

        // Determine media type
        const mediaType = mediaFile.mimetype.startsWith('image/') ? MediaType.IMAGE : MediaType.VIDEO;

        // Upload media to S3
        const mediaUrl = await this.fileStorageService.UploadMediaAdsCard(
            mediaFile,
            adsCardId,
            'ads-cards'
        );

        const adsCard: AdsCard = {
            id: adsCardId,
            title,
            text,
            mediaUrl,
            mediaType,
            status: status || AdsCardStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.adsCardRepository.create(adsCard);
    }
}
