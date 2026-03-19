import { OfferWithDetails } from '@/domian/entities/OfferWithDetails';
import { IOfferRepository, PaginationOptions, PaginatedResult, OfferFilterOptions } from '@/domian/repository/IOfferRepository';

export interface FilterOffersPaginatedDTO {
    categories?: string[];
    types?: string[];
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export class FilterOffersPaginatedUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(data: FilterOffersPaginatedDTO): Promise<PaginatedResult<OfferWithDetails>> {
        const { categories, types, minPrice, maxPrice, status, sortOrder, page, limit } = data;

        const filterOptions: OfferFilterOptions = {
            categories,
            types,
            minPrice,
            maxPrice,
            status,
            sortOrder
        };

        const pageNum = Math.max(1, page || 1);
        const limitNum = Math.min(1000, Math.max(1, limit || 10));

        const paginationOptions: PaginationOptions = {
            page: pageNum,
            limit: limitNum
        };

        return await this.offerRepository.filterOffersPaginated(filterOptions, paginationOptions);
    }
}
