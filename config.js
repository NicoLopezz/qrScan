import dotenv from 'dotenv';

dotenv.config();

const config = {
    mongodbURL: process.env.MONGODB_URI,
};

export default config;
