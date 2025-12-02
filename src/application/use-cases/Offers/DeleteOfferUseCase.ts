import { IOfferRepository } from '../../../domian/repository/IOfferRepository';

export class DeleteOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(id: string): Promise<boolean> {
        if (!id || id.trim().length === 0) {
            throw new Error('Offer ID is required');
        }

        const existingOffer = await this.offerRepository.getById(id);
        if (!existingOffer) {
            throw new Error('Offer not found');
        }

        return await this.offerRepository.delete(id);
    }
}
