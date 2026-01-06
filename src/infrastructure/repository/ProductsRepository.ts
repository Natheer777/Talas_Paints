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

    async findVisiblePaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;

        // Get total count of visible products
        const countQuery = `SELECT COUNT(*) as total FROM products WHERE status = 'visible'`;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated visible data
        const dataQuery = `
            SELECT * FROM products
            WHERE status = 'visible'
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

    async searchByName(name: string, onlyVisible: boolean = false): Promise<Product[]> {
        let query = `
            SELECT * FROM products
            WHERE LOWER(name) LIKE LOWER($1)
        `;
        if (onlyVisible) {
            query += ` AND status = 'visible'`;
        }
        query += ` ORDER BY created_at DESC`;

        const searchPattern = `%${name}%`;
        const result = await this.db.query(query, [searchPattern]);

        return result.rows.map(row => this.mapToProduct(row));
    }

    async searchByNamePaginated(name: string, options: PaginationOptions = {}, onlyVisible: boolean = false): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;
        const searchPattern = `%${name}%`;

        let countQuery = `SELECT COUNT(*) as total FROM products WHERE LOWER(name) LIKE LOWER($1)`;
        let dataQuery = `SELECT * FROM products WHERE LOWER(name) LIKE LOWER($1)`;

        if (onlyVisible) {
            countQuery += ` AND status = 'visible'`;
            dataQuery += ` AND status = 'visible'`;
        }

        dataQuery += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;

        // Get total count for filtered results
        const countResult = await this.db.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated filtered data
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
        if (options.onlyVisible) {
            query += ` AND status = 'visible'`;
        }
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

        // Internal smart sorting: price ASC if price filter is applied, otherwise createdAt DESC
        const isPriceFilterApplied = options.minPrice !== undefined || options.maxPrice !== undefined;
        const sortBy = isPriceFilterApplied ? 'price' : 'createdAt';
        const sortOrder = isPriceFilterApplied ? 'ASC' : 'DESC';

        if (sortBy === 'price') {
            query += ` ORDER BY (SELECT MIN((s->>'price')::numeric) FROM jsonb_array_elements(sizes::jsonb) s) ${sortOrder}`;
        } else {
            query += ` ORDER BY created_at ${sortOrder}`;
        }

        const result = await this.db.query(query, values);
        return result.rows.map(row => this.mapToProduct(row));
    }

    async filterProductsPaginated(filterOptions: ProductFilterOptions, paginationOptions: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, paginationOptions.page || 1);
        const limit = Math.min(100, Math.max(1, paginationOptions.limit || 10));
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) as total FROM products WHERE 1=1`;
        let dataQuery = `SELECT * FROM products WHERE 1=1`;

        if (filterOptions.onlyVisible) {
            countQuery += ` AND status = 'visible'`;
            dataQuery += ` AND status = 'visible'`;
        }
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
        // Internal smart sorting: price ASC if price filter is applied, otherwise createdAt DESC
        const isPriceFilterApplied = filterOptions.minPrice !== undefined || filterOptions.maxPrice !== undefined;
        const sortBy = isPriceFilterApplied ? 'price' : 'createdAt';
        const sortOrder = isPriceFilterApplied ? 'ASC' : 'DESC';

        if (sortBy === 'price') {
            dataQuery += ` ORDER BY (SELECT MIN((s->>'price')::numeric) FROM jsonb_array_elements(sizes::jsonb) s) ${sortOrder}`;
        } else {
            dataQuery += ` ORDER BY created_at ${sortOrder}`;
        }
        dataQuery += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
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
            JSON.stringify(product.sizes || []),
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

    async findProductsWithActiveOffers(): Promise<Product[]> {
        const query = `
            SELECT
                p.id, p.name, p.description, p.category_id,
                p.colors, p.sizes, p.status, p.images,
                p.created_at, p.updated_at
            FROM products p
            WHERE p.id IN (
                SELECT DISTINCT o.product_id
                FROM offers o
                WHERE o.status = $1
            )
            ORDER BY p.created_at DESC
        `;
        const result = await this.db.query(query, ['VISIBLE']);
        return result.rows.map(row => this.mapToProduct(row));
    }

    async findProductsWithMostOrdersPaginated(options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const offset = (page - 1) * limit;

        // Get total count of products that have orders
        const countQuery = `
            SELECT COUNT(DISTINCT (item->>'product_id')) as total
            FROM orders o, jsonb_array_elements(o.items) AS item
            WHERE jsonb_array_length(o.items) > 0
        `;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total || '0');

        // Get paginated data ordered by total orders quantity
        const dataQuery = `
            SELECT
                p.id, p.name, p.description, p.category_id,
                p.colors, p.sizes, p.status, p.images,
                p.created_at, p.updated_at,
                COALESCE(stats.total_quantity, 0) as total_orders
            FROM products p
            LEFT JOIN (
                SELECT
                    (item->>'product_id') as product_id,
                    SUM((item->>'quantity')::int) as total_quantity
                FROM orders o, jsonb_array_elements(o.items) AS item
                WHERE jsonb_array_length(o.items) > 0
                GROUP BY (item->>'product_id')
            ) stats ON stats.product_id = p.id::text
            WHERE stats.total_quantity > 0
            ORDER BY stats.total_quantity DESC, p.created_at DESC
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