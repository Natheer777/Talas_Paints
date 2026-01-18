import { Product } from '@/domian/entities/Products';
import { IProductsRepository, PaginationOptions, PaginatedResult, ProductFilterOptions } from '@/domian/repository/IProductsRepository';

export interface FilterProductsPaginatedDTO {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    onlyVisible?: boolean;
    sortOrder?: 'asc' | 'desc' | 'random';
    page?: number;
    limit?: number;
}

export class FilterProductsPaginatedUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: FilterProductsPaginatedDTO): Promise<PaginatedResult<Product>> {
        const { categories, minPrice, maxPrice, onlyVisible, sortOrder, page, limit } = data;

        // Validate price range
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            throw new Error('Minimum price cannot be greater than maximum price');
        }

        const filterOptions: ProductFilterOptions = {
            categories,
            minPrice,
            maxPrice,
            onlyVisible,
            sortOrder
        };

        const pageNum = Math.max(1, page || 1);
        const limitNum = Math.min(1000, Math.max(1, limit || 10)); // Default 10, max 1000

        const paginationOptions: PaginationOptions = {
            page: pageNum,
            limit: limitNum
        };

        return await this.productsRepository.filterProductsPaginated(filterOptions, paginationOptions);
    }
}
