import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { ProductsController } from '../../presentation/controller/ProductsController';

class Container {
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db);
    private static createProductUseCase = new CreateProductUseCase(Container.productsRepository);
    private static productsController = new ProductsController(Container.createProductUseCase);

    static getProductsController(): ProductsController {
        return Container.productsController;
    }
}

export default Container;
