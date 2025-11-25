import { Request, Response } from "express";
import { CreateProductUseCase } from "../../application/use-cases/CreateProductUseCase";
import { DeleteProductUseCase } from "@/application/use-cases/DeleteProductUseCase";

export class ProductsController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase
    ) {}

    async create(req: Request, res: Response) {
        try {
            const { name, description, category, price, images } = req.body;

            const result = await this.createProductUseCase.execute({
                name,
                description,
                category,
                price,
                images,
            });

            return res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create product",
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
