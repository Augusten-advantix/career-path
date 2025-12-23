import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST

import express from 'express';
// Force restart
import cors from 'cors';
import { config } from './config/config';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import adminRoutes from './routes/admin';
import sessionRoutes from './routes/session';
import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

const app = express();

// CORS configuration - Allow all origins for now (can restrict later)
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/session', sessionRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.send('Career Roadmap API is running');
});

// Sync database - use alter: true in production to add missing columns
const isProduction = process.env.NODE_ENV === 'production';
sequelize.sync({ alter: isProduction }).then(() => {
    console.log(`Database synced${isProduction ? ' (with alter)' : ''}`);
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
}).catch((err) => {
    console.error('Unable to sync database:', err);
});
