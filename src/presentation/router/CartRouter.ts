import { Router, Request, Response } from "express";
import { CartController } from "../controller/CartController";

export function createCartRouter(cartController: CartController) {
    const router = Router();

    router.get(
        "/cart/:phoneNumber",
        (req: Request, res: Response) => cartController.getCart(req, res)
    );

    router.post(
        "/cart/:phoneNumber/items",
        (req: Request, res: Response) => cartController.addToCart(req, res)
    );

    router.put(
        "/cart/:phoneNumber/items/:cartItemId",
        (req: Request, res: Response) => cartController.updateCartItem(req, res)
    );

    router.delete(
        "/cart/:phoneNumber/items/:cartItemId",
        (req: Request, res: Response) => cartController.removeFromCart(req, res)
    );

    router.delete(
        "/cart/:phoneNumber",
        (req: Request, res: Response) => cartController.clearCart(req, res)
    );

    return router;
}
