import express from 'express';
import { connectDb } from './db/connectDB.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connectDb();
    console.log(`Your app is listening on http://localhost:${PORT}`);
})

//NhgMhr8hbyMi0k03