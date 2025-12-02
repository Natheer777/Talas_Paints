import { Offer } from '../entities/Offer';


export interface IOfferRepository {
    create(offer: Offer): Promise<Offer>;
    update(id: string, offer: Partial<Offer>): Promise<Offer | null>;
    delete(id: string): Promise<boolean>;
    getById(id: string): Promise<Offer | null>;
    getAll(): Promise<Offer[]>;
    getActiveOffersByProductId(productId: string): Promise<Offer[]>;
    getActiveOffers(): Promise<Offer[]>;
}
