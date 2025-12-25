import { Product, ProductSize, ProductStatus } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export interface UpdateProductDTO {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    colors?: string[];
    sizes?: ProductSize[];
    status?: ProductStatus;
    imageFiles?: Express.Multer.File[];
    keepExistingImages?: boolean;
    imagesToDelete?: string[]; // Array of image URLs to delete
}

export class UpdateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository,
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: UpdateProductDTO): Promise<Product> {
        const { id, name, description, category, colors, sizes, status, imageFiles, keepExistingImages, imagesToDelete } = data;

        const existingProduct = await this.productsRepository.findById(id);
        if (!existingProduct) {
            throw new Error('Product not found');
        }

        if (name && name !== existingProduct.name) {
            const nameExists = await this.productsRepository.checkExistingProduct(name);
            if (nameExists) {
                throw new Error('Product with this name already exists');
            }
        }

        let category_id = existingProduct.category_id;
        if (category) {
            const categoryEntity = await this.categoriesRepository.findByName(category);
            if (!categoryEntity || !categoryEntity.id) {
                throw new Error('Category not found');
            }
            category_id = categoryEntity.id;
        }

        let imageUrls: string[] = existingProduct.images || [];

        // Handle selective image deletion
        if (imagesToDelete && imagesToDelete.length > 0) {
            // Delete specified images from storage
            for (const imageUrl of imagesToDelete) {
                // Verify the image belongs to this product
                if (imageUrls.includes(imageUrl)) {
                    try {
                        await this.fileStorageService.DeleteOldImage(imageUrl);
                        console.log(`Successfully deleted image: ${imageUrl}`);
                    } catch (error) {
                        console.error(`Failed to delete image: ${imageUrl}`, error);
                        // Continue with other deletions even if one fails
                    }
                }
            }
            // Remove deleted images from the array
            imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
        }

        // Handle new image uploads
        if (imageFiles && imageFiles.length > 0) {
            // If keepExistingImages is false, delete all remaining old images
            if (!keepExistingImages && imageUrls.length > 0) {
                for (const imageUrl of imageUrls) {
                    try {
                        await this.fileStorageService.DeleteOldImage(imageUrl);
                    } catch (error) {
                        console.error(`Failed to delete old image: ${imageUrl}`, error);
                    }
                }
                imageUrls = [];
            }

            // Upload new images
            const newImageUrls = await this.fileStorageService.UploadMultipleProductImages(
                imageFiles,
                id,
                'products'
            );

            // Combine existing and new images if keepExistingImages is true
            imageUrls = keepExistingImages
                ? [...imageUrls, ...newImageUrls]
                : newImageUrls;
        }

        // Determine final sizes - use provided sizes if valid, otherwise keep existing
        let finalSizes = existingProduct.sizes;
        if (sizes !== undefined && sizes !== null) {
            if (Array.isArray(sizes) && sizes.length > 0) {
                finalSizes = sizes;
            } else if (Array.isArray(sizes) && sizes.length === 0) {
                // If an empty array is explicitly sent, this is an error
                throw new Error('Product must have at least one size. Cannot update with empty sizes array.');
            }
        }

        const updatedProduct: Product = {
            ...existingProduct,
            name: name || existingProduct.name,
            description: description || existingProduct.description,
            category_id: category_id || existingProduct.category_id,
            colors: colors !== undefined ? colors : existingProduct.colors,
            sizes: finalSizes,
            status: status || existingProduct.status,
            images: imageUrls,
            updatedAt: new Date(),
        };

        // Final validation - ensure product has at least one size
        if (!updatedProduct.sizes || !Array.isArray(updatedProduct.sizes) || updatedProduct.sizes.length === 0) {
            throw new Error('Product must have at least one size with valid size and price information');
        }

        return this.productsRepository.update(id, updatedProduct);
    }
}
