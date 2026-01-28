import { Pool } from 'pg';
import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { Order, OrderItem, OrderStatus } from '@/domian/entities/Order';
import { v4 as uuidv4 } from 'uuid';

export class OrderRepository implements IOrderRepository {
    constructor(private readonly pool: Pool) { }

    async create(
        order: Omit<Order, 'createdAt' | 'updatedAt' | 'orderNumber' | 'items'>,
        items: Omit<OrderItem, 'id' | 'order_id' | 'createdAt' | 'updatedAt'>[]
    ): Promise<Order> {
        // Get the current timestamp from database for consistency
        const now = new Date();

        const preparedItems = items.map((item: any) => ({
            id: uuidv4(),
            order_id: order.id,
            product_id: item.product_id || item.productId,
            offer_id: item.offer_id || item.offerId || null,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
            createdAt: now,
            updatedAt: now
        }));

        const query = `
            INSERT INTO orders (
                id, phone_number, customer_name, area_name, street_name,
                building_number, additional_notes, delivery_agent_name,
                payment_method, status, total_amount, items, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
            RETURNING *
        `;

        const values = [
            order.id,
            order.phone_number,
            order.customer_name,
            order.area_name,
            order.street_name,
            order.building_number,
            order.additional_notes,
            order.delivery_agent_name,
            order.payment_method,
            order.status,
            order.total_amount,
            JSON.stringify(preparedItems),
            now  // Use the same timestamp for both created_at and updated_at
        ];

        const result = await this.pool.query(query, values);
        return this.mapRowToOrder(result.rows[0]);
    }


    async findById(id: string): Promise<Order | null> {
        const query = `
            SELECT 
                o.*,
                (
                    SELECT jsonb_agg(
                        item || jsonb_build_object(
                            'product', (
                                SELECT jsonb_build_object(
                                    'id', p.id,
                                    'name', p.name,
                                    'description', p.description,
                                    'images', p.images,
                                    'status', p.status,
                                    'colors', p.colors,
                                    'sizes', p.sizes,
                                    'category', (
                                        SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                        FROM categories c
                                        WHERE c.id = p.category_id
                                    )
                                )
                                FROM products p
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'category', (
                                SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                FROM categories c 
                                JOIN products p ON c.id = p.category_id 
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'offer', (
                                SELECT row_to_json(off) 
                                FROM offers off 
                                WHERE (
                                    (item->>'offer_id' IS NOT NULL AND off.id::text = item->>'offer_id')
                                    OR 
                                    (item->>'offer_id' IS NULL AND off.product_id::text = COALESCE(item->>'product_id', item->>'productId') AND off.status = 'VISIBLE')
                                )
                                LIMIT 1
                            )
                        )
                    )
                    FROM jsonb_array_elements(o.items) AS item
                ) as enriched_items
            FROM orders o 
            WHERE o.id = $1
        `;
        const result = await this.pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        if (row.enriched_items) {
            row.items = row.enriched_items;
        }

        return this.mapRowToOrder(row);
    }


    async findByPhoneNumber(phoneNumber: string): Promise<Order[]> {
        const query = `
            SELECT 
                o.*,
                (
                    SELECT jsonb_agg(
                        item || jsonb_build_object(
                            'product', (
                                SELECT jsonb_build_object(
                                    'id', p.id,
                                    'name', p.name,
                                    'description', p.description,
                                    'images', p.images,
                                    'status', p.status,
                                    'colors', p.colors,
                                    'sizes', p.sizes,
                                    'category', (
                                        SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                        FROM categories c
                                        WHERE c.id = p.category_id
                                    )
                                )
                                FROM products p
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'category', (
                                SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                FROM categories c 
                                JOIN products p ON c.id = p.category_id 
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'offer', (
                                SELECT row_to_json(off) 
                                FROM offers off 
                                WHERE (
                                    (item->>'offer_id' IS NOT NULL AND off.id::text = item->>'offer_id')
                                    OR 
                                    (item->>'offer_id' IS NULL AND off.product_id::text = COALESCE(item->>'product_id', item->>'productId') AND off.status = 'VISIBLE')
                                )
                                LIMIT 1
                            )
                        )
                    )
                    FROM jsonb_array_elements(o.items) AS item
                ) as enriched_items
            FROM orders o 
            WHERE o.phone_number = $1 
            ORDER BY o.created_at DESC
        `;
        const result = await this.pool.query(query, [phoneNumber]);
        return result.rows.map(row => {
            if (row.enriched_items) {
                row.items = row.enriched_items;
            }
            return this.mapRowToOrder(row);
        });
    }


    async findAll(limit?: number, offset?: number): Promise<Order[]> {
        let query = `
            SELECT 
                o.*,
                (
                    SELECT jsonb_agg(
                        item || jsonb_build_object(
                            'product', (
                                SELECT jsonb_build_object(
                                    'id', p.id,
                                    'name', p.name,
                                    'description', p.description,
                                    'images', p.images,
                                    'status', p.status,
                                    'colors', p.colors,
                                    'sizes', p.sizes,
                                    'category', (
                                        SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                        FROM categories c
                                        WHERE c.id = p.category_id
                                    )
                                )
                                FROM products p
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'category', (
                                SELECT jsonb_build_object('id', c.id, 'name', c.name)
                                FROM categories c 
                                JOIN products p ON c.id = p.category_id 
                                WHERE p.id::text = COALESCE(item->>'product_id', item->>'productId')
                            ),
                            'offer', (
                                SELECT row_to_json(off) 
                                FROM offers off 
                                WHERE (
                                    (item->>'offer_id' IS NOT NULL AND off.id::text = item->>'offer_id')
                                    OR 
                                    (item->>'offer_id' IS NULL AND off.product_id::text = COALESCE(item->>'product_id', item->>'productId') AND off.status = 'VISIBLE')
                                )
                                LIMIT 1
                            )
                        )
                    )
                    FROM jsonb_array_elements(o.items) AS item
                ) as enriched_items
            FROM orders o 
            ORDER BY o.created_at DESC
        `;
        const values: any[] = [];

        if (limit !== undefined) {
            query += ` LIMIT $1`;
            values.push(limit);
            if (offset !== undefined) {
                query += ` OFFSET $2`;
                values.push(offset);
            }
        }

        const result = await this.pool.query(query, values);
        return result.rows.map(row => {
            if (row.enriched_items) {
                row.items = row.enriched_items;
            }
            return this.mapRowToOrder(row);
        });
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

        return this.mapRowToOrder(result.rows[0]);
    }


    async delete(id: string): Promise<void> {
        const query = `DELETE FROM orders WHERE id = $1`;
        const result = await this.pool.query(query, [id]);

        if (result.rowCount === 0) {
            throw new Error('Order not found');
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


    private mapRowToOrder(row: any): Order {
        return {
            id: row.id,
            phone_number: row.phone_number,
            customer_name: row.customer_name,
            area_name: row.area_name,
            street_name: row.street_name,
            building_number: row.building_number,
            additional_notes: row.additional_notes,
            delivery_agent_name: row.delivery_agent_name,
            payment_method: row.payment_method,
            status: row.status as OrderStatus,
            total_amount: parseFloat(row.total_amount),
            orderNumber: row.order_number,
            items: this.mapJsonbToOrderItems(row.items),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }


    private mapJsonbToOrderItems(jsonbItems: any): OrderItem[] {
        if (!jsonbItems || !Array.isArray(jsonbItems)) {
            return [];
        }

        return jsonbItems.map(item => {
            // Create a shallow copy of the product to avoid mutating the original if it's cached
            const product = item.product ? { ...item.product } : undefined;

            // Filter colors and sizes to only show the selected ones in the response
            if (product) {
                if (item.color && Array.isArray(product.colors)) {
                    product.colors = product.colors.filter((c: string) => c === item.color);
                    // If for some reason the selected color isn't in the list, keep it as the only option
                    if (product.colors.length === 0) product.colors = [item.color];
                }
                if (item.size && Array.isArray(product.sizes)) {
                    product.sizes = product.sizes.filter((s: any) => s.size === item.size);
                }
            }

            return {
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id || item.productId,
                offer_id: item.offer_id || item.offerId || null,
                offerType: item.offer ? item.offer.type : null,
                quantity: item.quantity,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                color: item.color,
                size: item.size,
                product: product,
                category: item.category || undefined,
                offer: item.offer || undefined,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt)
            };
        });
    }
}

