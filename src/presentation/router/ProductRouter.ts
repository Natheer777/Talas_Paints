import { Router, Request, Response } from "express";
import { ProductsController } from "../controller/ProductsController";
import { validateCreateProduct, handleValidationResult , vliadateDeleteProduct} from "../validation/productValidation";
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
    router.delete(
        "/delete",
        vliadateDeleteProduct,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => productsController.delete(req, res)

    )
    return router;
}
