import { Offer, OfferStatus } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create Offer Use Case
 * Handles the business logic for creating a new offer
 * Following Single Responsibility Principle
 */
export class CreateOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
        // Validate offer data
        this.validateOfferData(offerData);

        // Create offer object
        const offer: Offer = {
            ...offerData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save to repository
        return await this.offerRepository.create(offer);
    }

    private validateOfferData(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): void {
        // Validate name
        if (!offerData.name || offerData.name.trim().length === 0) {
            throw new Error('Offer name is required');
        }

        // Validate description
        if (!offerData.description || offerData.description.trim().length === 0) {
            throw new Error('Offer description is required');
        }

        // Validate product_id
        if (!offerData.product_id || offerData.product_id.trim().length === 0) {
            throw new Error('Product ID is required');
        }

        // Validate percentage discount if applicable
        if (offerData.type === 'PERCENTAGE_DISCOUNT') {
            if (offerData.discount_percentage === undefined || offerData.discount_percentage === null) {
                throw new Error('Discount percentage is required for percentage discount offers');
            }

            if (offerData.discount_percentage <= 0 || offerData.discount_percentage > 100) {
                throw new Error('Discount percentage must be between 1 and 100');
            }
        }

        // Validate status
        if (!Object.values(OfferStatus).includes(offerData.status)) {
            throw new Error('Invalid offer status');
        }
    }
}
