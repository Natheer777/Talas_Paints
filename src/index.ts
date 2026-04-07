import "reflect-metadata";

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv !== 'production') {
  const dotenv = require('dotenv') as typeof import('dotenv');
  const envFilePath = `.env.${nodeEnv}`;
  const result = dotenv.config({ path: envFilePath });
  if (result.error) {
    dotenv.config(); 
  }
  console.log(`📄 Loaded env from .env.${nodeEnv}`);
}

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'PORT',
  'HMAC_SECRET_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME',
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

import { App } from './app';

const app = new App();
const port = parseInt(process.env.PORT!, 10);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.start(port).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});