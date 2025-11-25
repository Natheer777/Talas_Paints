import { CreateProductUseCase } from '@/application/use-cases/CreateProductUseCase';
import { GetProductUseCase } from '@/application/use-cases/GetProductUseCase';
import { GetAllProductsUseCase } from '@/application/use-cases/GetAllProductsUseCase';
import { UpdateProductUseCase } from '@/application/use-cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '@/application/use-cases/DeleteProductUseCase';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IFileStorageService } from '@/application/interface/IFileStorageService';

export function registerUseCases(container: any) {
    const productsRepository = container.productsRepository as IProductsRepository;
    const fileStorageService = container.fileStorageService as IFileStorageService;

    container.createProductUseCase = new CreateProductUseCase(
        productsRepository,
        fileStorageService
    );

    container.getProductUseCase = new GetProductUseCase(productsRepository);

    container.getAllProductsUseCase = new GetAllProductsUseCase(productsRepository);

    container.updateProductUseCase = new UpdateProductUseCase(
        productsRepository,
        fileStorageService
    );

    container.deleteProductUseCase = new DeleteProductUseCase(
        productsRepository,
        fileStorageService
    );
}
