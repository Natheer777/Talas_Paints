import { Category } from '@/domian/entities/Category';
import { ICategoriesRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/ICategoriesRepository';
import { Pool } from 'pg';

export class CategoriesRepository implements ICategoriesRepository {
    constructor(private db: Pool) { }

    async create(category: Category): Promise<Category> {
        const query = `
            INSERT INTO categories (id, name, images, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            category.id,
            category.name,
            category.images ? JSON.stringify(category.images) : null,
            category.createdAt,
            category.updatedAt,
        ];

        const result = await this.db.query(query, values);
        return this.mapToCategory(result.rows[0]);
    }

    async findById(id: string): Promise<Category | null> {
        const query = `SELECT * FROM categories WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToCategory(result.rows[0]);
    }

    async findAll(): Promise<Category[]> {
        const query = `SELECT * FROM categories ORDER BY name ASC`;
        const result = await this.db.query(query);

        return result.rows.map(row => this.mapToCategory(row));
    }

    async findAllPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Category>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM categories`;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        const dataQuery = `
            SELECT * FROM categories
            ORDER BY name ASC
            LIMIT $1 OFFSET $2
        `;
        const dataResult = await this.db.query(dataQuery, [limit, offset]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: dataResult.rows.map(row => this.mapToCategory(row)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    async findByName(name: string): Promise<Category | null> {
        const query = `SELECT * FROM categories WHERE LOWER(name) = LOWER($1)`;
        const result = await this.db.query(query, [name]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToCategory(result.rows[0]);
    }

    async update(id: string, category: Category): Promise<Category> {
        const query = `
            UPDATE categories 
            SET name = $1,
                images = $2,
                updated_at = $3
            WHERE id = $4
            RETURNING *
        `;
        const values = [
            category.name,
            category.images ? JSON.stringify(category.images) : null,
            new Date(),
            id,
        ];

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Category not found');
        }

        return this.mapToCategory(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = `DELETE FROM categories WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rowCount === 0) {
            throw new Error('Category not found');
        }
    }

    async checkExistingCategory(name: string): Promise<boolean> {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM categories
                WHERE LOWER(name) = LOWER($1)
            ) as exists
        `;
        const result = await this.db.query(query, [name]);
        return result.rows[0].exists;
    }

    private mapToCategory(row: any): Category {
        return {
            id: row.id,
            name: row.name,
            images: row.images || null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
