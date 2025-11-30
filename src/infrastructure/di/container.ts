import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { CategoriesRepository } from '../repository/CategoriesRepository';
import { CartRepository } from '../repository/CartRepository';
import { FileStorageService } from '../services/UploadImageStorageService';
import {
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    SearchProductsUseCase,
    FilterProductsUseCase
} from '@/application/use-cases/Products/index';
import {
    CreateCategoryUseCase,
    GetCategoryUseCase,
    GetAllCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase
} from '@/application/use-cases/Category/index';
import {
    AddToCartUseCase,
    GetCartUseCase,
    UpdateCartItemUseCase,
    RemoveFromCartUseCase,
    ClearCartUseCase
} from '@/application/use-cases/Cart/index';
import { ProductsController } from '@/presentation/controller/ProductsController';
import { CategoriesController } from '@/presentation/controller/CategoriesController';
import { CartController } from '@/presentation/controller/CartController';

class Container {
    // Infrastructure layer
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db.getPool());
    private static categoriesRepository = new CategoriesRepository(Container.db.getPool());
    private static cartRepository = new CartRepository(Container.db.getPool());
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

    private static searchProductsUseCase = new SearchProductsUseCase(
        Container.productsRepository
    );

    private static filterProductsUseCase = new FilterProductsUseCase(
        Container.productsRepository
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

    // Application layer - Cart Use Cases
    private static addToCartUseCase = new AddToCartUseCase(
        Container.cartRepository,
        Container.productsRepository
    );

    private static getCartUseCase = new GetCartUseCase(
        Container.cartRepository
    );

    private static updateCartItemUseCase = new UpdateCartItemUseCase(
        Container.cartRepository,
        Container.productsRepository
    );

    private static removeFromCartUseCase = new RemoveFromCartUseCase(
        Container.cartRepository
    );

    private static clearCartUseCase = new ClearCartUseCase(
        Container.cartRepository
    );

    // Presentation layer - Controllers
    private static productsController = new ProductsController(
        Container.createProductUseCase,
        Container.getProductUseCase,
        Container.getAllProductsUseCase,
        Container.updateProductUseCase,
        Container.deleteProductUseCase,
        Container.searchProductsUseCase,
        Container.filterProductsUseCase
    );

    private static categoriesController = new CategoriesController(
        Container.createCategoryUseCase,
        Container.getCategoryUseCase,
        Container.getAllCategoriesUseCase,
        Container.updateCategoryUseCase,
        Container.deleteCategoryUseCase
    );

    private static cartController = new CartController(
        Container.addToCartUseCase,
        Container.getCartUseCase,
        Container.updateCartItemUseCase,
        Container.removeFromCartUseCase,
        Container.clearCartUseCase
    );

    static getProductsController(): ProductsController {
        return Container.productsController;
    }

    static getCategoriesController(): CategoriesController {
        return Container.categoriesController;
    }

    static getCartController(): CartController {
        return Container.cartController;
    }
}

export default Container;
