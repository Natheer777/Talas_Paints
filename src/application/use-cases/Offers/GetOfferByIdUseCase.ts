import { Offer } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';


export class GetOfferByIdUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(id: string): Promise<Offer> {
        // Validate ID
        if (!id || id.trim().length === 0) {
            throw new Error('Offer ID is required');
        }

        // Get offer from repository
        const offer = await this.offerRepository.getById(id);

        if (!offer) {
            throw new Error('Offer not found');
        }

        return offer;
    }
}
