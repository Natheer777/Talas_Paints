import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';

export class GetAllCategoriesUseCase {
    constructor(private categoriesRepository: ICategoriesRepository) { }

    async execute(): Promise<Category[]> {
        return await this.categoriesRepository.findAll();
    }
}
