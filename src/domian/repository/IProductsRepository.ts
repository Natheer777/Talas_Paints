import { Product } from "../entities/Products";

export interface ProductFilterOptions {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    onlyVisible?: boolean;
    sortOrder?: 'asc' | 'desc' | 'random';
}

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

export interface IProductsRepository {
    create(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    findAllPaginated(options?: PaginationOptions): Promise<PaginatedResult<Product>>;
    findVisiblePaginated(options?: PaginationOptions): Promise<PaginatedResult<Product>>;
    searchByName(name: string, onlyVisible?: boolean): Promise<Product[]>;
    searchByNamePaginated(name: string, options?: PaginationOptions, onlyVisible?: boolean): Promise<PaginatedResult<Product>>;
    filterProducts(options: ProductFilterOptions): Promise<Product[]>;
    filterProductsPaginated(filterOptions: ProductFilterOptions, paginationOptions?: PaginationOptions): Promise<PaginatedResult<Product>>;
    findProductsWithActiveOffers(): Promise<Product[]>;
    findProductsWithMostOrdersPaginated(options?: PaginationOptions): Promise<PaginatedResult<Product>>;
    checkExistingProduct(name: string): Promise<boolean>;
    update(id: string, product: Product): Promise<Product>;
    delete(id: string): Promise<void>;
}