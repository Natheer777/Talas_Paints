import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export class DeleteVideoCardUseCase {
    constructor(
        private videoCardRepository: IVideoCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string): Promise<boolean> {
        // Check if video card exists
        const existingVideoCard = await this.videoCardRepository.findById(id);
        if (!existingVideoCard) {
            return false;
        }

        // Delete video from S3
        try {
            await this.fileStorageService.DeleteOldVideo(existingVideoCard.videoUrl);
        } catch (error) {
            console.error('Failed to delete video from S3:', error);
            // Continue with database deletion even if S3 deletion fails
        }

        // Delete from database
        return await this.videoCardRepository.delete(id);
    }
}
