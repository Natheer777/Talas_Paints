import { Offer, OfferStatus } from '@/domian/entities/Offer';
import { IOfferRepository } from '@/domian/repository/IOfferRepository';
import { Pool } from 'pg';


export class OfferRepository implements IOfferRepository {
    constructor(private db: Pool) { }

    async create(offer: Offer): Promise<Offer> {
        const query = `
            INSERT INTO offers (
                id, name, description, type, product_id, 
                discount_percentage, buy_quantity, get_quantity,
                status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            offer.id,
            offer.name,
            offer.description,
            offer.type,
            offer.product_id,
            offer.discount_percentage || null,
            offer.buy_quantity || null,
            offer.get_quantity || null,
            offer.status,
            offer.createdAt,
            offer.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToOffer(result.rows[0]);
    }

    async update(id: string, offer: Partial<Offer>): Promise<Offer | null> {
        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (offer.name !== undefined) {
            updateFields.push(`name = $${paramCounter++}`);
            values.push(offer.name);
        }

        if (offer.description !== undefined) {
            updateFields.push(`description = $${paramCounter++}`);
            values.push(offer.description);
        }

        if (offer.type !== undefined) {
            updateFields.push(`type = $${paramCounter++}`);
            values.push(offer.type);
        }

        if (offer.product_id !== undefined) {
            updateFields.push(`product_id = $${paramCounter++}`);
            values.push(offer.product_id);
        }

        if (offer.discount_percentage !== undefined) {
            updateFields.push(`discount_percentage = $${paramCounter++}`);
            values.push(offer.discount_percentage);
        }

        if (offer.buy_quantity !== undefined) {
            updateFields.push(`buy_quantity = $${paramCounter++}`);
            values.push(offer.buy_quantity);
        }

        if (offer.get_quantity !== undefined) {
            updateFields.push(`get_quantity = $${paramCounter++}`);
            values.push(offer.get_quantity);
        }

        if (offer.status !== undefined) {
            updateFields.push(`status = $${paramCounter++}`);
            values.push(offer.status);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = $${paramCounter++}`);
        values.push(new Date());

        // Add the ID as the last parameter
        values.push(id);

        const query = `
            UPDATE offers 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOffer(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM offers WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async getById(id: string): Promise<Offer | null> {
        const query = `SELECT * FROM offers WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOffer(result.rows[0]);
    }

    async getAll(): Promise<Offer[]> {
        const query = `SELECT * FROM offers ORDER BY created_at DESC`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToOffer(row));
    }

    /**
     * Map database row to Offer entity
     */
    private mapToOffer(row: any): Offer {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            type: row.type,
            product_id: row.product_id,
            discount_percentage: row.discount_percentage ? parseFloat(row.discount_percentage) : undefined,
            buy_quantity: row.buy_quantity ? parseInt(row.buy_quantity) : undefined,
            get_quantity: row.get_quantity ? parseInt(row.get_quantity) : undefined,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
