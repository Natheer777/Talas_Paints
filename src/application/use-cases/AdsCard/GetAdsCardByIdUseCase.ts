import { AdsCard } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';

export class GetAdsCardByIdUseCase {
    constructor(private adsCardRepository: IAdsCardRepository) { }

    async execute(id: string): Promise<AdsCard | null> {
        return await this.adsCardRepository.getById(id);
    }
}



