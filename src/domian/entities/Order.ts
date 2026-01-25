export enum PaymentMethodType {
    CASH_ON_DELIVERY = 'cash_on_delivery',
    ELECTRONIC_PAYMENT = 'electronic_payment'
}

export enum OrderStatus {
    PENDING = 'pending',
    ORDERED = 'ordered',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress'
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    offer_id?: string | null;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    product?: any;
    category?: any;
    offer?: any;
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
    delivery_agent_name: string;
    payment_method: PaymentMethodType;
    status: OrderStatus;
    total_amount: number;
    orderNumber: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export type OrderResponse = Order;

