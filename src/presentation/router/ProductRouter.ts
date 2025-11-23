import { Router, Request, Response } from "express";
import { ProductsController } from "../controller/ProductsController";
import { validateCreateProduct, handleValidationResult } from "../validation/productValidation";
import { ValidationMiddleware } from "../middleware/ValidationMiddleware";

export function createProductRouter(productsController: ProductsController) {
    const router = Router();
    router.post(
        "/products",
        validateCreateProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.create(req, res)
    );
    return router;
}
