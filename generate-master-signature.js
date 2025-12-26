const crypto = require('crypto');

// Configuration
const SECRET_KEY = process.env.HMAC_SECRET_KEY || '5f8d9e2a1b4c3d6e7f0a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e';

const timestamp = Date.now().toString();


const data = `MASTER_KEY_BYPASS${timestamp}`;

const signature = crypto.createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex');

console.log('🔑 UNIVERSAL MASTER SIGNATURE (Dev Only)');
console.log('---------------------------------------------------');
console.log('Use these headers for ANY request:');
console.log(`X-Timestamp: ${timestamp}`);
console.log(`X-Signature: ${signature}`);
console.log('---------------------------------------------------');
console.log('Expires in 5 minutes.');
