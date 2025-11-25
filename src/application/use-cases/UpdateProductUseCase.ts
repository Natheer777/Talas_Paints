import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IFileStorageService } from '../interface/IFileStorageService';

export interface UpdateProductDTO {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    imageFiles?: Express.Multer.File[];
    keepExistingImages?: boolean;
}

export class UpdateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: UpdateProductDTO): Promise<Product> {
        const { id, name, description, category, price, imageFiles, keepExistingImages } = data;

        // Get existing product
        const existingProduct = await this.productsRepository.findById(id);
        if (!existingProduct) {
            throw new Error('Product not found');
        }

        // Check if name is being changed and if new name already exists
        if (name && name !== existingProduct.name) {
            const nameExists = await this.productsRepository.checkExistingProduct(name);
            if (nameExists) {
                throw new Error('Product with this name already exists');
            }
        }

        let imageUrls: string[] = [];

        // Handle image updates
        if (imageFiles && imageFiles.length > 0) {
            // Delete old images if not keeping them
            if (!keepExistingImages && existingProduct.images) {
                for (const imageUrl of existingProduct.images) {
                    try {
                        await this.fileStorageService.DeleteOldImage(imageUrl);
                    } catch (error) {
                        console.error(`Failed to delete old image: ${imageUrl}`, error);
                    }
                }
            }

            // Upload new images
            const newImageUrls = await this.fileStorageService.UploadMultipleProductImages(
                imageFiles,
                id,
                'products'
            );

            // Combine with existing images if keeping them
            imageUrls = keepExistingImages && existingProduct.images
                ? [...existingProduct.images, ...newImageUrls]
                : newImageUrls;
        } else {
            // Keep existing images if no new images provided
            imageUrls = existingProduct.images || [];
        }

        const updatedProduct: Product = {
            ...existingProduct,
            name: name || existingProduct.name,
            description: description || existingProduct.description,
            category: category || existingProduct.category,
            price: price !== undefined ? price : existingProduct.price,
            images: imageUrls,
            updatedAt: new Date(),
        };

        return this.productsRepository.update(id, updatedProduct);
    }
}
