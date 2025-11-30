import { ICartRepository } from "@/domian/repository/ICartRepository";
import { IProductsRepository } from "@/domian/repository/IProductsRepository";
import { CartItem } from "@/domian/entities/Cart";
import { v4 as uuidv4 } from 'uuid';

interface AddToCartDTO {
    phoneNumber: string;
    productId: string;
    quantity: number;
}

export class AddToCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productsRepository: IProductsRepository
    ) { }

    async execute(dto: AddToCartDTO): Promise<CartItem> {
        const { phoneNumber, productId, quantity } = dto;

        // 1. Validate Product and Stock
        const product = await this.productsRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        if (product.quantity < quantity) {
            throw new Error(`Insufficient stock. Only ${product.quantity} items available`);
        }

        // 2. Check if item already exists in cart
        const existingItem = await this.cartRepository.findItemByProduct(phoneNumber, productId);

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            // Re-validate stock for total quantity
            if (product.quantity < newQuantity) {
                throw new Error(`Insufficient stock. Cannot add ${quantity} more items. Total in cart would be ${newQuantity}, but only ${product.quantity} available.`);
            }

            return this.cartRepository.updateItemQuantity(existingItem.id, newQuantity);
        } else {
            // Create new item
            const newItem: Omit<CartItem, 'createdAt' | 'updatedAt'> = {
                id: uuidv4(),
                phone_number: phoneNumber,
                product_id: productId,
                quantity: quantity,
                price: product.price // Snapshot price
            };

            return this.cartRepository.addItem(newItem);
        }
    }
}
