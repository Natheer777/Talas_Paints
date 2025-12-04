import { AdsCard, AdsCardStatus } from '@/domian/entities/AdsCard';
import { IAdsCardRepository } from '@/domian/repository/IAdsCardRepository';
import { Pool } from 'pg';

export class AdsCardRepository implements IAdsCardRepository {
    constructor(private db: Pool) { }

    async create(adsCard: AdsCard): Promise<AdsCard> {
        const query = `
            INSERT INTO ads_cards (
                id, title, text, image_url, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            adsCard.id,
            adsCard.title,
            adsCard.text,
            adsCard.imageUrl,
            adsCard.status,
            adsCard.createdAt,
            adsCard.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToAdsCard(result.rows[0]);
    }

    async update(id: string, adsCard: Partial<AdsCard>): Promise<AdsCard | null> {
        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (adsCard.title !== undefined) {
            updateFields.push(`title = $${paramCounter++}`);
            values.push(adsCard.title);
        }

        if (adsCard.text !== undefined) {
            updateFields.push(`text = $${paramCounter++}`);
            values.push(adsCard.text);
        }

        if (adsCard.imageUrl !== undefined) {
            updateFields.push(`image_url = $${paramCounter++}`);
            values.push(adsCard.imageUrl);
        }

        if (adsCard.status !== undefined) {
            updateFields.push(`status = $${paramCounter++}`);
            values.push(adsCard.status);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = $${paramCounter++}`);
        values.push(new Date());

        // Add the ID as the last parameter
        values.push(id);

        const query = `
            UPDATE ads_cards
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToAdsCard(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM ads_cards WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async getById(id: string): Promise<AdsCard | null> {
        const query = `SELECT * FROM ads_cards WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToAdsCard(result.rows[0]);
    }

    async getAll(): Promise<AdsCard[]> {
        const query = `SELECT * FROM ads_cards ORDER BY created_at DESC`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToAdsCard(row));
    }

    async getActive(): Promise<AdsCard[]> {
        const query = `SELECT * FROM ads_cards WHERE status = $1 ORDER BY created_at DESC`;
        const result = await this.db.query(query, [AdsCardStatus.ACTIVE]);
        return result.rows.map(row => this.mapToAdsCard(row));
    }

    /**
     * Map database row to AdsCard entity
     */
    private mapToAdsCard(row: any): AdsCard {
        return {
            id: row.id,
            title: row.title,
            text: row.text,
            imageUrl: row.image_url,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
