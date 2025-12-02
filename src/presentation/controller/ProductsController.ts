import { Request, Response } from "express";
import {
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
    FilterProductsUseCase
} from "@/application/use-cases/Products/index";


export class ProductsController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getAllProductsUseCase: GetAllProductsUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase,
        private searchProductsUseCase: SearchProductsUseCase,
        private filterProductsUseCase: FilterProductsUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { name, description, category, colors, sizes, status } = req.body;
            const imageFiles = req.files as Express.Multer.File[];

            // Parse colors if it's still a string (fallback)
            let parsedColors = colors;
            if (colors && typeof colors === 'string') {
                try {
                    parsedColors = JSON.parse(colors);
                } catch {
                    // If JSON parsing fails, try comma-separated
                    parsedColors = colors.includes(',')
                        ? colors.split(',').map((c: string) => c.trim()).filter((c: string) => c)
                        : [colors.trim()];
                }
            }

            // Parse sizes if it's still a string (fallback)
            let parsedSizes = sizes;
            if (typeof sizes === 'string') {
                parsedSizes = JSON.parse(sizes);
            }

            const result = await this.createProductUseCase.execute({
                name,
                description,
                category,
                colors: parsedColors,
                sizes: parsedSizes,
                status,
                imageFiles,
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: "Product created successfully",
            });
        } catch (error: any) {
            console.error('Create Product Error:', error);
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
            const { name, description, category, colors, sizes, status, keepExistingImages } = req.body;
            const imageFiles = req.files as Express.Multer.File[];

            let parsedColors = colors;
            if (colors && typeof colors === 'string') {
                try {
                    parsedColors = JSON.parse(colors);
                } catch {
                    parsedColors = colors.includes(',')
                        ? colors.split(',').map((c: string) => c.trim()).filter((c: string) => c)
                        : [colors.trim()];
                }
            }

            let parsedSizes = sizes;
            if (sizes && typeof sizes === 'string') {
                parsedSizes = JSON.parse(sizes);
            }

            const result = await this.updateProductUseCase.execute({
                id,
                name,
                description,
                category,
                colors: parsedColors,
                sizes: parsedSizes,
                status,
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

    async search(req: Request, res: Response) {
        try {
            const { name } = req.query;
            if (!name || typeof name !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "Search term is required",
                });
            }
            const result = await this.searchProductsUseCase.execute({ name });
            return res.status(200).json({
                success: true,
                data: result,
                count: result.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not search products",
            });
        }
    }

    async filter(req: Request, res: Response) {
        try {
            const { categories, minPrice, maxPrice } = req.query;
            const result = await this.filterProductsUseCase.execute({
                categories: categories ? (Array.isArray(categories) ? categories as string[] : [categories as string]) : undefined,
                minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
            });
            return res.status(200).json({
                success: true,
                data: result,
                count: result.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not filter products",
            });
        }
    }
}
