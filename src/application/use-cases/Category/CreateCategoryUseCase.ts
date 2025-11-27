import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCategoryDTO {
    name: string;
    imageFiles?: Express.Multer.File[];
}

export class CreateCategoryUseCase {
    constructor(
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(data: CreateCategoryDTO): Promise<Category> {
        const { name, imageFiles } = data;

        // Check if category already exists
        await this.checkExistingCategory(name);

        const categoryId = uuidv4();
        let imageUrls: string[] = [];

        // Upload images if provided
        if (imageFiles && imageFiles.length > 0) {
            imageUrls = await this.fileStorageService.UploadMultipleProductImages(
                imageFiles,
                categoryId,
                'categories'
            );
        }

        const category: Category = {
            id: categoryId,
            name,
            images: imageUrls.length > 0 ? imageUrls : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.categoriesRepository.create(category);
    }

    private async checkExistingCategory(name: string): Promise<void> {
        const existingCategory = await this.categoriesRepository.checkExistingCategory(name);
        if (existingCategory) {
            throw new Error('Category already exists');
        }
    }
}
