import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import AuthRoutes from '../src/routers/auth.routes.js';
// import setInterval from './pinging.js';

const app = express();

// Usa cookie-parser para manejar cookies
app.use(cookieParser());

// Configura el puerto y middlewares
app.set('port', process.env.PORT || 10002);
app.use(express.json());
app.use(express.text());
app.use(cors());
app.use(setInterval);
app.use('/api', AuthRoutes);
app.use(express.static('public'));

export default app;
