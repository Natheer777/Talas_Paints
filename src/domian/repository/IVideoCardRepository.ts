import { VideoCard } from '../entities/VideoCard';

export interface IVideoCardRepository {
    create(videoCard: VideoCard): Promise<VideoCard>;
    update(id: string, videoCard: Partial<VideoCard>): Promise<VideoCard | null>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<VideoCard | null>;
    findAll(): Promise<VideoCard[]>;
    findByStatus(status: string): Promise<VideoCard[]>;
}
