import { faker } from '@faker-js/faker';
import { DatabaseConnection } from '../src/infrastructure/databases/DataBaseConnection';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function seedVideoCards() {
    const db = DatabaseConnection.getInstance();
    const pool = db.getPool();

    console.log('🚀 Starting VideoCard seeding...');

    try {
        const count = 1000;
        const cards = [];

        for (let i = 0; i < count; i++) {
            const id = uuidv4();
            const title = faker.commerce.productName() + ' Showcase';
            // Mock video URL
            const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
            const status = faker.helpers.arrayElement(['visible', 'hidden']);

            cards.push([
                id,
                title,
                videoUrl,
                status,
                new Date(),
                new Date()
            ]);
        }

        console.log(`📝 Inserting ${count} VideoCards...`);

        for (const card of cards) {
            const query = 'INSERT INTO video_cards (id, title, video_url, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)';
            await pool.query(query, card);
        }

        console.log('✨ VideoCard seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedVideoCards();
