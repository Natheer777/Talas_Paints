import "reflect-metadata";
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${nodeEnv}`;

const result = dotenv.config({ path: envFilePath });
if (result.error) {
  dotenv.config(); 
}

import { App } from './app';
const app = new App();
const port = parseInt(process.env.PORT || '3000', 10);



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