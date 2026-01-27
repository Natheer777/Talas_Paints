import { Offer, OfferStatus } from '@/domian/entities/Offer';
import { OfferWithDetails, ProductWithCategory } from '@/domian/entities/OfferWithDetails';
import { Product, ProductStatus } from '@/domian/entities/Products';
import { Category } from '@/domian/entities/Category';
import { IOfferRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/IOfferRepository';
import { Pool } from 'pg';


export class OfferRepository implements IOfferRepository {
    constructor(private db: Pool) { }

    async create(offer: Offer): Promise<Offer> {
        const query = `
            INSERT INTO offers (
                id, name, description, type, product_id, 
                discount_percentage, buy_quantity, get_quantity,
                status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            offer.id,
            offer.name,
            offer.description,
            offer.type,
            offer.product_id,
            offer.discount_percentage || null,
            offer.buy_quantity || null,
            offer.get_quantity || null,
            offer.status,
            offer.createdAt,
            offer.updatedAt
        ];

        const result = await this.db.query(query, values);
        return this.mapToOffer(result.rows[0]);
    }

    async update(id: string, offer: Partial<Offer>): Promise<Offer | null> {
        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (offer.name !== undefined) {
            updateFields.push(`name = $${paramCounter++}`);
            values.push(offer.name);
        }

        if (offer.description !== undefined) {
            updateFields.push(`description = $${paramCounter++}`);
            values.push(offer.description);
        }

        if (offer.type !== undefined) {
            updateFields.push(`type = $${paramCounter++}`);
            values.push(offer.type);
        }

        if (offer.product_id !== undefined) {
            updateFields.push(`product_id = $${paramCounter++}`);
            values.push(offer.product_id);
        }

        if (offer.discount_percentage !== undefined) {
            updateFields.push(`discount_percentage = $${paramCounter++}`);
            values.push(offer.discount_percentage);
        }

        if (offer.buy_quantity !== undefined) {
            updateFields.push(`buy_quantity = $${paramCounter++}`);
            values.push(offer.buy_quantity);
        }

        if (offer.get_quantity !== undefined) {
            updateFields.push(`get_quantity = $${paramCounter++}`);
            values.push(offer.get_quantity);
        }

        if (offer.status !== undefined) {
            updateFields.push(`status = $${paramCounter++}`);
            values.push(offer.status);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = $${paramCounter++}`);
        values.push(new Date());

        // Add the ID as the last parameter
        values.push(id);

        const query = `
            UPDATE offers 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOffer(result.rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM offers WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async getById(id: string): Promise<Offer | null> {
        const query = `SELECT * FROM offers WHERE id = $1`;
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOffer(result.rows[0]);
    }

    async getAll(): Promise<Offer[]> {
        const query = `SELECT * FROM offers ORDER BY created_at DESC`;
        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToOffer(row));
    }


    async getByIdWithDetails(id: string): Promise<OfferWithDetails | null> {
        const query = `
            SELECT 
                o.*,
                p.id as product_id,
                p.name as product_name,
                p.description as product_description,
                p.category_id as product_category_id,
                p.colors as product_colors,
                p.sizes as product_sizes,
                p.status as product_status,
                p.images as product_images,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                c.id as category_id,
                c.name as category_name,
                c.images as category_images,
                c.created_at as category_created_at,
                c.updated_at as category_updated_at
            FROM offers o
            INNER JOIN products p ON o.product_id = p.id
            INNER JOIN categories c ON p.category_id = c.id
            WHERE o.id = $1
        `;

        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOfferWithDetails(result.rows[0]);
    }

    /**
     * Get all offers with full product and category details
     */
    async getAllWithDetails(): Promise<OfferWithDetails[]> {
        const query = `
            SELECT 
                o.*,
                p.id as product_id,
                p.name as product_name,
                p.description as product_description,
                p.category_id as product_category_id,
                p.colors as product_colors,
                p.sizes as product_sizes,
                p.status as product_status,
                p.images as product_images,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                c.id as category_id,
                c.name as category_name,
                c.images as category_images,
                c.created_at as category_created_at,
                c.updated_at as category_updated_at
            FROM offers o
            INNER JOIN products p ON o.product_id = p.id
            INNER JOIN categories c ON p.category_id = c.id
            ORDER BY o.created_at DESC
        `;

        const result = await this.db.query(query);
        return result.rows.map(row => this.mapToOfferWithDetails(row));
    }


    async getAllWithDetailsPaginated(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM offers`;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data with details
        const query = `
            SELECT 
                o.*,
                p.id as product_id,
                p.name as product_name,
                p.description as product_description,
                p.category_id as product_category_id,
                p.colors as product_colors,
                p.sizes as product_sizes,
                p.status as product_status,
                p.images as product_images,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                c.id as category_id,
                c.name as category_name,
                c.images as category_images,
                c.created_at as category_created_at,
                c.updated_at as category_updated_at
            FROM offers o
            INNER JOIN products p ON o.product_id = p.id
            INNER JOIN categories c ON p.category_id = c.id
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await this.db.query(query, [limit, offset]);
        const data = result.rows.map(row => this.mapToOfferWithDetails(row));

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    async getVisibleWithDetailsPaginated(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const offset = (page - 1) * limit;

        // Get total count of visible offers
        const countQuery = `SELECT COUNT(*) as total FROM offers WHERE status = 'VISIBLE'`;
        const countResult = await this.db.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated visible data with details
        const query = `
            SELECT 
                o.*,
                p.id as product_id,
                p.name as product_name,
                p.description as product_description,
                p.category_id as product_category_id,
                p.colors as product_colors,
                p.sizes as product_sizes,
                p.status as product_status,
                p.images as product_images,
                p.created_at as product_created_at,
                p.updated_at as product_updated_at,
                c.id as category_id,
                c.name as category_name,
                c.images as category_images,
                c.created_at as category_created_at,
                c.updated_at as category_updated_at
            FROM offers o
            INNER JOIN products p ON o.product_id = p.id
            INNER JOIN categories c ON p.category_id = c.id
            WHERE o.status = 'VISIBLE'
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await this.db.query(query, [limit, offset]);
        const data = result.rows.map(row => this.mapToOfferWithDetails(row));

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    async findActiveByProductId(productId: string): Promise<Offer | null> {
        const query = `
            SELECT * FROM offers 
            WHERE product_id = $1 AND status = 'VISIBLE' 
            LIMIT 1
        `;
        const result = await this.db.query(query, [productId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToOffer(result.rows[0]);
    }


    private mapToOffer(row: any): Offer {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            type: row.type,
            product_id: row.product_id,
            discount_percentage: row.discount_percentage ? parseFloat(row.discount_percentage) : undefined,
            buy_quantity: row.buy_quantity ? parseInt(row.buy_quantity) : undefined,
            get_quantity: row.get_quantity ? parseInt(row.get_quantity) : undefined,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }


    private mapToOfferWithDetails(row: any): OfferWithDetails {
        const offer = this.mapToOffer(row);

        const parseArrayField = (field: any): any[] => {
            if (field === null || field === undefined) return [];

            // If it's already an array, return it
            if (Array.isArray(field)) return field;

            // If it's a string, try to parse it
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    // If JSON parsing fails, try comma-separated values
                    if (field.includes(',')) {
                        return field.split(',').map((item: string) => item.trim()).filter((item: string) => item);
                    }
                    return field.trim() ? [field.trim()] : [];
                }
            }

            // For any other type, return empty array
            return [];
        };

        const parseImagesField = (field: any): any[] | null => {
            if (field === null || field === undefined) return null;

            // If it's already an array, return it
            if (Array.isArray(field)) return field;

            // If it's a string, try to parse it
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    return Array.isArray(parsed) ? parsed : null;
                } catch {
                    // If JSON parsing fails, try comma-separated values
                    if (field.includes(',')) {
                        return field.split(',').map((item: string) => item.trim()).filter((item: string) => item);
                    }
                    return field.trim() ? [field.trim()] : null;
                }
            }

            // For any other type, return null
            return null;
        };

        const category: Category = {
            id: row.category_id,
            name: row.category_name,
            images: parseImagesField(row.category_images),
            createdAt: new Date(row.category_created_at),
            updatedAt: new Date(row.category_updated_at)
        };

        const product: ProductWithCategory = {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            colors: parseArrayField(row.product_colors),
            sizes: parseArrayField(row.product_sizes),
            status: row.product_status as ProductStatus,
            images: parseImagesField(row.product_images),
            createdAt: new Date(row.product_created_at),
            updatedAt: new Date(row.product_updated_at),
            category
        };

        return {
            ...offer,
            product
        };
    }
}

