
import { AdsCard, MediaType } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export interface UpdateAdsCardDTO {
    title?: string;
    text?: string;
    status?: string;
    mediaFile?: Express.Multer.File;
}

export class UpdateAdsCardUseCase {
    constructor(
        private adsCardRepository: IAdsCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string, data: UpdateAdsCardDTO): Promise<AdsCard | null> {
        const { title, text, status, mediaFile } = data;

        const existingAdsCard = await this.adsCardRepository.getById(id);
        if (!existingAdsCard) {
            return null;
        }

        let mediaUrl = existingAdsCard.mediaUrl;
        let mediaType = existingAdsCard.mediaType;

        if (mediaFile) {
            // Determine new media type
            mediaType = mediaFile.mimetype.startsWith('image/') ? MediaType.IMAGE : MediaType.VIDEO;

            // Upload new media
            mediaUrl = await this.fileStorageService.UploadMediaAdsCard(
                mediaFile,
                id,
                'ads-cards'
            );

            if (existingAdsCard.mediaUrl) {
                try {
                    await this.fileStorageService.DeleteOldMedia(existingAdsCard.mediaUrl);
                } catch (error) {
                    console.error('Failed to delete old media:', error);
                }
            }
        }

        const updateData: Partial<AdsCard> = {};
        if (title !== undefined) updateData.title = title;
        if (text !== undefined) updateData.text = text;
        if (status !== undefined) updateData.status = status as any;
        if (mediaFile) {
            updateData.mediaUrl = mediaUrl;
            updateData.mediaType = mediaType;
        }

        return await this.adsCardRepository.update(id, updateData);
    }
}
