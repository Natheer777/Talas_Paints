import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';

export interface SearchProductsDTO {
    name: string;
}

export class SearchProductsUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: SearchProductsDTO): Promise<Product[]> {
        const { name } = data;

        if (!name || name.trim().length === 0) {
            throw new Error('Search term is required');
        }

        return await this.productsRepository.searchByName(name);
    }
}
