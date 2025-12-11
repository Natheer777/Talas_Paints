import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/ICategoriesRepository';

export class GetAllCategoriesPaginatedUseCase {
    constructor(private categoriesRepository: ICategoriesRepository) { }

    async execute(options?: PaginationOptions): Promise<PaginatedResult<Category>> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(100, Math.max(1, options?.limit || 10)); // Default 10, max 100

        const paginationOptions: PaginationOptions = {
            page,
            limit
        };

        return await this.categoriesRepository.findAllPaginated(paginationOptions);
    }
}
