import { Router, Request, Response } from "express";
import { CartController } from "../controller/CartController";
import { validateAddToCart, validateUpdateCartItem, validateGetCart, validateRemoveFromCart, validateClearCart, handleValidationResult } from "../validation/cartValidation";
import { uploadNone } from "../middleware/UploadMiddleware";

export function createCartRouter(cartController: CartController) {
    const router = Router();

    router.get(
        "/cart",
        validateGetCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.getCart(req, res)
    );

    router.post(
        "/cart/items",
        uploadNone,
        validateAddToCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.addToCart(req, res)
    );

    router.put(
        "/cart/items",
        uploadNone,
        validateUpdateCartItem,
        handleValidationResult,
        (req: Request, res: Response) => cartController.updateCartItem(req, res)
    );

    router.delete(
        "/cart/items",
        uploadNone,
        validateRemoveFromCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.removeFromCart(req, res)
    );

    router.delete(
        "/cart",
        uploadNone,
        validateClearCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.clearCart(req, res)
    );

    router.post(
        "/cart/items",
        uploadNone,
        validateAddToCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.addToCart(req, res)
    );

    router.put(
        "/cart/items",
        uploadNone,
        validateUpdateCartItem,
        handleValidationResult,
        (req: Request, res: Response) => cartController.updateCartItem(req, res)
    );

    router.delete(
        "/cart/items",
        uploadNone,
        validateRemoveFromCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.removeFromCart(req, res)
    );

    router.delete(
        "/cart",
        uploadNone,
        validateClearCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.clearCart(req, res)
    );

    return router;
}
