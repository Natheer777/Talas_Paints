import { faker } from '@faker-js/faker';
import { DatabaseConnection } from '../src/infrastructure/databases/DataBaseConnection';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function seedCategories() {
    const db = DatabaseConnection.getInstance();
    const pool = db.getPool();

    console.log('🚀 Starting category seeding...');

    try {
        const count = 30;
        const categories = [];

        const categoryNames = [
            'مكياج الوجه', 'أحمر الشفاه', 'العناية بالبشرة', 'العناية بالشعر', 'العطور',
            'ملابس رجالية', 'ملابس نسائية', 'ملابس أطفال', 'فساتين', 'قمصان وتيشيرتات',
            'بناطيل وجينز', 'أحذية رياضية', 'حقائب وإكسسوارات', 'ساعات', 'نظارات شمسية',
            'أدوات تجميل', 'كريمات مرطبة', 'واقي شمس', 'ملابس رياضية', 'لانجري',
            'بيجامات', 'معاطف وجواكيت', 'تنانير', 'بليزرات', 'أحذية رسمية',
            'مستلزمات العناية بالأظافر', 'باليت العيون', 'ماسكارا وآيلاينر', 'فرش مكياج', 'تونر وسيروم'
        ];

        for (let i = 0; i < count; i++) {
            const id = uuidv4();
            const name = categoryNames[i % categoryNames.length];
            // استخدام صور مرتبطة بالموضة والجمال
            const images = [`https://loremflickr.com/640/480/fashion,beauty,cosmetics?random=${i}`];

            categories.push([
                id,
                name,
                JSON.stringify(images),
                new Date(),
                new Date()
            ]);
        }

        console.log(`📝 Inserting ${count} categories...`);

        for (const cat of categories) {
            const query = 'INSERT INTO categories (id, name, images, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)';
            await pool.query(query, cat);
        }

        console.log('✨ Category seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedCategories();
