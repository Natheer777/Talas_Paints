import { ICartRepository } from "@/domian/repository/ICartRepository";
import { IProductsRepository } from "@/domian/repository/IProductsRepository";
import { CartItem } from "@/domian/entities/Cart";

interface UpdateCartItemDTO {
    phoneNumber: string;
    cartItemId: string;
    quantity: number;
}

export class UpdateCartItemUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productsRepository: IProductsRepository
    ) { }

    async execute(dto: UpdateCartItemDTO): Promise<CartItem> {
        const { phoneNumber, cartItemId, quantity } = dto;

        // 1. Validate cart item exists
        const cartItem = await this.cartRepository.findItemById(cartItemId);
        if (!cartItem) {
            throw new Error("Cart item not found");
        }

        // 2. Validate ownership
        if (cartItem.phone_number !== phoneNumber) {
            throw new Error("Unauthorized: Cart item does not belong to this user");
        }

        // 3. Validate stock
        const product = await this.productsRepository.findById(cartItem.product_id);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.quantity < quantity) {
            throw new Error(`Insufficient stock. Only ${product.quantity} items available`);
        }

        // 4. Update quantity
        return this.cartRepository.updateItemQuantity(cartItemId, quantity);
    }
}
