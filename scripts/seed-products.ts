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
        const productsCount = 30;
        const products = [];

        const productTemplates = [
            { name: 'كريم أساس يدوم طويلا', desc: 'تغطية كاملة ومثالية لجميع أنواع البشرة، يدوم حتى 24 ساعة.', icon: 'beauty' },
            { name: 'أحمر شفاه مات أحمر', desc: 'لون غني وملمس ناعم لا يجفف الشفاه.', icon: 'beauty' },
            { name: 'سيروم حمض الهيالورونيك', desc: 'يرطب البشرة بعمق ويقلل من ظهور التجاعيد.', icon: 'beauty' },
            { name: 'تيشيرت قطن فاخر', desc: 'مصنوع من القطن العضوي 100%، مريح للاستخدام اليومي.', icon: 'clothes' },
            { name: 'فستان صيفي منقوش', desc: 'تصميم عصري وخفيف الوزن مثالي للأيام الحارة.', icon: 'clothes' },
            { name: 'باليت ظلال العيون 12 لون', desc: 'درجات متنوعة بين اللامع والمطفي لتناسب جميع الإطلالات.', icon: 'beauty' },
            { name: 'بنطلون جينز سليم فيت', desc: 'قصة عصرية مريحة وعملية لجميع المناسبات.', icon: 'clothes' },
            { name: 'عطر نسائي زهري 100مل', desc: 'رائحة جذابة من الياسمين والفانيليا تدوم طويلا.', icon: 'beauty' },
            { name: 'جاكيت شتوي مبطن', desc: 'يوفر دفئا فائقا وحماية من الرياح.', icon: 'clothes' },
            { name: 'حذاء رياضي مريح', desc: 'تصميم مرن يدعم القدم أثناء المشي والجري.', icon: 'clothes' },
        ];

        for (let i = 0; i < productsCount; i++) {
            const id = uuidv4();
            const template = productTemplates[i % productTemplates.length];
            const name = template.name + ' ' + faker.string.alphanumeric(3);
            const description = template.desc;
            const category_id = faker.helpers.arrayElement(categoryIds);
            const colors = template.icon === 'beauty' ?
                ['Nude', 'Rose', 'Light'] :
                ['Black', 'White', 'Blue', 'Beige'];
            const status = 'visible';

            // Generate random sizes and prices
            const sizes = template.icon === 'beauty' ? [
                { size: '30ml', price: parseFloat(faker.commerce.price({ min: 100, max: 300 })) },
                { size: '50ml', price: parseFloat(faker.commerce.price({ min: 250, max: 500 })) }
            ] : [
                { size: 'S', price: parseFloat(faker.commerce.price({ min: 50, max: 150 })) },
                { size: 'M', price: parseFloat(faker.commerce.price({ min: 50, max: 150 })) },
                { size: 'L', price: parseFloat(faker.commerce.price({ min: 50, max: 150 })) },
                { size: 'XL', price: parseFloat(faker.commerce.price({ min: 50, max: 150 })) }
            ];

            // Mock image URLs
            const keyword = template.icon === 'beauty' ? 'makeup,cosmetics' : 'clothing,fashion';
            const images = [`https://loremflickr.com/800/800/${keyword}?random=${i}`];

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
