import mongoose from 'mongoose';
import config from './config.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export async function connectDB() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const db = await mongoose.connect(config.mongodbURL);
      console.log(`Database connected: ${db.connection.name}`);
      return db;
    } catch (err) {
      const safeMsg = err.message?.replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, 'mongodb://***');
      console.error(`DB connection attempt ${attempt}/${MAX_RETRIES} failed: ${safeMsg}`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  throw new Error('Could not connect to database after multiple attempts.');
}
