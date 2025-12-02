export interface CartItem {
    id: string;
    phone_number: string;
    product_id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Cart {
    phone_number: string;
    items: CartItem[];
    totalAmount: number;
}
