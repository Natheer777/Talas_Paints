import { Product } from '../../domian/entities/Products';
import { IProductsRepository } from '../../domian/repository/IProductsRepository';
import { IFileStorageService } from '../interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductDTO {
    name: string;
    description: string;
    category: string;
    price: number;
    images?: string[];
}

export class CreateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository, 
        private fileStorageService: IFileStorageService) { }

    async execute(data: CreateProductDTO): Promise<Product> {
        const { name, description, category, price } = data;
        let images: string | null = null;
        
        if (images) {
            images = await this.fileStorageService.UploadProductImage(images, uuidv4(), 'product');
        }

        const product: Product = {
            id:uuidv4(),
            name,
            description,
            category,
            price,
            images: images || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.checkExistingProduct(name);
        return this.productsRepository.create(product);
    }

    private async checkExistingProduct(name: string): Promise<boolean> {
        const existingProduct = await this.productsRepository.checkExistingProduct(name);
        if (existingProduct) {
            throw new Error('Product already exists');
        }
        return true;
    }
}
