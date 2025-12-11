import { Category } from "../entities/Category";

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ICategoriesRepository {
    create(category: Category): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    findAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<Category>>;
    findByName(name: string): Promise<Category | null>;
    update(id: string, category: Category): Promise<Category>;
    delete(id: string): Promise<void>;
    checkExistingCategory(name: string): Promise<boolean>;
}
