import { ProductsRepository } from '../repository/ProductsRepository';
import { DatabaseConnection } from '../databases/DataBaseConnection';

export function registerRepositories(container: any) {
    container.productsRepository = new ProductsRepository(DatabaseConnection.getInstance());
}
