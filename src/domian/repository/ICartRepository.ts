import { CartItem } from "../entities/Cart";

export interface ICartRepository {
    addItem(item: Omit<CartItem, 'createdAt' | 'updatedAt'>): Promise<CartItem>;
    findItemByProduct(phoneNumber: string, productId: string): Promise<CartItem | null>;
    findItemById(id: string): Promise<CartItem | null>;
    getItemsByPhoneNumber(phoneNumber: string): Promise<CartItem[]>;
    updateItemQuantity(id: string, quantity: number): Promise<CartItem>;
    removeItem(id: string): Promise<void>;
    clearCart(phoneNumber: string): Promise<void>;
}
