import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export interface UpdateCategoryDTO {
    id: string;
    name?: string;
    imageFile?: Express.Multer.File;
}

export class UpdateCategoryUseCase {
    constructor(
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: UpdateCategoryDTO): Promise<Category> {
        const { id, name, imageFile } = data;

        // Get existing category
        const existingCategory = await this.categoriesRepository.findById(id);
        if (!existingCategory) {
            throw new Error('Category not found');
        }

        // Check if name is being changed and if new name already exists
        if (name && name !== existingCategory.name) {
            const nameExists = await this.categoriesRepository.checkExistingCategory(name);
            if (nameExists) {
                throw new Error('Category with this name already exists');
            }
        }

        // Keep current image URL by default
        let imageUrl: string | null = existingCategory.images && existingCategory.images.length > 0
            ? existingCategory.images[0]
            : null;

        // Handle image update - always replace the old image
        if (imageFile) {
            // Delete old image from S3 if it exists
            if (imageUrl) {
                try {
                    await this.fileStorageService.DeleteOldImage(imageUrl);
                } catch (error) {
                    console.error(`Failed to delete old image: ${imageUrl}`, error);
                }
            }

            // Upload new image
            imageUrl = await this.fileStorageService.UploadProductImage(
                imageFile,
                id,
                'categories'
            );
        }

        const updatedCategory: Category = {
            ...existingCategory,
            name: name || existingCategory.name,
            images: imageUrl ? [imageUrl] : null,
            updatedAt: new Date(),
        };

        return this.categoriesRepository.update(id, updatedCategory);
    }
}
