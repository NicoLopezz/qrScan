import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
    try {
        const db = await mongoose.connect(config.mongodbURL);
        console.log('Database is connected to:', db.connection.name);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

export default connectDB;
