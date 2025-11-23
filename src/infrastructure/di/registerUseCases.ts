import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { IProductsRepository } from '../../domian/repository/IProductsRepository';

export function registerUseCases(container: any) {
    container.createProductUseCase = new CreateProductUseCase(container.productsRepository as IProductsRepository);
}
