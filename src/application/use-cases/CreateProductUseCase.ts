import { Product } from '../../domian/entities/Products';
import { IProductsRepository } from '../../domian/repository/IProductsRepository';

export interface CreateProductDTO {
    name: string;
    description: string;
    category: string;
    price: number;
    images?: string[];
}

export class CreateProductUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(data: CreateProductDTO): Promise<Product> {
        const { name, description, category, price, images } = data;
        // You can place further business validation here
        const product: Product = {
            name,
            description,
            category,
            price,
            images: images || []
        };
        return this.productsRepository.create(product);
    }
}
