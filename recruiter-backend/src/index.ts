import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import analysisRoutes from './routes/analysis';
import jobRequirementsRoutes from './routes/jobRequirements';
import { startWorker } from './services/workerService';

app.use('/auth', authRoutes);
app.use('/recruiter', uploadRoutes);
app.use('/recruiter', analysisRoutes);
app.use('/recruiter/job-requirements', jobRequirementsRoutes);

app.get('/', (req, res) => {
    res.send('Recruiter API is running');
});

// Use `alter: true` during development to automatically update the sqlite schema
// when model definitions have changed (e.g. added `jobRequirementId` to Upload).
// For production, use proper migrations instead of `alter: true`.
const syncDbWithFallback = async () => {
    try {
        // Changed from { alter: true } to basic sync() to prevent SQLITE_CONSTRAINT errors on restart.
        // If schema changes are needed in dev, use 'npm run reset-db' or temporarily revert this.
        await sequelize.sync();
        console.log('Recruiter Database synced');
        console.log(`DB location: ${(sequelize as any).options?.storage || 'not sqlite or unknown'}`);
    } catch (err: any) {
        console.error('Unable to sync database:', err);
        // If explicitly requested via env, attempt a more destructive fix: disable foreign key checks and force sync (dev-only)
        if (process.env.DEV_FORCE_SYNC === 'true') {
            console.log('⚠️ DEV_FORCE_SYNC=true - Attempting to force reinitialize DB (development only)');
            try {
                await sequelize.query('PRAGMA foreign_keys = OFF;');
                await sequelize.sync({ force: true });
                await sequelize.query('PRAGMA foreign_keys = ON;');
                console.log('✅ Force reinitialized DB (force: true)');
                return;
            } catch (forceErr: any) {
                console.error('Force DB sync failed:', forceErr);
                throw forceErr;
            }
        }
        throw err;
    }
};

syncDbWithFallback().then(() => {
    // Only start worker and server if DB sync worked
    startWorker();
    app.listen(PORT, () => {
        console.log(`Recruiter Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error(`Fatal: Unable to start server due to DB sync issue. Follow suggestions:\n  - run 'npm run reset-db' to delete recruiter.sqlite and retry\n  - or run 'DEV_FORCE_SYNC=true npm run dev' to force reinitialize DB (development only)`);
});
