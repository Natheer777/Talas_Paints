import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';

export interface GetCategoryRequest {
    id: string;
}

export class GetCategoryUseCase {
    constructor(private categoriesRepository: ICategoriesRepository) { }

    async execute(request: GetCategoryRequest): Promise<Category> {
        const { id } = request;

        const category = await this.categoriesRepository.findById(id);

        if (!category) {
            throw new Error('Category not found');
        }

        return category;
    }
}
