import { Product } from '@/domian/entities/Products';
import { IProductsRepository, ProductFilterOptions } from '@/domian/repository/IProductsRepository';
import { Pool } from 'pg';

export class ProductsRepository implements IProductsRepository {
    constructor(private db: Pool) { }

    async create(product: Product): Promise<Product> {
        const query = `
        INSERT INTO products (id, name, description, category_id, price, quantity, images, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `;
        const values = [
            product.id,
            product.name,
            product.description,
            product.category_id,
            product.price,
            product.quantity,
            JSON.stringify(product.images || []),
            product.createdAt,
            product.updatedAt,
        ];

        const result = await this.db.query(query, values);
        return this.mapToProduct(result.rows[0]);
    }

    async findById(id: string): Promise<Product | null> {
        const query = `SELECT * FROM products WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToProduct(result.rows[0]);
    }

    async findAll(): Promise<Product[]> {
        const query = `SELECT * FROM products ORDER BY created_at DESC`;
        const result = await this.db.query(query);

        return result.rows.map(row => this.mapToProduct(row));
    }

    async searchByName(name: string): Promise<Product[]> {
        const query = `
            SELECT * FROM products 
            WHERE LOWER(name) LIKE LOWER($1)
            ORDER BY created_at DESC
        `;
        const searchPattern = `%${name}%`;
        const result = await this.db.query(query, [searchPattern]);

        return result.rows.map(row => this.mapToProduct(row));
    }

    async filterProducts(options: ProductFilterOptions): Promise<Product[]> {
        let query = `SELECT * FROM products WHERE 1=1`;
        const values: any[] = [];
        let paramCounter = 1;

        // Filter by categories
        if (options.categories && options.categories.length > 0) {
            query += ` AND category_id = ANY($${paramCounter})`;
            values.push(options.categories);
            paramCounter++;
        }

        // Filter by minimum price
        if (options.minPrice !== undefined) {
            query += ` AND price >= $${paramCounter}`;
            values.push(options.minPrice);
            paramCounter++;
        }

        // Filter by maximum price
        if (options.maxPrice !== undefined) {
            query += ` AND price <= $${paramCounter}`;
            values.push(options.maxPrice);
            paramCounter++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await this.db.query(query, values);
        return result.rows.map(row => this.mapToProduct(row));
    }

    async update(id: string, product: Product): Promise<Product> {
        const query = `
            UPDATE products 
            SET name = $1, 
                description = $2, 
                category_id = $3, 
                price = $4, 
                quantity = $5,
                images = $6, 
                updated_at = $7
            WHERE id = $8
            RETURNING *
        `;
        const values = [
            product.name,
            product.description,
            product.category_id,
            product.price,
            product.quantity,
            JSON.stringify(product.images || []),
            new Date(),
            id,
        ];

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }

        return this.mapToProduct(result.rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = `DELETE FROM products WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rowCount === 0) {
            throw new Error('Product not found');
        }
    }

    async checkExistingProduct(name: string): Promise<boolean> {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM products
                WHERE LOWER(name) = LOWER($1)
            ) as exists
        `;
        const result = await this.db.query(query, [name]);
        return result.rows[0].exists;
    }

    private mapToProduct(row: any): Product {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            quantity: parseInt(row.quantity),
            images: row.images || null,
            category_id: row.category_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

}