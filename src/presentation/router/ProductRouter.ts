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

export function createProductRouter(productsController: ProductsController) {
    const router = Router();

    router.post(
        "/products",
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
        "/products/search",
        (req: Request, res: Response) => productsController.search(req, res)
    );

    router.get(
        "/products/filter",
        (req: Request, res: Response) => productsController.filter(req, res)
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
        uploadMultiple,
        parseMultipartArrays,
        validateUpdateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.update(req, res)
    );

    router.delete(
        "/products/:id",
        validateDeleteProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.delete(req, res)
    );

    return router;
}
