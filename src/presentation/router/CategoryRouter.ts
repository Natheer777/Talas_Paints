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
import { RateLimitMiddleware } from "../middleware/RateLimitMiddleware";
import { RateLimitConfigurations } from "../../infrastructure/config/RateLimitConfigurations";
import Container from "../../infrastructure/di/container";

export function createCategoryRouter(categoriesController: CategoriesController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiters for different operations
    const fileUploadLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.FILE_UPLOAD
    );

    const writeLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.WRITE_OPERATIONS
    );

    const deleteLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.DELETE_OPERATIONS
    );

    router.post(
        "/categories",
        fileUploadLimit.handle(), 
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
        writeLimit.handle(), 
        uploadSingle,
        validateUpdateCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.update(req, res)
    );

    router.delete(
        "/categories/:id",
        deleteLimit.handle(), 
        validateDeleteCategory,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => categoriesController.delete(req, res)
    );

    return router;
}
