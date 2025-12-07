import { VideoCard } from '../../../domian/entities/VideoCard';
import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';
import { VideoStatus } from '../../../domian/entities/VideoCard';

export class GetVisibleVideoCardsUseCase {
    constructor(private videoCardRepository: IVideoCardRepository) { }

    async execute(): Promise<VideoCard[]> {
        return await this.videoCardRepository.findByStatus(VideoStatus.VISIBLE);
    }
}
