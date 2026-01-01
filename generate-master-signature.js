const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.development') });
const crypto = require('crypto');

// Configuration
const SECRET_KEY = process.env.HMAC_SECRET_KEY;

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
