import { Request, Response } from "express";
import { CreateCategoryUseCase, GetCategoryUseCase, GetAllCategoriesUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase } from "@/application/use-cases/Category/index";


export class CategoriesController {
    constructor(
        private createCategoryUseCase: CreateCategoryUseCase,
        private getCategoryUseCase: GetCategoryUseCase,
        private getAllCategoriesUseCase: GetAllCategoriesUseCase,
        private updateCategoryUseCase: UpdateCategoryUseCase,
        private deleteCategoryUseCase: DeleteCategoryUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const imageFile = req.file as Express.Multer.File;
            const imageFiles = imageFile ? [imageFile] : [];

            const result = await this.createCategoryUseCase.execute({
                name,
                imageFiles,
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: "Category created successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create category",
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const result = await this.getCategoryUseCase.execute({ id });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                message: error.message || "Category not found",
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllCategoriesUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve categories",
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const imageFile = req.file as Express.Multer.File;

            const result = await this.updateCategoryUseCase.execute({
                id,
                name,
                imageFile,
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: "Category updated successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not update category",
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await this.deleteCategoryUseCase.execute({ id });

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete category",
            });
        }
    }
}
