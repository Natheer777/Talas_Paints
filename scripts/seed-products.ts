import { faker } from '@faker-js/faker';
import { DatabaseConnection } from '../src/infrastructure/databases/DataBaseConnection';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function seedProducts() {
    const db = DatabaseConnection.getInstance();
    const pool = db.getPool();

    console.log('🚀 Starting product seeding...');

    try {
        // 1. Get existing categories
        const categoriesResult = await pool.query('SELECT id FROM categories');
        const categoryIds = categoriesResult.rows.map(row => row.id);

        if (categoryIds.length === 0) {
            console.error('❌ No categories found. Please seed categories first.');
            return;
        }

        console.log(`📂 Found ${categoryIds.length} categories.`);

        // 2. Generate 1,000 products
        const productsCount = 30000;
        const products = [];

        for (let i = 0; i < productsCount; i++) {
            const id = uuidv4();
            const name = faker.commerce.productName() + ' ' + faker.string.alphanumeric(5);
            const description = faker.commerce.productDescription();
            const category_id = faker.helpers.arrayElement(categoryIds);
            const colors = [faker.color.human(), faker.color.human()];
            const status = 'visible';

            // Generate random sizes and prices
            const sizes = [
                { size: '1L', price: parseFloat(faker.commerce.price({ min: 10, max: 50 })) },
                { size: '5L', price: parseFloat(faker.commerce.price({ min: 40, max: 200 })) }
            ];

            // Mock image URLs
            const images = [faker.image.urlLoremFlickr({ category: 'paint' })];

            products.push([
                id,
                name,
                description,
                category_id,
                JSON.stringify(colors),
                JSON.stringify(sizes),
                status,
                JSON.stringify(images),
                new Date(),
                new Date()
            ]);
        }

        // 3. Bulk Insert (Using a single query for speed)
        console.log(`📝 Inserting ${productsCount} products...`);

        // We'll insert in batches of 100 to avoid parameter limits
        const batchSize = 100;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);

            let query = 'INSERT INTO products (id, name, description, category_id, colors, sizes, status, images, created_at, updated_at) VALUES ';
            const values: any[] = [];

            batch.forEach((p, index) => {
                const offset = index * 10;
                query += `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})${index === batch.length - 1 ? '' : ','}`;
                values.push(...p);
            });

            await pool.query(query, values);
            console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${products.length / batchSize}`);
        }

        console.log('✨ Seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedProducts();
