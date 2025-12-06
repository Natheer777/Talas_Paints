import { VideoCard } from '../../../domian/entities/VideoCard';
import { IVideoCardRepository } from '../../../domian/repository/IVideoCardRepository';

export class GetVideoCardByIdUseCase {
    constructor(private videoCardRepository: IVideoCardRepository) { }

    async execute(id: string): Promise<VideoCard | null> {
        return await this.videoCardRepository.findById(id);
    }
}
