import { Product } from '@/domian/entities/Products';
import { IProductsRepository, ProductFilterOptions } from '@/domian/repository/IProductsRepository';

export interface FilterProductsDTO {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
}

export class FilterProductsUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: FilterProductsDTO): Promise<Product[]> {
        const { categories, minPrice, maxPrice } = data;

        // Validate price range
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            throw new Error('Minimum price cannot be greater than maximum price');
        }

        const filterOptions: ProductFilterOptions = {
            categories,
            minPrice,
            maxPrice
        };

        return await this.productsRepository.filterProducts(filterOptions);
    }
}
