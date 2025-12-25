import { Request, Response } from "express";
import {
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    GetAllProductsUseCase,
    GetAllProductsPaginatedUseCase,
    GetProductsWithActiveOffersUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
    FilterProductsUseCase
} from "@/application/use-cases/Products/index";


import { ICategoriesRepository } from "@/domian/repository/ICategoriesRepository";

export class ProductsController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private getAllProductsUseCase: GetAllProductsUseCase,
        private getAllProductsPaginatedUseCase: GetAllProductsPaginatedUseCase,
        private getProductsWithActiveOffersUseCase: GetProductsWithActiveOffersUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase,
        private searchProductsUseCase: SearchProductsUseCase,
        private filterProductsUseCase: FilterProductsUseCase,
        private categoriesRepository: ICategoriesRepository
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { name, description, category, colors, sizes, status } = req.body;
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
            const category = await this.categoriesRepository.findById(result.category_id);
            const { category_id, ...rest } = result;
            return res.status(200).json({
                success: true,
                data: {
                    ...rest,
                    category: category ? { id: category.id, name: category.name } : null,
                },
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
            const { page, limit } = req.query;

            const hasPagination = page !== undefined || limit !== undefined;

            if (hasPagination) {
                const pageNum = page ? parseInt(page as string, 10) : undefined;
                const limitNum = limit ? parseInt(limit as string, 10) : undefined;

                if (pageNum !== undefined && (isNaN(pageNum) || pageNum < 1)) {
                    return res.status(400).json({
                        success: false,
                        message: "Page must be a positive integer",
                    });
                }

                if (limitNum !== undefined && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
                    return res.status(400).json({
                        success: false,
                        message: "Limit must be a positive integer between 1 and 100",
                    });
                }

                const result = await this.getAllProductsPaginatedUseCase.execute({
                    page: pageNum,
                    limit: limitNum
                });
                const productsWithCategory = await Promise.all(result.data.map(async (prod) => {
                    const cat = await this.categoriesRepository.findById(prod.category_id);
                    const { category_id, ...rest } = prod;
                    return {
                        ...rest,
                        category: cat ? { id: cat.id, name: cat.name } : null,
                    };
                }));
                return res.status(200).json({
                    success: true,
                    data: productsWithCategory,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        totalPages: result.totalPages,
                        hasNextPage: result.hasNextPage,
                        hasPrevPage: result.hasPrevPage
                    }
                });
            } else {
                const result = await this.getAllProductsUseCase.execute();
                // Attach category name for each product
                const productsWithCategory = await Promise.all(result.map(async (prod) => {
                    const cat = await this.categoriesRepository.findById(prod.category_id);
                    const { category_id, ...rest } = prod;
                    return {
                        ...rest,
                        category: cat ? { id: cat.id, name: cat.name } : null,
                    };
                }));
                return res.status(200).json({
                    success: true,
                    data: productsWithCategory,
                    count: productsWithCategory.length,
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve products",
            });
        }
    }

    async getAllWithoutPagination(req: Request, res: Response) {
        try {
            const result = await this.getAllProductsUseCase.execute();
            // Attach category name for each product
            const productsWithCategory = await Promise.all(result.map(async (prod) => {
                const cat = await this.categoriesRepository.findById(prod.category_id);
                return {
                    ...prod,
                    category: cat ? { id: cat.id, name: cat.name } : null,
                };
            }));
            return res.status(200).json({
                success: true,
                data: productsWithCategory,
                count: productsWithCategory.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve products",
            });
        }
    }

    async getProductsWithActiveOffers(req: Request, res: Response) {
        try {
            const result = await this.getProductsWithActiveOffersUseCase.execute();
            return res.status(200).json({
                success: true,
                data: result,
                count: result.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve products with active offers",
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, category, colors, sizes, status, keepExistingImages, imagesToDelete } = req.body;
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

            // Parse imagesToDelete if it's a string
            let parsedImagesToDelete = imagesToDelete;
            if (imagesToDelete && typeof imagesToDelete === 'string') {
                try {
                    parsedImagesToDelete = JSON.parse(imagesToDelete);
                } catch {
                    // If it's a comma-separated string
                    parsedImagesToDelete = imagesToDelete.includes(',')
                        ? imagesToDelete.split(',').map((url: string) => url.trim()).filter((url: string) => url)
                        : [imagesToDelete.trim()];
                }
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
                imagesToDelete: parsedImagesToDelete,
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
