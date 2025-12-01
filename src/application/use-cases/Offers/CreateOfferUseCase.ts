import { Offer, OfferStatus } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';
import { v4 as uuidv4 } from 'uuid';


export class CreateOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
        this.validateOfferData(offerData);

        const offer: Offer = {
            ...offerData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.offerRepository.create(offer);
    }

    private validateOfferData(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): void {
        if (!offerData.name || offerData.name.trim().length === 0) {
            throw new Error('Offer name is required');
        }

        if (!offerData.description || offerData.description.trim().length === 0) {
            throw new Error('Offer description is required');
        }

        if (!offerData.product_id || offerData.product_id.trim().length === 0) {
            throw new Error('Product ID is required');
        }

        if (!offerData.start_date || !offerData.end_date) {
            throw new Error('Start date and end date are required');
        }

        const startDate = new Date(offerData.start_date);
        const endDate = new Date(offerData.end_date);

        if (endDate <= startDate) {
            throw new Error('End date must be after start date');
        }

        if (offerData.type === 'PERCENTAGE_DISCOUNT') {
            if (offerData.discount_percentage === undefined || offerData.discount_percentage === null) {
                throw new Error('Discount percentage is required for percentage discount offers');
            }

            if (offerData.discount_percentage <= 0 || offerData.discount_percentage > 100) {
                throw new Error('Discount percentage must be between 1 and 100');
            }
        }

        if (!Object.values(OfferStatus).includes(offerData.status)) {
            throw new Error('Invalid offer status');
        }
    }
}
