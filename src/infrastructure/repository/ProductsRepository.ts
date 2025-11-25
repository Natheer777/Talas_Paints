import { Product } from '@/domian/entities/Products';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { Pool } from 'pg';

export class ProductsRepository implements IProductsRepository {
    constructor(private db: Pool) { }

    async create(product: Product): Promise<Product> {
        const query = `
        INSERT INTO products (id, name, description, category, price, images, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `;
        const values = [
            product.name,
            product.description,
            product.category,
            product.price,
            product.images = [],
            product.createdAt,
            product.updatedAt,
         ] 
     
        const result = await this.db.query(query, values);
         return this.mapToProduct(result.rows[0])
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
        const query = `DELETE FROM products WHERE id = $1`;
        await this.db.query(query, [id]);
    }

    async checkExistingProduct(name: string): Promise<boolean> {
        const query = `
            SELECT EXISTS (
                SELECT 1 FROM products
                WHERE name = $1 AND 
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
            images: row.images || null,
            category: row.category,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

}