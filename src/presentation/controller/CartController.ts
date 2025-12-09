import { Request, Response } from "express";
import {
    AddToCartUseCase,
    GetCartUseCase,
    UpdateCartItemUseCase,
    RemoveFromCartUseCase,
    ClearCartUseCase
} from "@/application/use-cases/Cart/index";

export class CartController {
    constructor(
        private addToCartUseCase: AddToCartUseCase,
        private getCartUseCase: GetCartUseCase,
        private updateCartItemUseCase: UpdateCartItemUseCase,
        private removeFromCartUseCase: RemoveFromCartUseCase,
        private clearCartUseCase: ClearCartUseCase
    ) { }

    async addToCart(req: Request, res: Response) {
        try {
            const {
                productId,
                quantity,
                customerName,
                phoneNumber,
                areaName,
                streetName,
                buildingNumber,
                additionalNotes,
                paymentMethod
            } = req.body;

            const result = await this.addToCartUseCase.execute({
                phoneNumber,
                productId,
                quantity: parseInt(quantity),
                customerName,
                areaName,
                streetName,
                buildingNumber,
                additionalNotes,
                paymentMethod,
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: "Product added to cart successfully",
            });
        } catch (error: any) {
            console.error('Add to Cart Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || "Could not add product to cart",
            });
        }
    }

    async getCart(req: Request, res: Response) {
        try {
            const { phoneNumber } = req.query as { phoneNumber: string };

            const result = await this.getCartUseCase.execute({ phoneNumber });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve cart",
            });
        }
    }

    async updateCartItem(req: Request, res: Response) {
        try {
            const { phoneNumber, cartItemId, quantity } = req.body;

            const result = await this.updateCartItemUseCase.execute({
                phoneNumber,
                cartItemId,
                quantity: parseInt(quantity),
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: "Cart item updated successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not update cart item",
            });
        }
    }

    async removeFromCart(req: Request, res: Response) {
        try {
            const { phoneNumber, cartItemId } = req.body;

            await this.removeFromCartUseCase.execute({
                phoneNumber,
                cartItemId,
            });

            return res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not remove item from cart",
            });
        }
    }

    async clearCart(req: Request, res: Response) {
        try {
            const { phoneNumber } = req.body;

            await this.clearCartUseCase.execute({ phoneNumber });

            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not clear cart",
            });
        }
    }
}
