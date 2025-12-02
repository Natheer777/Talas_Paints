import { ProductsRepository } from '../repository/ProductsRepository';
import { CategoriesRepository } from '../repository/CategoriesRepository';
import { OfferRepository } from '../repository/OfferRepository';
import { DatabaseConnection } from '../databases/DataBaseConnection';

export function registerRepositories(container: any) {
    container.productsRepository = new ProductsRepository(DatabaseConnection.getInstance().getPool());
    container.categoriesRepository = new CategoriesRepository(DatabaseConnection.getInstance().getPool());
    container.offerRepository = new OfferRepository(DatabaseConnection.getInstance().getPool());
}
