import { Request, Response } from 'express';
import User from '../models/User';
import Profile from '../models/Profile';
import AnalysisJob from '../models/AnalysisJob';
import Upload from '../models/Upload';
import { Op } from 'sequelize';
import sequelize from '../config/database';

interface AuthRequest extends Request {
    user?: any;
}

// User Management
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const whereClause = search
            ? {
                [Op.or]: [
                    { email: { [Op.iLike]: `%${search}%` } },
                    { name: { [Op.iLike]: `%${search}%` } },
                ],
            }
            : {};

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'email', 'name', 'isAdmin', 'role', 'createdAt', 'updatedAt'],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            users,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: ['id', 'email', 'name', 'isAdmin', 'role', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, isAdmin, role } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from demoting themselves
        if (user.id === req.user.id && isAdmin === false) {
            return res.status(403).json({ message: 'Cannot demote yourself from admin' });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (isAdmin !== undefined) {
            updateData.isAdmin = isAdmin;
            updateData.role = isAdmin ? 'admin' : 'user';
        }
        if (role !== undefined && isAdmin === undefined) {
            updateData.role = role;
            updateData.isAdmin = role === 'admin';
        }

        await user.update(updateData);

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(403).json({ message: 'Cannot delete your own account' });
        }

        // Delete all related data first (cascade delete)
        // Using imported sequelize instance for raw queries

        // Delete related records in order of dependencies
        await sequelize.query(`DELETE FROM "roadmap_progress" WHERE "userId" = :userId`, {
            replacements: { userId: id }
        });

        await sequelize.query(`DELETE FROM "analysis_jobs" WHERE "userId" = :userId`, {
            replacements: { userId: id }
        });

        await sequelize.query(`DELETE FROM "uploads" WHERE "userId" = :userId`, {
            replacements: { userId: id }
        });

        await sequelize.query(`DELETE FROM "profiles" WHERE "userId" = :userId`, {
            replacements: { userId: id }
        });

        // Now delete the user
        await user.destroy();

        console.log(`✅ User ${id} and all related data deleted`);
        res.json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Profile Management
export const getAllProfiles = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, search = '', minExperience, maxExperience } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause: any = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { title: { [Op.iLike]: `%${search}%` } },
                { company: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (minExperience !== undefined || maxExperience !== undefined) {
            whereClause.yearsExperience = {};
            if (minExperience !== undefined) whereClause.yearsExperience[Op.gte] = Number(minExperience);
            if (maxExperience !== undefined) whereClause.yearsExperience[Op.lte] = Number(maxExperience);
        }

        const { count, rows: profiles } = await Profile.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Upload,
                    attributes: ['filename', 'createdAt'],
                },
            ],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            profiles,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProfileById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByPk(id, {
            include: [
                {
                    model: Upload,
                    attributes: ['filename', 'path', 'fileType', 'createdAt'],
                },
            ],
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Get associated analysis job
        const analysisJob = await AnalysisJob.findOne({
            where: { profileId: id },
        });

        res.json({
            profile,
            analysisJob,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByPk(id);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Delete associated analysis jobs
        await AnalysisJob.destroy({ where: { profileId: id } });

        await profile.destroy();

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Analysis Job Monitoring
export const getAllAnalysisJobs = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const whereClause = status ? { status } : {};

        const { count, rows: jobs } = await AnalysisJob.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Profile,
                    attributes: ['name', 'title', 'company'],
                },
            ],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            jobs,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching analysis jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getJobStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalJobs = await AnalysisJob.count();
        const queuedJobs = await AnalysisJob.count({ where: { status: 'queued' } });
        const runningJobs = await AnalysisJob.count({ where: { status: 'running' } });
        const successJobs = await AnalysisJob.count({ where: { status: 'success' } });
        const failedJobs = await AnalysisJob.count({ where: { status: 'failed' } });

        res.json({
            total: totalJobs,
            queued: queuedJobs,
            running: runningJobs,
            success: successJobs,
            failed: failedJobs,
        });
    } catch (error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const retryFailedJob = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const job = await AnalysisJob.findByPk(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'failed') {
            return res.status(400).json({ message: 'Only failed jobs can be retried' });
        }

        await job.update({ status: 'queued', error: null });

        res.json({ message: 'Job queued for retry', job });
    } catch (error) {
        console.error('Error retrying job:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// System Statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        // User statistics
        const totalUsers = await User.count();
        const adminUsers = await User.count({ where: { isAdmin: true } });
        const recentUsers = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
            },
        });

        // Profile statistics
        const totalProfiles = await Profile.count();
        const recentProfiles = await Profile.count({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });

        // Analysis job statistics
        const totalJobs = await AnalysisJob.count();
        const queuedJobs = await AnalysisJob.count({ where: { status: 'queued' } });
        const runningJobs = await AnalysisJob.count({ where: { status: 'running' } });
        const successJobs = await AnalysisJob.count({ where: { status: 'success' } });
        const failedJobs = await AnalysisJob.count({ where: { status: 'failed' } });

        // Recent activity
        const recentActivity = await AnalysisJob.findAll({
            include: [
                {
                    model: Profile,
                    attributes: ['name', 'title'],
                },
            ],
            limit: 10,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            users: {
                total: totalUsers,
                admin: adminUsers,
                regular: totalUsers - adminUsers,
                recentlyAdded: recentUsers,
            },
            profiles: {
                total: totalProfiles,
                recentlyAdded: recentProfiles,
            },
            jobs: {
                total: totalJobs,
                queued: queuedJobs,
                running: runningJobs,
                success: successJobs,
                failed: failedJobs,
                successRate: totalJobs > 0 ? ((successJobs / totalJobs) * 100).toFixed(2) : 0,
            },
            recentActivity,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Analytics Data
export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        console.log('📊 getAnalytics called');
        const { days = 30 } = req.query;
        const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

        // 1. User signups over time (grouped by day)
        const users = await User.findAll({
            where: {
                createdAt: { [Op.gte]: daysAgo },
            },
            attributes: ['createdAt'],
            order: [['createdAt', 'ASC']],
        });

        const signupsByDay: Record<string, number> = {};
        users.forEach((user: any) => {
            const day = new Date(user.createdAt).toISOString().split('T')[0];
            signupsByDay[day] = (signupsByDay[day] || 0) + 1;
        });

        // 2. Analyses over time
        const jobs = await AnalysisJob.findAll({
            where: {
                createdAt: { [Op.gte]: daysAgo },
            },
            attributes: ['createdAt', 'status'],
            order: [['createdAt', 'ASC']],
        });

        const analysesByDay: Record<string, { total: number; success: number; failed: number }> = {};
        jobs.forEach((job: any) => {
            const day = new Date(job.createdAt).toISOString().split('T')[0];
            if (!analysesByDay[day]) {
                analysesByDay[day] = { total: 0, success: 0, failed: 0 };
            }
            analysesByDay[day].total++;
            if (job.status === 'success') analysesByDay[day].success++;
            if (job.status === 'failed') analysesByDay[day].failed++;
        });

        // 3. Popular skills from all profiles
        const profiles = await Profile.findAll({
            attributes: ['skills', 'extractedSnippets', 'title'],
        });

        const skillCounts: Record<string, number> = {};
        const domainCounts: Record<string, number> = {};

        profiles.forEach((profile: any) => {
            // Count skills
            const skills = profile.skills || [];
            if (Array.isArray(skills)) {
                skills.forEach((skill: string) => {
                    const normalizedSkill = skill?.toLowerCase()?.trim();
                    if (normalizedSkill && normalizedSkill.length > 1) {
                        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
                    }
                });
            }

            // Determine domain from title or extractedSnippets
            const title = (profile.title || '').toLowerCase();
            const snippets = profile.extractedSnippets?.classification || {};
            const domainSkills = snippets.skills?.domain || [];

            // Domain detection logic
            let domain = 'Other';
            if (title.includes('engineer') || title.includes('developer') || title.includes('programmer')) {
                domain = 'Engineering/Tech';
            } else if (title.includes('account') || title.includes('finance') || title.includes('audit')) {
                domain = 'Finance/Accounting';
            } else if (title.includes('supply') || title.includes('logistics') || title.includes('warehouse')) {
                domain = 'Supply Chain';
            } else if (title.includes('teacher') || title.includes('education') || title.includes('professor')) {
                domain = 'Education';
            } else if (title.includes('marketing') || title.includes('sales') || title.includes('business')) {
                domain = 'Marketing/Sales';
            } else if (title.includes('design') || title.includes('art') || title.includes('creative')) {
                domain = 'Design/Creative';
            } else if (title.includes('health') || title.includes('medical') || title.includes('nurse')) {
                domain = 'Healthcare';
            } else if (title.includes('hr') || title.includes('human resource') || title.includes('recruit')) {
                domain = 'HR/Recruitment';
            } else if (domainSkills.length > 0) {
                domain = domainSkills[0]?.name || 'Other';
            }

            domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });

        // Get top 10 skills
        const topSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

        // Format domain distribution
        const domainDistribution = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));

        // Generate complete date range for charts
        const dateRange: string[] = [];
        for (let i = Number(days) - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            dateRange.push(date.toISOString().split('T')[0]);
        }

        const signupsTimeSeries = dateRange.map(date => ({
            date,
            signups: signupsByDay[date] || 0,
        }));

        const analysesTimeSeries = dateRange.map(date => ({
            date,
            total: analysesByDay[date]?.total || 0,
            success: analysesByDay[date]?.success || 0,
            failed: analysesByDay[date]?.failed || 0,
        }));

        // Calculate success rate trend
        let runningSuccess = 0;
        let runningTotal = 0;
        const successRateTrend = analysesTimeSeries.map(day => {
            runningTotal += day.total;
            runningSuccess += day.success;
            return {
                date: day.date,
                successRate: runningTotal > 0 ? Math.round((runningSuccess / runningTotal) * 100) : 0,
            };
        });

        console.log('✅ Analytics data prepared');
        res.json({
            signups: signupsTimeSeries,
            analyses: analysesTimeSeries,
            successRateTrend,
            topSkills,
            domainDistribution,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
