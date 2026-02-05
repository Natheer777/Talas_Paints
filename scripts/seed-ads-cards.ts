import { faker } from '@faker-js/faker';
import { DatabaseConnection } from '../src/infrastructure/databases/DataBaseConnection';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function seedAdsCards() {
    const db = DatabaseConnection.getInstance();
    const pool = db.getPool();

    console.log('🚀 Starting AdsCard seeding...');

    try {
        const count = 1000;
        const cards = [];

        for (let i = 0; i < count; i++) {
            const id = uuidv4();
            const title = faker.commerce.productAdjective() + ' ' + faker.commerce.productName();
            const text = faker.lorem.sentence();
            const mediaUrl = faker.image.url({ width: 1200, height: 400 });
            const mediaType = faker.helpers.arrayElement(['IMAGE', 'VIDEO']);
            const status = faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']);

            cards.push([
                id,
                title,
                text,
                mediaUrl,
                mediaType,
                status,
                new Date(),
                new Date()
            ]);
        }

        console.log(`📝 Inserting ${count} AdsCards...`);

        for (const card of cards) {
            const query = 'INSERT INTO ads_cards (id, title, text, media_url, media_type, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
            await pool.query(query, card);
        }

        console.log('✨ AdsCard seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedAdsCards();
