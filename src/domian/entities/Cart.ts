export enum PaymentMethodType {
    CASH_ON_DELIVERY = 'cash_on_delivery',
    ELECTRONIC_PAYMENT = 'electronic_payment'
}

export interface CustomerInfo {
    phone_number: string;
    customer_name: string;
    area_name: string;
    street_name?: string;
    building_number?: string;
    additional_notes?: string;
    payment_method: PaymentMethodType;
}

export interface CartItem extends CustomerInfo {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItemResponse {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Cart {
    phone_number: string;
    customer_name?: string;
    area_name?: string;
    street_name?: string;
    building_number?: string;
    additional_notes?: string;
    payment_method?: PaymentMethodType;
    items: CartItemResponse[];
    totalAmount: number;
}
