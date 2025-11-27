import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { CategoriesRepository } from '../repository/CategoriesRepository';
import { FileStorageService } from '../services/UploadImageStorageService';
import { CreateProductUseCase, UpdateProductUseCase, DeleteProductUseCase, GetProductUseCase, GetAllProductsUseCase } from '@/application/use-cases/Products/index';
import { CreateCategoryUseCase, GetCategoryUseCase, GetAllCategoriesUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase } from '@/application/use-cases/Category/index';
import { ProductsController } from '@/presentation/controller/ProductsController';
import { CategoriesController } from '@/presentation/controller/CategoriesController';

class Container {
    // Infrastructure layer
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db.getPool());
    private static categoriesRepository = new CategoriesRepository(Container.db.getPool());
    private static fileStorageService = new FileStorageService();

    // Application layer - Product Use Cases
    private static createProductUseCase = new CreateProductUseCase(
        Container.productsRepository,
        Container.categoriesRepository,
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
        Container.categoriesRepository,
        Container.fileStorageService
    );

    private static deleteProductUseCase = new DeleteProductUseCase(
        Container.productsRepository,
        Container.fileStorageService
    );

    // Application layer - Category Use Cases
    private static createCategoryUseCase = new CreateCategoryUseCase(
        Container.categoriesRepository,
        Container.fileStorageService
    );

    private static getCategoryUseCase = new GetCategoryUseCase(
        Container.categoriesRepository
    );

    private static getAllCategoriesUseCase = new GetAllCategoriesUseCase(
        Container.categoriesRepository
    );

    private static updateCategoryUseCase = new UpdateCategoryUseCase(
        Container.categoriesRepository,
        Container.fileStorageService
    );

    private static deleteCategoryUseCase = new DeleteCategoryUseCase(
        Container.categoriesRepository,
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

    private static categoriesController = new CategoriesController(
        Container.createCategoryUseCase,
        Container.getCategoryUseCase,
        Container.getAllCategoriesUseCase,
        Container.updateCategoryUseCase,
        Container.deleteCategoryUseCase
    );

    static getProductsController(): ProductsController {
        return Container.productsController;
    }

    static getCategoriesController(): CategoriesController {
        return Container.categoriesController;
    }
}

export default Container;
