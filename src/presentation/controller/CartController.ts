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
            const { productId, quantity } = req.body;
            // Support phone number from body or params
            const phoneNumber = req.body.phoneNumber || req.params.phoneNumber;

            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is required"
                });
            }

            const result = await this.addToCartUseCase.execute({
                phoneNumber,
                productId,
                quantity: parseInt(quantity),
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
            const { phoneNumber } = req.params;

            const result = await this.getCartUseCase.execute({ phoneNumber });

            if (!result) {
                return res.status(200).json({
                    success: true,
                    data: {
                        phone_number: phoneNumber,
                        items: [],
                        totalAmount: 0
                    },
                    message: "Cart is empty",
                });
            }

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
            const { phoneNumber, cartItemId } = req.params;
            const { quantity } = req.body;

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
            const { phoneNumber, cartItemId } = req.params;

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
            const { phoneNumber } = req.params;

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
