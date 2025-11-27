import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export interface DeleteCategoryRequest {
    id: string;
}

export class DeleteCategoryUseCase {
    constructor(
        private categoriesRepository: ICategoriesRepository,
        private fileStorageService: IFileStorageService
    ) { }

    async execute(request: DeleteCategoryRequest): Promise<void> {
        const { id } = request;

        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Delete images from S3 if they exist
        if (category.images && category.images.length > 0) {
            for (const imgUrl of category.images) {
                try {
                    await this.fileStorageService.DeleteOldImage(imgUrl);
                } catch (error) {
                    console.error(`Failed to delete category image: ${imgUrl}`, error);
                }
            }
        }

        await this.categoriesRepository.delete(id);
    }
}
