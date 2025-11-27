import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';

export class GetAllProductsUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(): Promise<Product[]> {
        return await this.productsRepository.findAll();
    }
}
