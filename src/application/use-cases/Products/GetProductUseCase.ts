import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';

export interface GetProductRequest {
    id: string;
}

export class GetProductUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(request: GetProductRequest): Promise<Product> {
        const { id } = request;

        const product = await this.productsRepository.findById(id);

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }
}
