import { Offer } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';


export class GetAllOffersUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(): Promise<Offer[]> {
        return await this.offerRepository.getAll();
    }
}
