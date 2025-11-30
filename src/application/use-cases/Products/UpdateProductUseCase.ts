import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export interface UpdateProductDTO {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    quantity?: number;
    imageFiles?: Express.Multer.File[];
    keepExistingImages?: boolean;
}

export class UpdateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository,
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: UpdateProductDTO): Promise<Product> {
        const { id, name, description, category, price, quantity, imageFiles, keepExistingImages } = data;

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

        // Look up category by name if provided
        let category_id = existingProduct.category_id;
        if (category) {
            const categoryEntity = await this.categoriesRepository.findByName(category);
            if (!categoryEntity || !categoryEntity.id) {
                throw new Error('Category not found');
            }
            category_id = categoryEntity.id;
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
            category_id: category_id || existingProduct.category_id,
            price: price !== undefined ? price : existingProduct.price,
            quantity: quantity !== undefined ? quantity : existingProduct.quantity,
            images: imageUrls,
            updatedAt: new Date(),
        };

        return this.productsRepository.update(id, updatedProduct);
    }
}
