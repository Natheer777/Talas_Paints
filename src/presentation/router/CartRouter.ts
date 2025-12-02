import { Router, Request, Response } from "express";
import { CartController } from "../controller/CartController";

export function createCartRouter(cartController: CartController) {
    const router = Router();

    // Get user's cart
    router.get(
        "/cart/:phoneNumber",
        (req: Request, res: Response) => cartController.getCart(req, res)
    );

    // Add item to cart
    router.post(
        "/cart/:phoneNumber/items",
        (req: Request, res: Response) => cartController.addToCart(req, res)
    );

    // Update cart item quantity
    router.put(
        "/cart/:phoneNumber/items/:cartItemId",
        (req: Request, res: Response) => cartController.updateCartItem(req, res)
    );

    // Remove item from cart
    router.delete(
        "/cart/:phoneNumber/items/:cartItemId",
        (req: Request, res: Response) => cartController.removeFromCart(req, res)
    );

    // Clear entire cart
    router.delete(
        "/cart/:phoneNumber",
        (req: Request, res: Response) => cartController.clearCart(req, res)
    );

    return router;
}
