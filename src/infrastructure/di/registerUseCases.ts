import { CreateProductUseCase, GetProductUseCase, GetAllProductsUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@/application/use-cases/Products/index';
import { CreateCategoryUseCase, DeleteCategoryUseCase, UpdateCategoryUseCase, GetAllCategoriesUseCase, GetCategoryUseCase } from '@/application/use-cases/Category';
import { ICategoriesRepository } from '@/domian/repository/ICategoriesRepository';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export function registerUseCases(container: any) {
    const productsRepository = container.productsRepository as IProductsRepository;
    const fileStorageService = container.fileStorageService as IFileStorageService;
    const categoryRepository = container.categoriesRepository as ICategoriesRepository;

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
}
