import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export class DeleteAdsCardUseCase {
    constructor(
        private adsCardRepository: IAdsCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string): Promise<boolean> {
        const adsCard = await this.adsCardRepository.getById(id);

        if (!adsCard) {
            return false;
        }

        const deleted = await this.adsCardRepository.delete(id);

        if (deleted && adsCard.imageUrl) {
            try {
                await this.fileStorageService.DeleteOldImage(adsCard.imageUrl);
            } catch (error) {
                console.error('Failed to delete image from S3:', error);
            }
        }

        return deleted;
    }
}

