import { CreateProductUseCase, GetProductUseCase, GetAllProductsUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/Products/index';
import { CreateCategoryUseCase, DeleteCategoryUseCase, UpdateCategoryUseCase, GetAllCategoriesUseCase, GetCategoryUseCase } from '@/application/use-cases/Category';
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase,
    GetActiveOffersByProductIdUseCase,
    CalculateProductOfferUseCase
} from '@/application/use-cases/Offers';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IOfferRepository } from '@/domian/repository/IOfferRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export function registerUseCases(container: any) {
    const productsRepository = container.productsRepository as IProductsRepository;
    const fileStorageService = container.fileStorageService as IFileStorageService;
    const categoryRepository = container.categoriesRepository as ICategoriesRepository;
    const offerRepository = container.offerRepository as IOfferRepository;

    container.createProductUseCase = new CreateProductUseCase(
        productsRepository,
        categoryRepository,
        fileStorageService,
    );

    container.getProductUseCase = new GetProductUseCase(productsRepository);

    container.getAllProductsUseCase = new GetAllProductsUseCase(productsRepository);

    container.updateProductUseCase = new UpdateProductUseCase(
        productsRepository,
        categoryRepository,
        fileStorageService
    );

    container.deleteProductUseCase = new DeleteProductUseCase(
        productsRepository,
        fileStorageService
    );


    container.getCategoryUseCase = new GetCategoryUseCase(categoryRepository);

    container.getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepository);

    container.createCategoryUseCase = new CreateCategoryUseCase(
        categoryRepository,
        fileStorageService
    );

    container.updateCategoryUseCase = new UpdateCategoryUseCase(
        categoryRepository,
        fileStorageService
    )

    container.DeleteCategoryUseCase = new DeleteCategoryUseCase(
        categoryRepository,
        fileStorageService
    )

    // Offer use cases
    container.createOfferUseCase = new CreateOfferUseCase(offerRepository);
    container.updateOfferUseCase = new UpdateOfferUseCase(offerRepository);
    container.deleteOfferUseCase = new DeleteOfferUseCase(offerRepository);
    container.getAllOffersUseCase = new GetAllOffersUseCase(offerRepository);
    container.getOfferByIdUseCase = new GetOfferByIdUseCase(offerRepository);
    container.getActiveOffersByProductIdUseCase = new GetActiveOffersByProductIdUseCase(offerRepository);
    container.calculateProductOfferUseCase = new CalculateProductOfferUseCase(offerRepository);
}
