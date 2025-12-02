import { Offer } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';

/**
 * Get Active Offers By Product ID Use Case
 * Retrieves all active offers for a specific product
 */
export class GetActiveOffersByProductIdUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(productId: string): Promise<Offer[]> {
        // Validate product ID
        if (!productId || productId.trim().length === 0) {
            throw new Error('Product ID is required');
        }

        // Get active offers for the product
        return await this.offerRepository.getActiveOffersByProductId(productId);
    }
}
