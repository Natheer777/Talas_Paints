import { Product } from "../entities/Products";

export interface ProductFilterOptions {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
}

export interface IProductsRepository {
    create(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    searchByName(name: string): Promise<Product[]>;
    filterProducts(options: ProductFilterOptions): Promise<Product[]>;
    checkExistingProduct(name: string): Promise<boolean>;
    update(id: string, product: Product): Promise<Product>;
    delete(id: string): Promise<void>;
}

