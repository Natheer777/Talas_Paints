import { Offer, OfferType } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';

export class UpdateOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(id: string, offerData: Partial<Offer>): Promise<Offer> {

        const existingOffer = await this.offerRepository.getById(id);
        if (!existingOffer) {
            throw new Error('Offer not found');
        }

        const mergedOffer: Offer = {
            ...existingOffer,
            ...offerData
        };
        const normalizedOfferData = this.normalizeOfferData(mergedOffer);
        const updateData: Partial<Offer> = {
            ...normalizedOfferData,
            updatedAt: new Date()
        };
        const updatedOffer = await this.offerRepository.update(id, updateData);
        if (!updatedOffer) {
            throw new Error('Failed to update offer');
        }
        return updatedOffer;
    }

  
    private normalizeOfferData(offer: Offer): Offer {
        if (offer.type === OfferType.PERCENTAGE_DISCOUNT) {
            return {
                ...offer,
                buy_quantity: null as any,
                get_quantity: null as any
            };
        }
        if (offer.type === OfferType.BUY_X_GET_Y_FREE) {
            return {
                ...offer,
                discount_percentage: null as any
            };
        }
        return offer;
    }
}
