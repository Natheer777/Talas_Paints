import { PaymentMethod, PaymentMethodStatus } from '@/domian/entities/PaymentMethod';
import { IPaymentMethodRepository } from '@/domian/repository/IPaymentMethodRepository';
import { Pool } from 'pg';

export class PaymentMethodRepository implements IPaymentMethodRepository {
    constructor(private db: Pool) { }

    async create(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
        const query = `
            INSERT INTO payment_methods (
                id, qr_code_url, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            paymentMethod.id,
            paymentMethod.qrCodeUrl,
            paymentMethod.status,
            paymentMethod.createdAt,
            paymentMethod.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToPaymentMethod(result.rows[0]);
    }

    async update(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (paymentMethod.qrCodeUrl !== undefined) {
            updateFields.push(`qr_code_url = $${paramCounter++}`);
            values.push(paymentMethod.qrCodeUrl);
        }

        if (paymentMethod.status !== undefined) {
            updateFields.push(`status = $${paramCounter++}`);
            values.push(paymentMethod.status);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = $${paramCounter++}`);
        values.push(new Date());

        // Add the ID as the last parameter
        values.push(id);

        const query = `
            UPDATE payment_methods
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToPaymentMethod(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM payment_methods WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async getById(id: string): Promise<PaymentMethod | null> {
        const query = `SELECT * FROM payment_methods WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToPaymentMethod(result.rows[0]);
    }

    async getAll(): Promise<PaymentMethod[]> {
        const query = `SELECT * FROM payment_methods ORDER BY created_at DESC`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToPaymentMethod(row));
    }

    async getVisible(): Promise<PaymentMethod[]> {
        const query = `SELECT * FROM payment_methods WHERE status = $1 ORDER BY created_at DESC`;
        const result = await this.db.query(query, [PaymentMethodStatus.VISIBLE]);
        return result.rows.map(row => this.mapToPaymentMethod(row));
    }

    /**
     * Map database row to PaymentMethod entity
     */
    private mapToPaymentMethod(row: any): PaymentMethod {
        return {
            id: row.id,
            qrCodeUrl: row.qr_code_url,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
