import { Pool } from 'pg';
import { ICartRepository } from '@/domian/repository/ICartRepository';
import { CartItem } from '@/domian/entities/Cart';

export class CartRepository implements ICartRepository {
    constructor(private pool: Pool) { }

    async addItem(item: Omit<CartItem, 'createdAt' | 'updatedAt'>): Promise<CartItem> {
        const query = `
            INSERT INTO cart_items (id, phone_number, product_id, quantity, price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [item.id, item.phone_number, item.product_id, item.quantity, item.price];
        const result = await this.pool.query(query, values);
        return this.mapToEntity(result.rows[0]);
    }

    async findItemByProduct(phoneNumber: string, productId: string): Promise<CartItem | null> {
        const query = `SELECT * FROM cart_items WHERE phone_number = $1 AND product_id = $2`;
        const result = await this.pool.query(query, [phoneNumber, productId]);
        return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
    }

    async findItemById(id: string): Promise<CartItem | null> {
        const query = `SELECT * FROM cart_items WHERE id = $1`;
        const result = await this.pool.query(query, [id]);
        return result.rows.length ? this.mapToEntity(result.rows[0]) : null;
    }

    async getItemsByPhoneNumber(phoneNumber: string): Promise<CartItem[]> {
        const query = `SELECT * FROM cart_items WHERE phone_number = $1 ORDER BY created_at DESC`;
        const result = await this.pool.query(query, [phoneNumber]);
        return result.rows.map(row => this.mapToEntity(row));
    }

    async updateItemQuantity(id: string, quantity: number): Promise<CartItem> {
        const query = `
            UPDATE cart_items 
            SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await this.pool.query(query, [quantity, id]);
        if (!result.rows.length) throw new Error('Cart item not found');
        return this.mapToEntity(result.rows[0]);
    }

    async removeItem(id: string): Promise<void> {
        const query = `DELETE FROM cart_items WHERE id = $1`;
        await this.pool.query(query, [id]);
    }

    async clearCart(phoneNumber: string): Promise<void> {
        const query = `DELETE FROM cart_items WHERE phone_number = $1`;
        await this.pool.query(query, [phoneNumber]);
    }

    private mapToEntity(row: any): CartItem {
        return {
            id: row.id,
            phone_number: row.phone_number,
            product_id: row.product_id,
            quantity: row.quantity,
            price: parseFloat(row.price),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
