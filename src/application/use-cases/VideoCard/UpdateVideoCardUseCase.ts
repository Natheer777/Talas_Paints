import { VideoCard, VideoStatus } from '../../../domian/entities/VideoCard';
import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';

export interface UpdateVideoCardDTO {
    title?: string;
    status?: VideoStatus;
    videoFile?: Express.Multer.File;
}

export class UpdateVideoCardUseCase {
    constructor(
        private videoCardRepository: IVideoCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(id: string, data: UpdateVideoCardDTO): Promise<VideoCard | null> {
        const { title, status, videoFile } = data;

        // Check if video card exists
        const existingVideoCard = await this.videoCardRepository.findById(id);
        if (!existingVideoCard) {
            throw new Error('Video card not found');
        }

        let videoUrl = existingVideoCard.videoUrl;

        // If new video file is provided, upload it and delete the old one
        if (videoFile) {
            // Validate video file type
            const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
            if (!allowedMimeTypes.includes(videoFile.mimetype)) {
                throw new Error('Invalid video format. Allowed formats: MP4, MPEG, MOV, AVI, WEBM');
            }

            // Upload new video
            videoUrl = await this.fileStorageService.UploadVideo(
                videoFile,
                id,
                'video-cards'
            );

            // Delete old video
            try {
                await this.fileStorageService.DeleteOldVideo(existingVideoCard.videoUrl);
            } catch (error) {
                console.error('Failed to delete old video:', error);
                // Continue even if deletion fails
            }
        }

        const updatedData: Partial<VideoCard> = {
            ...(title && { title }),
            ...(status && { status }),
            videoUrl,
            updatedAt: new Date()
        };

        return await this.videoCardRepository.update(id, updatedData);
    }
}
