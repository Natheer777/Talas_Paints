import { OfferWithDetails } from '@/domian/entities/OfferWithDetails';
import { IOfferRepository, OfferFilterOptions } from '@/domian/repository/IOfferRepository';

export interface FilterOffersDTO {
    categories?: string[];
    types?: string[];
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    sortOrder?: 'asc' | 'desc';
}

export class FilterOffersUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(data: FilterOffersDTO): Promise<OfferWithDetails[]> {
        const { categories, types, minPrice, maxPrice, status, sortOrder } = data;

        const filterOptions: OfferFilterOptions = {
            categories,
            types,
            minPrice,
            maxPrice,
            status,
            sortOrder
        };

        return await this.offerRepository.filterOffers(filterOptions);
    }
}
