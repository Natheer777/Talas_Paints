import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { FileStorageService } from '../services/UploadImageStorageService';
import { CreateProductUseCase } from '@/application/use-cases/CreateProductUseCase';
import { GetProductUseCase } from '@/application/use-cases/GetProductUseCase';
import { GetAllProductsUseCase } from '@/application/use-cases/GetAllProductsUseCase';
import { UpdateProductUseCase } from '@/application/use-cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '@/application/use-cases/DeleteProductUseCase';
import { ProductsController } from '@/presentation/controller/ProductsController';

class Container {
    // Infrastructure layer
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db.getPool());
    private static fileStorageService = new FileStorageService();

    // Application layer - Use Cases
    private static createProductUseCase = new CreateProductUseCase(
        Container.productsRepository,
        Container.fileStorageService
    );

    private static getProductUseCase = new GetProductUseCase(
        Container.productsRepository
    );

    private static getAllProductsUseCase = new GetAllProductsUseCase(
        Container.productsRepository
    );

    private static updateProductUseCase = new UpdateProductUseCase(
        Container.productsRepository,
        Container.fileStorageService
    );

    private static deleteProductUseCase = new DeleteProductUseCase(
        Container.productsRepository,
        Container.fileStorageService
    );

    // Presentation layer - Controllers
    private static productsController = new ProductsController(
        Container.createProductUseCase,
        Container.getProductUseCase,
        Container.getAllProductsUseCase,
        Container.updateProductUseCase,
        Container.deleteProductUseCase
    );

    static getProductsController(): ProductsController {
        return Container.productsController;
    }
}

export default Container;
