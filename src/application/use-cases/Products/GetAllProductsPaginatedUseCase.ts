import { Product } from '@/domian/entities/Products';
import { IProductsRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/IProductsRepository';

export class GetAllProductsPaginatedUseCase {
    constructor(private productsRepository: IProductsRepository) { }

    async execute(options?: PaginationOptions): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(1000, Math.max(1, options?.limit || 10)); // Default 10, max 1000

        const paginationOptions: PaginationOptions = {
            page,
            limit
        };

        return await this.productsRepository.findAllPaginated(paginationOptions);
    }
}