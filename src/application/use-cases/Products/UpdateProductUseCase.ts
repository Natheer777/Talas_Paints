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
}

export class UpdateProductUseCase {
    constructor(
        private productsRepository: IProductsRepository,
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: UpdateProductDTO): Promise<Product> {
        const { id, name, description, category, colors, sizes, status, imageFiles, keepExistingImages } = data;

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

        let imageUrls: string[] = [];

        if (imageFiles && imageFiles.length > 0) {
            if (!keepExistingImages && existingProduct.images) {
                for (const imageUrl of existingProduct.images) {
                    try {
                        await this.fileStorageService.DeleteOldImage(imageUrl);
                    } catch (error) {
                        console.error(`Failed to delete old image: ${imageUrl}`, error);
                    }
                }
            }

            const newImageUrls = await this.fileStorageService.UploadMultipleProductImages(
                imageFiles,
                id,
                'products'
            );

            imageUrls = keepExistingImages && existingProduct.images
                ? [...existingProduct.images, ...newImageUrls]
                : newImageUrls;
        } else {
            imageUrls = existingProduct.images || [];
        }

        const updatedProduct: Product = {
            ...existingProduct,
            name: name || existingProduct.name,
            description: description || existingProduct.description,
            category_id: category_id || existingProduct.category_id,
            colors: colors !== undefined ? colors : existingProduct.colors,
            sizes: sizes || existingProduct.sizes,
            status: status || existingProduct.status,
            images: imageUrls,
            updatedAt: new Date(),
        };

        return this.productsRepository.update(id, updatedProduct);
    }
}
