import { VideoCard, VideoStatus } from '../../../domian/entities/VideoCard';
import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';
import { IFileStorageService } from '../../interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateVideoCardDTO {
    title: string;
    status?: VideoStatus;
    videoFile: Express.Multer.File;
}

export class CreateVideoCardUseCase {
    constructor(
        private videoCardRepository: IVideoCardRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreateVideoCardDTO): Promise<VideoCard> {
        const { title, status, videoFile } = data;

        // Validate video file
        if (!videoFile) {
            throw new Error('Video file is required');
        }

        // Validate video file type
        const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!allowedMimeTypes.includes(videoFile.mimetype)) {
            throw new Error('Invalid video format. Allowed formats: MP4, MPEG, MOV, AVI, WEBM');
        }

        const videoCardId = uuidv4();

        // Upload video to S3
        const videoUrl = await this.fileStorageService.UploadVideo(
            videoFile,
            videoCardId,
            'video-cards'
        );

        const videoCard: VideoCard = {
            id: videoCardId,
            title,
            videoUrl,
            status: status || VideoStatus.VISIBLE,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.videoCardRepository.create(videoCard);
    }
}
