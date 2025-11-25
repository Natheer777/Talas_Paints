import { Router, Request, Response } from "express";
import { ProductsController } from "../controller/ProductsController";
import {
    validateCreateProduct,
    validateUpdateProduct,
    validateGetProduct,
    validateDeleteProduct,
    handleValidationResult
} from "../validation/productValidation";
import { ValidationMiddleware } from "../middleware/ValidationMiddleware";
import { uploadMultiple } from "../middleware/UploadMiddleware";

export function createProductRouter(productsController: ProductsController) {
    const router = Router();

    // Create product
    router.post(
        "/products",
        uploadMultiple,
        validateCreateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.create(req, res)
    );

    // Get all products
    router.get(
        "/products",
        (req: Request, res: Response) => productsController.getAll(req, res)
    );

    // Get product by ID
    router.get(
        "/products/:id",
        validateGetProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.getById(req, res)
    );

    // Update product
    router.put(
        "/products/:id",
        uploadMultiple,
        validateUpdateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.update(req, res)
    );

    // Delete product
    router.delete(
        "/products/:id",
        validateDeleteProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.delete(req, res)
    );

    return router;
}
