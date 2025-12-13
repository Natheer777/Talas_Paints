import { Pool } from 'pg';
import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order, OrderItem, OrderStatus } from '@/domian/entities/Order';
import { v4 as uuidv4 } from 'uuid';

export class OrderRepository implements IOrderRepository {
    constructor(private pool: Pool) { }

    async create(
        order: Omit<Order, 'createdAt' | 'updatedAt' | 'items'>,
        items: Omit<OrderItem, 'id' | 'order_id' | 'createdAt' | 'updatedAt'>[]
    ): Promise<Order> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Insert order
            const orderQuery = `
                INSERT INTO orders (
                    id, phone_number, customer_name, area_name, street_name, 
                    building_number, additional_notes, payment_method, status, total_amount, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            const orderValues = [
                order.id,
                order.phone_number,
                order.customer_name,
                order.area_name,
                order.street_name,
                order.building_number,
                order.additional_notes,
                order.payment_method,
                order.status,
                order.total_amount
            ];

            const orderResult = await client.query(orderQuery, orderValues);
            const createdOrder = orderResult.rows[0];

            // Insert order items
            const orderItems: OrderItem[] = [];
            for (const item of items) {
                const itemId = uuidv4();
                const itemQuery = `
                    INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING *
                `;
                const itemValues = [itemId, order.id, item.product_id, item.quantity, item.price];
                const itemResult = await client.query(itemQuery, itemValues);
                orderItems.push(this.mapToOrderItem(itemResult.rows[0]));
            }

            await client.query('COMMIT');

            return {
                ...this.mapToOrder(createdOrder),
                items: orderItems
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<Order | null> {
        const orderQuery = `SELECT * FROM orders WHERE id = $1`;
        const orderResult = await this.pool.query(orderQuery, [id]);

        if (orderResult.rows.length === 0) {
            return null;
        }

        const order = this.mapToOrder(orderResult.rows[0]);

        // Fetch order items
        const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`;
        const itemsResult = await this.pool.query(itemsQuery, [id]);
        const items = itemsResult.rows.map(row => this.mapToOrderItem(row));

        return {
            ...order,
            items
        };
    }

    async findByPhoneNumber(phoneNumber: string): Promise<Order[]> {
        const orderQuery = `SELECT * FROM orders WHERE phone_number = $1 ORDER BY created_at DESC`;
        const orderResult = await this.pool.query(orderQuery, [phoneNumber]);

        const orders = orderResult.rows.map(row => this.mapToOrder(row));

        // Fetch items for each order
        for (const order of orders) {
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`;
            const itemsResult = await this.pool.query(itemsQuery, [order.id]);
            order.items = itemsResult.rows.map(row => this.mapToOrderItem(row));
        }

        return orders;
    }

    async findAll(limit?: number, offset?: number): Promise<Order[]> {
        let query = `SELECT * FROM orders ORDER BY created_at DESC`;
        const values: any[] = [];

        if (limit !== undefined) {
            query += ` LIMIT $1`;
            values.push(limit);
            if (offset !== undefined) {
                query += ` OFFSET $2`;
                values.push(offset);
            }
        }

        const orderResult = await this.pool.query(query, values);
        const orders = orderResult.rows.map(row => this.mapToOrder(row));

        // Fetch items for each order
        for (const order of orders) {
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`;
            const itemsResult = await this.pool.query(itemsQuery, [order.id]);
            order.items = itemsResult.rows.map(row => this.mapToOrderItem(row));
        }

        return orders;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const query = `
            UPDATE orders 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await this.pool.query(query, [status, id]);

        if (result.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = this.mapToOrder(result.rows[0]);

        // Fetch order items
        const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`;
        const itemsResult = await this.pool.query(itemsQuery, [id]);
        order.items = itemsResult.rows.map(row => this.mapToOrderItem(row));

        return order;
    }

    async delete(id: string): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Delete order items first (due to foreign key constraint)
            const deleteItemsQuery = `DELETE FROM order_items WHERE order_id = $1`;
            await client.query(deleteItemsQuery, [id]);

            // Delete the order
            const deleteOrderQuery = `DELETE FROM orders WHERE id = $1`;
            const result = await client.query(deleteOrderQuery, [id]);

            if (result.rowCount === 0) {
                throw new Error('Order not found');
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async count(): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM orders`;
        const result = await this.pool.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async countByPhoneNumber(phoneNumber: string): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM orders WHERE phone_number = $1`;
        const result = await this.pool.query(query, [phoneNumber]);
        return parseInt(result.rows[0].count, 10);
    }

    private mapToOrder(row: any): Order {
        return {
            id: row.id,
            phone_number: row.phone_number,
            customer_name: row.customer_name,
            area_name: row.area_name,
            street_name: row.street_name,
            building_number: row.building_number,
            additional_notes: row.additional_notes,
            payment_method: row.payment_method,
            status: row.status as OrderStatus,
            total_amount: parseFloat(row.total_amount),
            items: [],
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    private mapToOrderItem(row: any): OrderItem {
        return {
            id: row.id,
            order_id: row.order_id,
            product_id: row.product_id,
            quantity: row.quantity,
            price: parseFloat(row.price),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

