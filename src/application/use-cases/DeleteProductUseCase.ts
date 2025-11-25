import { IProductsRepository } from "@/domian/repository/IProductsRepository";
import {IFileStorageService} from "../interface/IFileStorageService";

export interface DeleteProductRequest{
    id: string;
}

export class DeleteProductUseCase{
    constructor(private productsRepository: IProductsRepository, private fileStorageService: IFileStorageService){}

    async execute(request: DeleteProductRequest): Promise<void>{
        const {id} = request;
        const product = await this.productsRepository.findById(id);
        if(!product){
            throw new Error('Product not found');
        }
        if(product.images){
            for(const image of product.images){
                await this.fileStorageService.DeleteOldImage(image);
            }
        }
        await this.productsRepository.delete(id);
    }
}