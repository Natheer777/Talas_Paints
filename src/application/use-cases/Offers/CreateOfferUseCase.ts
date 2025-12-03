import { Offer } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';
import { v4 as uuidv4 } from 'uuid';

export class CreateOfferUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
        const normalizedOfferData = this.normalizeOfferData(offerData);
        const offer: Offer = {
            ...normalizedOfferData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return await this.offerRepository.create(offer);
    }

    private normalizeOfferData(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> {
        if (offerData.type === 'PERCENTAGE_DISCOUNT') {
            return {
                ...offerData,
                buy_quantity: null as any,
                get_quantity: null as any
            };
        }
        if (offerData.type === 'BUY_X_GET_Y_FREE') {
            return {
                ...offerData,
                discount_percentage: null as any
            };
        }
        return offerData;
    }
}
