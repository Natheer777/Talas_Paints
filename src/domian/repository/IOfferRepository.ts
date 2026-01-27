import { Offer } from '../entities/Offer';
import { OfferWithDetails } from '../entities/OfferWithDetails';


export interface PaginationOptions {
    page?: number;
    limit?: number;
}


export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface IOfferRepository {
    create(offer: Offer): Promise<Offer>;
    update(id: string, offer: Partial<Offer>): Promise<Offer | null>;
    delete(id: string): Promise<boolean>;
    getById(id: string): Promise<Offer | null>;
    getAll(): Promise<Offer[]>;
    getByIdWithDetails(id: string): Promise<OfferWithDetails | null>;
    getAllWithDetails(): Promise<OfferWithDetails[]>;
    getAllWithDetailsPaginated(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>>;
    getVisibleWithDetailsPaginated(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>>;
    findActiveByProductId(productId: string): Promise<Offer | null>;
}
