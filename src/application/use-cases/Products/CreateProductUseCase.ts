import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductDTO {
    name: string;
    description: string;
    category: string;
    price: number;
    imageFiles?: Express.Multer.File[];
}

export class CreateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository,
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreateProductDTO): Promise<Product> {
        const { name, description, category, price, imageFiles } = data;

        // Check if product already exists
        await this.checkExistingProduct(name);

        // Look up category by name and get its ID
        const categoryEntity = await this.categoriesRepository.findByName(category);
        if (!categoryEntity || !categoryEntity.id) {
            throw new Error('Category not found');
        }
        const category_id = categoryEntity.id;

        const productId = uuidv4();
        let imageUrls: string[] = [];

        // Upload images if provided
        if (imageFiles && imageFiles.length > 0) {
            imageUrls = await this.fileStorageService.UploadMultipleProductImages(
                imageFiles,
                productId,
                'products'
            );
        }

        const product: Product = {
            id: productId,
            name,
            description,
            category_id,
            price,
            images: imageUrls.length > 0 ? imageUrls : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.productsRepository.create(product);
    }

    private async checkExistingProduct(name: string): Promise<void> {
        const existingProduct = await this.productsRepository.checkExistingProduct(name);
        if (existingProduct) {
            throw new Error('Product already exists');
        }
    }
}
