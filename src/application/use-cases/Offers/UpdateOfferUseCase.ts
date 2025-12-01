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

        // Validate update data
        this.validateUpdateData(offerData);

        // Update timestamp
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

    private validateUpdateData(offerData: Partial<Offer>): void {
        // Validate dates if provided
        if (offerData.start_date && offerData.end_date) {
            const startDate = new Date(offerData.start_date);
            const endDate = new Date(offerData.end_date);

            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }
        }

        // Validate percentage discount if provided
        if (offerData.discount_percentage !== undefined) {
            if (offerData.discount_percentage <= 0 || offerData.discount_percentage > 100) {
                throw new Error('Discount percentage must be between 1 and 100');
            }
        }

        // Validate name if provided
        if (offerData.name !== undefined && offerData.name.trim().length === 0) {
            throw new Error('Offer name cannot be empty');
        }

        // Validate description if provided
        if (offerData.description !== undefined && offerData.description.trim().length === 0) {
            throw new Error('Offer description cannot be empty');
        }
    }
}
