import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { DatabaseConnection } from '@/infrastructure/databases/DataBaseConnection';

export class ProductsRepository implements IProductsRepository {
    constructor(private db: DatabaseConnection) { }

    async create(product: Product): Promise<Product> {
        const {
            name,
            description,
            category,
            price,
            images = [],
        } = product;
        const id = this.db.generateUUID();
        const now = new Date();
        const query = `
            INSERT INTO products (id, name, description, category, price, images, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const params = [
            id,
            name,
            description,
            category,
            price,
            JSON.stringify(images),
            now,
            now
        ];
        const result = await this.db.query(query, params);
        // Interpret stored images as array
        const row = result.rows[0];
        row.images = row.images ? JSON.parse(row.images) : [];
        return row;
    }

    async findById(id: string): Promise<Product | null> {
        throw new Error('Not implemented');
    }
    async findAll(): Promise<Product[]> {
        throw new Error('Not implemented');
    }
    async update(id: string, product: Product): Promise<Product> {
        throw new Error('Not implemented');
    }
    async delete(id: string): Promise<void> {
        throw new Error('Not implemented');
    }
}