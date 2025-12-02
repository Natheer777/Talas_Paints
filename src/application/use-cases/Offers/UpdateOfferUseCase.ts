import { Offer } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';


export class UpdateOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(id: string, offerData: Partial<Offer>): Promise<Offer> {
        // Validate ID
        if (!id || id.trim().length === 0) {
            throw new Error('Offer ID is required');
        }

        // Check if offer exists
        const existingOffer = await this.offerRepository.getById(id);
        if (!existingOffer) {
            throw new Error('Offer not found');
        }
       

        const updateData = {
            ...offerData,
            updatedAt: new Date()
        };

        // Update in repository
        const updatedOffer = await this.offerRepository.update(id, updateData);

        if (!updatedOffer) {
            throw new Error('Failed to update offer');
        }

        return updatedOffer;
    }


}
