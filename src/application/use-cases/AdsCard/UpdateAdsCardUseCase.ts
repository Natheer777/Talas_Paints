import { AdsCard } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export interface UpdateAdsCardDTO {
    title?: string;
    text?: string;
    status?: string;
    imageFile?: Express.Multer.File;
}

export class UpdateAdsCardUseCase {
    constructor(
        private adsCardRepository: IAdsCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string, data: UpdateAdsCardDTO): Promise<AdsCard | null> {
        const { title, text, status, imageFile } = data;

        const existingAdsCard = await this.adsCardRepository.getById(id);
        if (!existingAdsCard) {
            return null;
        }

        let imageUrl = existingAdsCard.imageUrl;

        if (imageFile) {
            // Upload new image
            imageUrl = await this.fileStorageService.UploadProductImage(
                imageFile,
                id,
                'ads-cards'
            );

            if (existingAdsCard.imageUrl) {
                try {
                    await this.fileStorageService.DeleteOldImage(existingAdsCard.imageUrl);
                } catch (error) {
                    console.error('Failed to delete old image:', error);
                }
            }
        }

        const updateData: Partial<AdsCard> = {};
        if (title !== undefined) updateData.title = title;
        if (text !== undefined) updateData.text = text;
        if (status !== undefined) updateData.status = status as any;
        if (imageFile) updateData.imageUrl = imageUrl;

        return await this.adsCardRepository.update(id, updateData);
    }
}

