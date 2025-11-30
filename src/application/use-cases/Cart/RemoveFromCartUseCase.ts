import { ICartRepository } from "@/domian/repository/ICartRepository";

interface RemoveFromCartDTO {
    phoneNumber: string;
    cartItemId: string;
}

export class RemoveFromCartUseCase {
    constructor(private cartRepository: ICartRepository) { }

    async execute(dto: RemoveFromCartDTO): Promise<void> {
        const { phoneNumber, cartItemId } = dto;

        // 1. Validate cart item exists
        const cartItem = await this.cartRepository.findItemById(cartItemId);
        if (!cartItem) {
            throw new Error("Cart item not found");
        }

        // 2. Validate ownership
        if (cartItem.phone_number !== phoneNumber) {
            throw new Error("Unauthorized: Cart item does not belong to this user");
        }

        // 3. Remove item
        await this.cartRepository.removeItem(cartItemId);
    }
}
