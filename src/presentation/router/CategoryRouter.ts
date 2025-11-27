import { Router, Request, Response } from "express";
import { CategoriesController } from "../controller/CategoriesController";
import {
    validateCreateCategory,
    validateUpdateCategory,
    validateGetCategory,
    validateDeleteCategory,
    handleValidationResult
} from "../validation/categoryValidation";
import { ValidationMiddleware } from "../middleware/ValidationMiddleware";
import { uploadSingle } from "../middleware/UploadMiddleware";

export function createCategoryRouter(categoriesController: CategoriesController) {
    const router = Router();

    router.post(
        "/categories",
        uploadSingle,
        validateCreateCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.create(req, res)
    );

    router.get(
        "/categories",
        (req: Request, res: Response) => categoriesController.getAll(req, res)
    );

    router.get(
        "/categories/:id",
        validateGetCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.getById(req, res)
    );

    router.put(
        "/categories/:id",
        uploadSingle,
        validateUpdateCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.update(req, res)
    );

    router.delete(
        "/categories/:id",
        validateDeleteCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.delete(req, res)
    );

    return router;
}
