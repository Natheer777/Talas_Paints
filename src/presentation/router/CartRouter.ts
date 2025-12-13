import { Router, Request, Response } from "express";
import { CartController } from "../controller/CartController";
import { validateAddToCart, validateUpdateCartItem, validateGetCart, validateRemoveFromCart, validateClearCart, handleValidationResult } from "../validation/cartValidation";
import { uploadNone } from "../middleware/UploadMiddleware";
import { RateLimitMiddleware } from "../middleware/RateLimitMiddleware";
import { RateLimitConfigurations } from "../../infrastructure/config/RateLimitConfigurations";
import Container from "../../infrastructure/di/container";

export function createCartRouter(cartController: CartController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiter for cart operations (50 requests per minute)
    const cartLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.CART_OPERATIONS
    );

    router.get(
        "/cart",
        cartLimit.handle(), 
        validateGetCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.getCart(req, res)
    );

    router.post(
        "/cart/items",
        cartLimit.handle(),
        uploadNone,
        validateAddToCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.addToCart(req, res)
    );

    router.put(
        "/cart/items",
        cartLimit.handle(), 
        uploadNone,
        validateUpdateCartItem,
        handleValidationResult,
        (req: Request, res: Response) => cartController.updateCartItem(req, res)
    );

    router.delete(
        "/cart/items",
        cartLimit.handle(), 
        uploadNone,
        validateRemoveFromCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.removeFromCart(req, res)
    );

    router.delete(
        "/cart",
        cartLimit.handle(), 
        uploadNone,
        validateClearCart,
        handleValidationResult,
        (req: Request, res: Response) => cartController.clearCart(req, res)
    );

    return router;
}
