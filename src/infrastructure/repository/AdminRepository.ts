import { Admin } from '@/domian/entities/Admin';
import { IAdminRepository } from '@/domian/repository/IAdminRepository';
import { Pool } from 'pg';

export class AdminRepository implements IAdminRepository {
    constructor(private db: Pool) { }

    async findByEmail(email: string): Promise<Admin | null> {
        const query = `SELECT * FROM admins WHERE email = $1`;
        const result = await this.db.query(query, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToAdmin(result.rows[0]);
    }

    async findAll(): Promise<Admin[]> {
        const query = `SELECT * FROM admins`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToAdmin(row));
    }

    async create(admin: Omit<Admin, 'id'>): Promise<Admin> {
        const query = `
            INSERT INTO admins (user_name, email, password, is_admin, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            admin.userName,
            admin.email,
            admin.password,
            admin.isAdmin ?? false,
            admin.createdAt || new Date(),
            admin.updatedAt || new Date(),
        ];

        const result = await this.db.query(query, values);
        return this.mapToAdmin(result.rows[0]);
    }

    private mapToAdmin(row: any): Admin {
        return {
            id: row.id,
            userName: row.user_name,
            email: row.email,
            password: row.password,
            isAdmin: row.is_admin,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
