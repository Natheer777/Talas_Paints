import { DatabaseConnection } from '../databases/DataBaseConnection';
import { ProductsRepository } from '../repository/ProductsRepository';
import { CategoriesRepository } from '../repository/CategoriesRepository';
import { OrderRepository } from '../repository/OrderRepository';
import { OfferRepository } from '../repository/OfferRepository';
import { AdsCardRepository } from '../repository/AdsCardRepository';
import { VideoCardRepository } from '../repository/VideoCardRepository';
import { PaymentMethodRepository } from '../repository/PaymentMethodRepository';
import { FcmTokenRepository } from '../repository/FcmTokenRepository';
import { FileStorageService } from '../services/UploadImageStorageService';
import { FirebasePushNotificationService } from '../services/FirebasePushNotificationService';
import { InMemoryRateLimitStore } from '../services/InMemoryRateLimitStore';
import { RateLimitService } from '@/application/services/RateLimitService';
import { NotificationService } from '@/application/services/NotificationService';
import { SecurityService } from '../services/SecurityService';
import { AdminRepository } from '../repository/AdminRepository';
import { AuthenticationService } from '../services/AuthenticationService';
import { LoginAdminUseCase } from '@/application/use-cases/Admin/index';
import { AuthController } from '@/presentation/controller/AuthController';
import { AuthMiddleware } from '@/presentation/middleware/AuthMiddleware';
import { Server as SocketIOServer } from 'socket.io';
import {
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    GetAllProductsPaginatedUseCase,
    GetProductsWithActiveOffersUseCase,
    GetProductsWithMostOrdersPaginatedUseCase,
    SearchProductsUseCase,
    SearchProductsPaginatedUseCase,
    FilterProductsUseCase,
    FilterProductsPaginatedUseCase,
    GetVisibleProductsPaginatedUseCase
} from '@/application/use-cases/Products/index';
import {
    CreateCategoryUseCase,
    GetCategoryUseCase,
    GetAllCategoriesUseCase,
    GetAllCategoriesPaginatedUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase
} from '@/application/use-cases/Category/index';
import {
    CreateOrderUseCase,
    GetOrderUseCase,
    GetOrdersByPhoneNumberUseCase,
    UpdateOrderStatusUseCase,
    GetOrdersForAdminUseCase,
    DeleteOrderUseCase
} from '@/application/use-cases/Order/index';
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase,
    GetAllOffersWithDetailsPaginatedUseCase,
    GetVisibleOffersWithDetailsPaginatedUseCase
} from '@/application/use-cases/Offers/index';
import {
    CreateAdsCardUseCase,
    UpdateAdsCardUseCase,
    DeleteAdsCardUseCase,
    GetAllAdsCardsUseCase,
    GetAdsCardByIdUseCase,
    GetActiveAdsCardsUseCase
} from '@/application/use-cases/AdsCard/index';
import {
    CreateVideoCardUseCase,
    UpdateVideoCardUseCase,
    DeleteVideoCardUseCase,
    GetAllVideoCardsUseCase,
    GetVideoCardByIdUseCase,
    GetVisibleVideoCardsUseCase
} from '@/application/use-cases/VideoCard/index';
import {
    CreatePaymentMethodUseCase,
    UpdatePaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    GetAllPaymentMethodsUseCase,
    GetPaymentMethodByIdUseCase,
    GetVisiblePaymentMethodsUseCase
} from '@/application/use-cases/PaymentMethod/index';
import { ProductsController } from '@/presentation/controller/ProductsController';
import { CategoriesController } from '@/presentation/controller/CategoriesController';
import { OrderController } from '@/presentation/controller/OrderController';
import { OffersController } from '@/presentation/controller/OffersController';
import { AdsCardController } from '@/presentation/controller/AdsCardController';
import { VideoCardController } from '@/presentation/controller/VideoCardController';
import { PaymentMethodController } from '@/presentation/controller/PaymentMethodController';
import { NotificationController } from '@/presentation/controller/NotificationController';
import { RegisterFcmTokenUseCase } from '@/application/use-cases/Notification/index';

class Container {
    // Infrastructure layer
    private static db = DatabaseConnection.getInstance();
    private static productsRepository = new ProductsRepository(Container.db.getPool());
    private static categoriesRepository = new CategoriesRepository(Container.db.getPool());
    private static orderRepository = new OrderRepository(Container.db.getPool());
    private static offerRepository = new OfferRepository(Container.db.getPool());
    private static adsCardRepository = new AdsCardRepository(Container.db.getPool());
    private static videoCardRepository = new VideoCardRepository(Container.db.getPool());
    private static paymentMethodRepository = new PaymentMethodRepository(Container.db.getPool());
    private static adminRepository = new AdminRepository(Container.db.getPool());
    private static fcmTokenRepository = new FcmTokenRepository(Container.db.getPool());
    private static fileStorageService = new FileStorageService();
    private static firebasePushService = new FirebasePushNotificationService(Container.fcmTokenRepository);

    // Rate Limiting Infrastructure
    private static rateLimitStore = new InMemoryRateLimitStore();
    private static rateLimitService = new RateLimitService(Container.rateLimitStore);
    private static securityService = new SecurityService();
    private static authService = new AuthenticationService();
    private static authMiddleware = new AuthMiddleware(Container.adminRepository, Container.authService);

    // Socket.IO and Notification Service (will be initialized when server starts)
    private static io: SocketIOServer | null = null;
    private static notificationService: NotificationService | null = null;

    // Application layer - Admin Use Cases
    private static loginAdminUseCase = new LoginAdminUseCase(
        Container.adminRepository,
        Container.authService
    );

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

    private static getAllProductsPaginatedUseCase = new GetAllProductsPaginatedUseCase(
        Container.productsRepository
    );

    private static getProductsWithActiveOffersUseCase = new GetProductsWithActiveOffersUseCase(
        Container.productsRepository
    );

    private static getProductsWithMostOrdersPaginatedUseCase = new GetProductsWithMostOrdersPaginatedUseCase(
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

    private static searchProductsPaginatedUseCase = new SearchProductsPaginatedUseCase(
        Container.productsRepository
    );

    private static filterProductsUseCase = new FilterProductsUseCase(
        Container.productsRepository
    );

    private static filterProductsPaginatedUseCase = new FilterProductsPaginatedUseCase(
        Container.productsRepository
    );

    private static getVisibleProductsPaginatedUseCase = new GetVisibleProductsPaginatedUseCase(
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

    private static getAllCategoriesPaginatedUseCase = new GetAllCategoriesPaginatedUseCase(
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

    // Application layer - Order Use Cases (lazy initialization)
    private static createOrderUseCase: CreateOrderUseCase | null = null;
    private static getOrderUseCase = new GetOrderUseCase(
        Container.orderRepository
    );
    private static getOrdersByPhoneNumberUseCase = new GetOrdersByPhoneNumberUseCase(
        Container.orderRepository
    );
    private static updateOrderStatusUseCase: UpdateOrderStatusUseCase | null = null;
    private static getOrdersForAdminUseCase = new GetOrdersForAdminUseCase(
        Container.orderRepository
    );
    private static deleteOrderUseCase = new DeleteOrderUseCase(
        Container.orderRepository
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

    private static getAllOffersWithDetailsPaginatedUseCase = new GetAllOffersWithDetailsPaginatedUseCase(
        Container.offerRepository
    );

    private static getVisibleOffersWithDetailsPaginatedUseCase = new GetVisibleOffersWithDetailsPaginatedUseCase(
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

    // Application layer - VideoCard Use Cases
    private static createVideoCardUseCase = new CreateVideoCardUseCase(
        Container.videoCardRepository,
        Container.fileStorageService
    );

    private static updateVideoCardUseCase = new UpdateVideoCardUseCase(
        Container.videoCardRepository,
        Container.fileStorageService
    );

    private static deleteVideoCardUseCase = new DeleteVideoCardUseCase(
        Container.videoCardRepository,
        Container.fileStorageService
    );

    private static getAllVideoCardsUseCase = new GetAllVideoCardsUseCase(
        Container.videoCardRepository
    );

    private static getVideoCardByIdUseCase = new GetVideoCardByIdUseCase(
        Container.videoCardRepository
    );

    private static getVisibleVideoCardsUseCase = new GetVisibleVideoCardsUseCase(
        Container.videoCardRepository
    );

    // Application layer - PaymentMethod Use Cases
    private static createPaymentMethodUseCase = new CreatePaymentMethodUseCase(
        Container.paymentMethodRepository,
        Container.fileStorageService
    );

    private static updatePaymentMethodUseCase = new UpdatePaymentMethodUseCase(
        Container.paymentMethodRepository,
        Container.fileStorageService
    );

    private static deletePaymentMethodUseCase = new DeletePaymentMethodUseCase(
        Container.paymentMethodRepository,
        Container.fileStorageService
    );

    private static getAllPaymentMethodsUseCase = new GetAllPaymentMethodsUseCase(
        Container.paymentMethodRepository
    );

    private static getPaymentMethodByIdUseCase = new GetPaymentMethodByIdUseCase(
        Container.paymentMethodRepository
    );

    private static getVisiblePaymentMethodsUseCase = new GetVisiblePaymentMethodsUseCase(
        Container.paymentMethodRepository
    );

    // Presentation layer - Controllers
    // Updated to include paginated use case
    private static productsController = new ProductsController(
        Container.createProductUseCase,
        Container.getProductUseCase,
        Container.getAllProductsUseCase,
        Container.getAllProductsPaginatedUseCase,
        Container.getProductsWithActiveOffersUseCase,
        Container.getProductsWithMostOrdersPaginatedUseCase,
        Container.updateProductUseCase,
        Container.deleteProductUseCase,
        Container.searchProductsUseCase,
        Container.searchProductsPaginatedUseCase,
        Container.filterProductsUseCase,
        Container.filterProductsPaginatedUseCase,
        Container.categoriesRepository,
        Container.getVisibleProductsPaginatedUseCase
    );

    private static categoriesController = new CategoriesController(
        Container.createCategoryUseCase,
        Container.getCategoryUseCase,
        Container.getAllCategoriesUseCase,
        Container.getAllCategoriesPaginatedUseCase,
        Container.updateCategoryUseCase,
        Container.deleteCategoryUseCase
    );

    private static orderController: OrderController | null = null;

    private static offersController = new OffersController(
        Container.createOfferUseCase,
        Container.updateOfferUseCase,
        Container.deleteOfferUseCase,
        Container.getAllOffersUseCase,
        Container.getOfferByIdUseCase,
        Container.getAllOffersWithDetailsPaginatedUseCase,
        Container.getVisibleOffersWithDetailsPaginatedUseCase
    );

    private static adsCardController = new AdsCardController(
        Container.createAdsCardUseCase,
        Container.updateAdsCardUseCase,
        Container.deleteAdsCardUseCase,
        Container.getAllAdsCardsUseCase,
        Container.getAdsCardByIdUseCase,
        Container.getActiveAdsCardsUseCase
    );

    private static videoCardController = new VideoCardController(
        Container.createVideoCardUseCase,
        Container.updateVideoCardUseCase,
        Container.deleteVideoCardUseCase,
        Container.getAllVideoCardsUseCase,
        Container.getVideoCardByIdUseCase,
        Container.getVisibleVideoCardsUseCase
    );

    private static paymentMethodController = new PaymentMethodController(
        Container.createPaymentMethodUseCase,
        Container.updatePaymentMethodUseCase,
        Container.deletePaymentMethodUseCase,
        Container.getAllPaymentMethodsUseCase,
        Container.getPaymentMethodByIdUseCase,
        Container.getVisiblePaymentMethodsUseCase
    );

    private static authController = new AuthController(
        Container.loginAdminUseCase
    );

    // Application layer - Notification Use Cases
    private static registerFcmTokenUseCase = new RegisterFcmTokenUseCase(
        Container.fcmTokenRepository
    );

    // Presentation layer - Controllers
    private static notificationController = new NotificationController(
        Container.registerFcmTokenUseCase
    );

    static getProductsController(): ProductsController {
        return Container.productsController;
    }

    static getCategoriesController(): CategoriesController {
        return Container.categoriesController;
    }

    static getOrderController(): OrderController {
        if (!Container.orderController) {
            // Initialize use cases if not already initialized
            if (!Container.createOrderUseCase) {
                Container.createOrderUseCase = new CreateOrderUseCase(
                    Container.orderRepository,
                    Container.productsRepository,
                    Container.getNotificationService(),
                    Container.adminRepository
                );
            }
            if (!Container.updateOrderStatusUseCase) {
                Container.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
                    Container.orderRepository,
                    Container.getNotificationService()
                );
            }
            Container.orderController = new OrderController(
                Container.createOrderUseCase,
                Container.getOrderUseCase,
                Container.getOrdersByPhoneNumberUseCase,
                Container.updateOrderStatusUseCase,
                Container.getOrdersForAdminUseCase,
                Container.deleteOrderUseCase
            );
        }
        return Container.orderController;
    }

    static initializeSocketIO(io: SocketIOServer): void {
        Container.io = io;
        Container.notificationService = new NotificationService(io, Container.firebasePushService);
        // Reinitialize order use cases with notification service
        Container.createOrderUseCase = new CreateOrderUseCase(
            Container.orderRepository,
            Container.productsRepository,
            Container.getNotificationService(),
            Container.adminRepository
        );
        Container.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
            Container.orderRepository,
            Container.getNotificationService()
        );
        // Reinitialize controller if it was already created
        if (Container.orderController) {
            Container.orderController = new OrderController(
                Container.createOrderUseCase,
                Container.getOrderUseCase,
                Container.getOrdersByPhoneNumberUseCase,
                Container.updateOrderStatusUseCase,
                Container.getOrdersForAdminUseCase,
                Container.deleteOrderUseCase
            );
        }
    }

    private static getNotificationService(): NotificationService {
        if (!Container.notificationService) {
            // Create a notification service with null io - it will handle gracefully
            // This allows the app to start, but notifications won't work until Socket.IO is ready
            Container.notificationService = new NotificationService(null, Container.firebasePushService);
        }
        return Container.notificationService;
    }

    static getNotificationController(): NotificationController {
        return Container.notificationController;
    }

    static getOffersController(): OffersController {
        return Container.offersController;
    }

    static getAdsCardController(): AdsCardController {
        return Container.adsCardController;
    }

    static getVideoCardController(): VideoCardController {
        return Container.videoCardController;
    }

    static getPaymentMethodController(): PaymentMethodController {
        return Container.paymentMethodController;
    }

    static getRateLimitService(): RateLimitService {
        return Container.rateLimitService;
    }

    static getSecurityService(): SecurityService {
        return Container.securityService;
    }

    static getAuthController(): AuthController {
        return Container.authController;
    }

    static getAuthMiddleware(): AuthMiddleware {
        return Container.authMiddleware;
    }

    static getAuthService(): AuthenticationService {
        return Container.authService;
    }

    static getOfferRepository(): OfferRepository {
        return Container.offerRepository;
    }
}

export default Container;
