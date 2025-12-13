import { Order, OrderItem, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
    create(order: Omit<Order, 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'order_id' | 'createdAt' | 'updatedAt'>[]): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByPhoneNumber(phoneNumber: string): Promise<Order[]>;
    findAll(limit?: number, offset?: number): Promise<Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
    countByPhoneNumber(phoneNumber: string): Promise<number>;
}

