export enum PaymentMethodType {
    CASH_ON_DELIVERY = 'cash_on_delivery',
    ELECTRONIC_PAYMENT = 'electronic_payment'
}

export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress'
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id: string;
    phone_number: string;
    customer_name: string;
    area_name: string;
    street_name?: string;
    building_number?: string;
    additional_notes?: string;
    payment_method: PaymentMethodType;
    status: OrderStatus;
    total_amount: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderResponse {
    id: string;
    phone_number: string;
    customer_name: string;
    area_name: string;
    street_name?: string;
    building_number?: string;
    additional_notes?: string;
    payment_method: PaymentMethodType;
    status: OrderStatus;
    total_amount: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

