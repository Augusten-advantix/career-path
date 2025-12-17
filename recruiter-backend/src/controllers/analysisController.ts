import { Request, Response } from 'express';
import AnalysisJob from '../models/AnalysisJob';
import Profile from '../models/Profile';

interface AuthRequest extends Request {
    user?: any;
}

export const enqueueAnalysis = async (req: AuthRequest, res: Response) => {
    try {
        const { profileIds } = req.body;

        if (!profileIds || !Array.isArray(profileIds)) {
            return res.status(400).json({ error: 'Invalid profileIds' });
        }

        const jobs = [];
        for (const profileId of profileIds) {
            // Check if job already exists? Maybe allow re-analysis
            const job = await AnalysisJob.create({
                profileId,
                status: 'queued'
            });
            jobs.push(job);
        }

        res.json({
            message: `Enqueued ${jobs.length} profiles for analysis`,
            jobIds: jobs.map(j => j.id)
        });

    } catch (error) {
        console.error('Enqueue error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAnalysisStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const job = await AnalysisJob.findByPk(id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
