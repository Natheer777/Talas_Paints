import { Pool } from 'pg';
import { IFcmTokenRepository } from '@/domian/repository/IFcmTokenRepository';
import { FcmToken } from '@/domian/entities/FcmToken';
import { v4 as uuidv4 } from 'uuid';

export class FcmTokenRepository implements IFcmTokenRepository {
    constructor(private readonly pool: Pool) { }

    async save(token: Omit<FcmToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<FcmToken> {
        const query = `
            INSERT INTO fcm_tokens (id, phone_number, token, device_type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (phone_number, token) 
            DO UPDATE SET 
                device_type = EXCLUDED.device_type,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const values = [
            uuidv4(),
            token.phone_number,
            token.token,
            token.device_type || null
        ];

        const result = await this.pool.query(query, values);
        return this.mapRowToFcmToken(result.rows[0]);
    }

    async findByPhoneNumber(phoneNumber: string): Promise<FcmToken[]> {
        const query = `
            SELECT * FROM fcm_tokens
            WHERE phone_number = $1
            ORDER BY updated_at DESC
        `;

        const result = await this.pool.query(query, [phoneNumber]);
        return result.rows.map(row => this.mapRowToFcmToken(row));
    }

    async findByToken(token: string): Promise<FcmToken | null> {
        const query = `
            SELECT * FROM fcm_tokens
            WHERE token = $1
            LIMIT 1
        `;

        const result = await this.pool.query(query, [token]);
        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToFcmToken(result.rows[0]);
    }

    async delete(token: string): Promise<void> {
        const query = `
            DELETE FROM fcm_tokens
            WHERE token = $1
        `;

        await this.pool.query(query, [token]);
    }

    async deleteByPhoneNumber(phoneNumber: string): Promise<void> {
        const query = `
            DELETE FROM fcm_tokens
            WHERE phone_number = $1
        `;

        await this.pool.query(query, [phoneNumber]);
    }

    private mapRowToFcmToken(row: any): FcmToken {
        return {
            id: row.id,
            phone_number: row.phone_number,
            token: row.token,
            device_type: row.device_type,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

