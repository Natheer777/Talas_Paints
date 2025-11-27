import { Category } from "../entities/Category";

export interface ICategoriesRepository {
    create(category: Category): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    findByName(name: string): Promise<Category | null>;
    update(id: string, category: Category): Promise<Category>;
    delete(id: string): Promise<void>;
    checkExistingCategory(name: string): Promise<boolean>;
}
