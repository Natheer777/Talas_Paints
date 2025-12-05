import { Product } from '@/domian/entities/Products';
import { IProductsRepository, ProductFilterOptions, PaginationOptions, PaginatedResult } from '@/domian/repository/IProductsRepository';
import { Pool } from 'pg';

export class ProductsRepository implements IProductsRepository {
    constructor(private db: Pool) { }

    async create(product: Product): Promise<Product> {
        const query = `
        INSERT INTO products (id, name, description, category_id, colors, sizes, status, images, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        `;
        const values = [
            product.id,
            product.name,
            product.description,
            product.category_id,
            JSON.stringify(product.colors || []),
            JSON.stringify(product.sizes),
            product.status,
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

    async findAllPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM products`;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        const dataQuery = `
            SELECT * FROM products
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const dataResult = await this.db.query(dataQuery, [limit, offset]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: dataResult.rows.map(row => this.mapToProduct(row)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
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

    async searchByNamePaginated(name: string, options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;
        const searchPattern = `%${name}%`;

        // Get total count for filtered results
        const countQuery = `SELECT COUNT(*) as total FROM products WHERE LOWER(name) LIKE LOWER($1)`;
        const countResult = await this.db.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated filtered data
        const dataQuery = `
            SELECT * FROM products
            WHERE LOWER(name) LIKE LOWER($1)
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const dataResult = await this.db.query(dataQuery, [searchPattern, limit, offset]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: dataResult.rows.map(row => this.mapToProduct(row)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
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

        // Filter by price range in sizes JSON
        // Products are included if at least one size has a price within the specified range
        if (options.minPrice !== undefined || options.maxPrice !== undefined) {
            if (options.minPrice !== undefined && options.maxPrice !== undefined) {
                // Both min and max: find sizes where price is between min and max
                query += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter} 
                    AND (size->>'price')::numeric <= $${paramCounter + 1}
                )`;
                values.push(options.minPrice, options.maxPrice);
                paramCounter += 2;
            } else if (options.minPrice !== undefined) {
                // Only min: find sizes where price >= min
                query += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter}
                )`;
                values.push(options.minPrice);
                paramCounter++;
            } else if (options.maxPrice !== undefined) {
                // Only max: find sizes where price <= max
                query += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric <= $${paramCounter}
                )`;
                values.push(options.maxPrice);
                paramCounter++;
            }
        }

        query += ` ORDER BY created_at DESC`;

        const result = await this.db.query(query, values);
        return result.rows.map(row => this.mapToProduct(row));
    }

    async filterProductsPaginated(filterOptions: ProductFilterOptions, paginationOptions: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, paginationOptions.page || 1);
        const limit = Math.min(100, Math.max(1, paginationOptions.limit || 10));
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) as total FROM products WHERE 1=1`;
        let dataQuery = `SELECT * FROM products WHERE 1=1`;
        const values: any[] = [];
        let paramCounter = 1;

        // Filter by categories
        if (filterOptions.categories && filterOptions.categories.length > 0) {
            countQuery += ` AND category_id = ANY($${paramCounter})`;
            dataQuery += ` AND category_id = ANY($${paramCounter})`;
            values.push(filterOptions.categories);
            paramCounter++;
        }

        // Filter by price range in sizes JSON
        if (filterOptions.minPrice !== undefined || filterOptions.maxPrice !== undefined) {
            if (filterOptions.minPrice !== undefined && filterOptions.maxPrice !== undefined) {
                countQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter}
                    AND (size->>'price')::numeric <= $${paramCounter + 1}
                )`;
                dataQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter}
                    AND (size->>'price')::numeric <= $${paramCounter + 1}
                )`;
                values.push(filterOptions.minPrice, filterOptions.maxPrice);
                paramCounter += 2;
            } else if (filterOptions.minPrice !== undefined) {
                countQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter}
                )`;
                dataQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric >= $${paramCounter}
                )`;
                values.push(filterOptions.minPrice);
                paramCounter++;
            } else if (filterOptions.maxPrice !== undefined) {
                countQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric <= $${paramCounter}
                )`;
                dataQuery += ` AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(sizes::jsonb) AS size
                    WHERE (size->>'price')::numeric <= $${paramCounter}
                )`;
                values.push(filterOptions.maxPrice);
                paramCounter++;
            }
        }

        // Get total count for filtered results
        const countResult = await this.db.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Add pagination to data query
        dataQuery += ` ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        values.push(limit, offset);

        const dataResult = await this.db.query(dataQuery, values);
        const totalPages = Math.ceil(total / limit);

        return {
            data: dataResult.rows.map(row => this.mapToProduct(row)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    async update(id: string, product: Product): Promise<Product> {
        const query = `
            UPDATE products 
            SET name = $1, 
                description = $2, 
                category_id = $3, 
                colors = $4,
                sizes = $5,
                status = $6,
                images = $7, 
                updated_at = $8
            WHERE id = $9
            RETURNING *
        `;
        const values = [
            product.name,
            product.description,
            product.category_id,
            JSON.stringify(product.colors || []),
            JSON.stringify(product.sizes),
            product.status,
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
            colors: row.colors || undefined,
            sizes: row.sizes || [],
            status: row.status,
            images: row.images || null,
            category_id: row.category_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

}