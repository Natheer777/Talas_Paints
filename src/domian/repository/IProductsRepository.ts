import { Product } from "../entities/Products";

export interface IProductsRepository {
    create(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    checkExistingProduct(name: string): Promise<boolean>;
    update(id: string, product: Product): Promise<Product>;
    delete(id: string): Promise<void>;
}

