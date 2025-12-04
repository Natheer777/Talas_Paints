import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { CategoriesRepository } from '../repository/CategoriesRepository';
import { CartRepository } from '../repository/CartRepository';
import { OfferRepository } from '../repository/OfferRepository';
import { AdsCardRepository } from '../repository/AdsCardRepository';
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
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase,

} from '@/application/use-cases/Offers/index';
import {
    CreateAdsCardUseCase,
    UpdateAdsCardUseCase,
    DeleteAdsCardUseCase,
    GetAllAdsCardsUseCase,
    GetAdsCardByIdUseCase,
    GetActiveAdsCardsUseCase
} from '@/application/use-cases/AdsCard/index';
import { ProductsController } from '@/presentation/controller/ProductsController';
import { CategoriesController } from '@/presentation/controller/CategoriesController';
import { CartController } from '@/presentation/controller/CartController';
import { OffersController } from '@/presentation/controller/OffersController';
import { AdsCardController } from '@/presentation/controller/AdsCardController';

class Container {
    // Infrastructure layer
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db.getPool());
    private static categoriesRepository = new CategoriesRepository(Container.db.getPool());
    private static cartRepository = new CartRepository(Container.db.getPool());
    private static offerRepository = new OfferRepository(Container.db.getPool());
    private static adsCardRepository = new AdsCardRepository(Container.db.getPool());
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

    // Application layer - Offer Use Cases
    private static createOfferUseCase = new CreateOfferUseCase(
        Container.offerRepository
    );

    private static updateOfferUseCase = new UpdateOfferUseCase(
        Container.offerRepository
    );

    private static deleteOfferUseCase = new DeleteOfferUseCase(
        Container.offerRepository
    );

    private static getAllOffersUseCase = new GetAllOffersUseCase(
        Container.offerRepository
    );

    private static getOfferByIdUseCase = new GetOfferByIdUseCase(
        Container.offerRepository
    );

    private static createAdsCardUseCase = new CreateAdsCardUseCase(
        Container.adsCardRepository,
        Container.fileStorageService
    );

    private static updateAdsCardUseCase = new UpdateAdsCardUseCase(
        Container.adsCardRepository,
        Container.fileStorageService
    );

    private static deleteAdsCardUseCase = new DeleteAdsCardUseCase(
        Container.adsCardRepository,
        Container.fileStorageService
    );

    private static getAllAdsCardsUseCase = new GetAllAdsCardsUseCase(
        Container.adsCardRepository
    );

    private static getAdsCardByIdUseCase = new GetAdsCardByIdUseCase(
        Container.adsCardRepository
    );

    private static getActiveAdsCardsUseCase = new GetActiveAdsCardsUseCase(
        Container.adsCardRepository
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

    private static offersController = new OffersController(
        Container.createOfferUseCase,
        Container.updateOfferUseCase,
        Container.deleteOfferUseCase,
        Container.getAllOffersUseCase,
        Container.getOfferByIdUseCase,

    );

    private static adsCardController = new AdsCardController(
        Container.createAdsCardUseCase,
        Container.updateAdsCardUseCase,
        Container.deleteAdsCardUseCase,
        Container.getAllAdsCardsUseCase,
        Container.getAdsCardByIdUseCase,
        Container.getActiveAdsCardsUseCase
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

    static getOffersController(): OffersController {
        return Container.offersController;
    }

    static getAdsCardController(): AdsCardController {
        return Container.adsCardController;
    }
}

export default Container;
