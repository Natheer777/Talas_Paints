import { Request, Response } from "express";
import { CreateProductUseCase } from "../../application/use-cases/CreateProductUseCase";

export class ProductsController {
    constructor(private createProductUseCase: CreateProductUseCase) { }

    async create(req: Request, res: Response) {
        try {
            const { name, description, category, price, images } = req.body;
            const result = await this.createProductUseCase.execute({ name, description, category, price, images });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Could not create product' });
        }
    }
}
