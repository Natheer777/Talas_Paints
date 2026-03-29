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
        const count = 30;
        const cards = [];

        const adTemplates = [
            { title: 'وصل حديثاً: مجموعة الربيع', text: 'اكتشفي أحدث تشكيلة من الفساتين الصيفية والأزياء العصرية.' },
            { title: 'سر الجمال الطبيعي', text: 'استمتعي بشرة نضرة مع مجموعة العناية المتكاملة بالأعشاب الطبيعية.' },
            { title: 'أناقة لا مثيل لها', text: 'تشكيلة واسعة من الملابس الرجالية والنسائية تناسب جميع الأذواق.' },
            { title: 'خبير التجميل في منزلك', text: 'أدوات ومستحضرات تجميل احترافية لنتائج مذهلة كل يوم.' }
        ];

        for (let i = 0; i < count; i++) {
            const id = uuidv4();
            const template = adTemplates[i % adTemplates.length];
            const title = template.title;
            const text = template.text;
            const mediaUrl = `https://loremflickr.com/1200/400/fashion,promotion?random=${i}`;
            const mediaType = faker.helpers.arrayElement(['IMAGE', 'IMAGE']); // Use IMAGE for more reliability for now
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
