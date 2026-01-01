import { faker } from '@faker-js/faker';
import { DatabaseConnection } from '../src/infrastructure/databases/DataBaseConnection';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function seedOffers() {
    const db = DatabaseConnection.getInstance();
    const pool = db.getPool();

    console.log('🚀 Starting Offers seeding...');

    try {
        // 1. Get existing products
        const productsResult = await pool.query('SELECT id FROM products LIMIT 100');
        const productIds = productsResult.rows.map(row => row.id);

        if (productIds.length === 0) {
            console.error('❌ No products found. Please seed products first.');
            return;
        }

        const count = 4000;
        const offers = [];

        for (let i = 0; i < count; i++) {
            const id = uuidv4(); 
            const name = faker.commerce.productAdjective() + ' Sale';
            const description = faker.commerce.productDescription();
            const type = faker.helpers.arrayElement(['PERCENTAGE_DISCOUNT', 'BUY_X_GET_Y_FREE']);
            const product_id = faker.helpers.arrayElement(productIds);
            const status = faker.helpers.arrayElement(['VISIBLE', 'HIDDEN']);

            let discount_percentage = null;
            let buy_quantity = null;
            let get_quantity = null;

            if (type === 'PERCENTAGE_DISCOUNT') {
                discount_percentage = faker.number.int({ min: 5, max: 50 });
            } else {
                buy_quantity = faker.number.int({ min: 1, max: 3 });
                get_quantity = 1;
            }

            offers.push([
                id,
                name,
                description,
                type,
                product_id,
                discount_percentage,
                buy_quantity,
                get_quantity,
                status,
                new Date(),
                new Date()
            ]);
        }

        console.log(`📝 Inserting ${count} Offers...`);

        for (const offer of offers) {
            const query = `
                INSERT INTO offers (
                    id, name, description, type, product_id, 
                    discount_percentage, buy_quantity, get_quantity, 
                    status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            await pool.query(query, offer);
        }

        console.log('✨ Offers seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedOffers();
