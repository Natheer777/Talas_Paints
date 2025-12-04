import { AdsCard } from '../../../domian/entities/AdsCard';
import { IAdsCardRepository } from '../../../domian/repository/IAdsCardRepository';

export class GetAllAdsCardsUseCase {
    constructor(private adsCardRepository: IAdsCardRepository) { }

    async execute(): Promise<AdsCard[]> {
        return await this.adsCardRepository.getAll();
    }
}
