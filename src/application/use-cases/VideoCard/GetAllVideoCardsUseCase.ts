import { VideoCard } from '../../../domian/entities/VideoCard';
import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';

export class GetAllVideoCardsUseCase {
    constructor(private videoCardRepository: IVideoCardRepository) { }

    async execute(): Promise<VideoCard[]> {
        return await this.videoCardRepository.findAll();
    }
}
