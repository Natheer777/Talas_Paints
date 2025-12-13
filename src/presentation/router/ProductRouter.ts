import { Router, Request, Response } from "express";
import { ProductsController } from "../controller/ProductsController";
import {
    validateCreateProduct,
    validateUpdateProduct,
    validateGetProduct,
    validateDeleteProduct,
    handleValidationResult,
    parseMultipartArrays
} from "../validation/productValidation";
import { ValidationMiddleware } from "../middleware/ValidationMiddleware";
import { uploadMultiple } from "../middleware/UploadMiddleware";
import { RateLimitMiddleware } from "../middleware/RateLimitMiddleware";
import { RateLimitConfigurations } from "../../infrastructure/config/RateLimitConfigurations";
import Container from "../../infrastructure/di/container";

export function createProductRouter(productsController: ProductsController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create specific rate limiters for different operations
    const createProductRateLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.CREATE_PRODUCT
    );

    const writeOperationRateLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.WRITE_OPERATIONS
    );

    const deleteOperationRateLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.DELETE_OPERATIONS
    );

    const searchRateLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.SEARCH
    );

    router.post(
        "/products",
        createProductRateLimit.handle(), // Apply strict rate limit for product creation
        uploadMultiple,
        parseMultipartArrays,
        validateCreateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.create(req, res)
    );

    router.get(
        "/products",
        (req: Request, res: Response) => productsController.getAll(req, res)
    );

    router.get(
        "/products/all",
        (req: Request, res: Response) => productsController.getAllWithoutPagination(req, res)
    );

    router.get(
        "/products/search",
        searchRateLimit.handle(), 
        (req: Request, res: Response) => productsController.search(req, res)
    );

    router.get(
        "/products/filter",
        searchRateLimit.handle(), 
        (req: Request, res: Response) => productsController.filter(req, res)
    );

    router.get(
        "/products/active-offers",
        (req: Request, res: Response) => productsController.getProductsWithActiveOffers(req, res)
    );

    router.get(
        "/products/:id",
        validateGetProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.getById(req, res)
    );

    router.put(
        "/products/:id",
        writeOperationRateLimit.handle(), 
        uploadMultiple,
        parseMultipartArrays,
        validateUpdateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.update(req, res)
    );

    router.delete(
        "/products/:id",
        deleteOperationRateLimit.handle(), 
        validateDeleteProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.delete(req, res)
    );

    return router;
}
