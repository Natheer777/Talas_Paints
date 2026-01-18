import { Product } from '@/domian/entities/Products';
import { IProductsRepository, ProductFilterOptions } from '@/domian/repository/IProductsRepository';

export interface FilterProductsDTO {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    onlyVisible?: boolean;
    sortOrder?: 'asc' | 'desc' | 'random';
}

export class FilterProductsUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: FilterProductsDTO): Promise<Product[]> {
        const { categories, minPrice, maxPrice, onlyVisible, sortOrder } = data;

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

        return await this.productsRepository.filterProducts(filterOptions);
    }
}
