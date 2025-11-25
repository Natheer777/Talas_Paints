import { Request, Response } from "express";
import { CreateProductUseCase } from "@/application/use-cases/CreateProductUseCase";
import { DeleteProductUseCase } from "@/application/use-cases/DeleteProductUseCase";
import { GetProductUseCase } from "@/application/use-cases/GetProductUseCase";
import { GetAllProductsUseCase } from "@/application/use-cases/GetAllProductsUseCase";
import { UpdateProductUseCase } from "@/application/use-cases/UpdateProductUseCase";

export class ProductsController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getAllProductsUseCase: GetAllProductsUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { name, description, category, price } = req.body;
            const imageFiles = req.files as Express.Multer.File[];

            const result = await this.createProductUseCase.execute({
                name,
                description,
                category,
                price: parseFloat(price),
                imageFiles,
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: "Product created successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create product",
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const result = await this.getProductUseCase.execute({ id });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                message: error.message || "Product not found",
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllProductsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve products",
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, category, price, keepExistingImages } = req.body;
            const imageFiles = req.files as Express.Multer.File[];

            const result = await this.updateProductUseCase.execute({
                id,
                name,
                description,
                category,
                price: price ? parseFloat(price) : undefined,
                imageFiles,
                keepExistingImages: keepExistingImages === 'true',
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: "Product updated successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not update product",
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await this.deleteProductUseCase.execute({ id });

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete product",
            });
        }
    }
}
