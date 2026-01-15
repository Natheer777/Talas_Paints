import { Product } from '@/domian/entities/Products';
import { IProductsRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/IProductsRepository';

export interface SearchProductsPaginatedDTO {
    name: string;
    onlyVisible?: boolean;
    page?: number;
    limit?: number;
}

export class SearchProductsPaginatedUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: SearchProductsPaginatedDTO): Promise<PaginatedResult<Product>> {
        const { name, onlyVisible, page, limit } = data;

        if (!name || name.trim().length === 0) {
            throw new Error('Search term is required');
        }

        const pageNum = Math.max(1, page || 1);
        const limitNum = Math.min(1000, Math.max(1, limit || 10)); // Default 10, max 1000

        const paginationOptions: PaginationOptions = {
            page: pageNum,
            limit: limitNum
        };

        return await this.productsRepository.searchByNamePaginated(name, paginationOptions, onlyVisible);
    }
}
