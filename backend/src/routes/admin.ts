import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import * as adminController from '../controllers/adminController';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Profile Management
router.get('/profiles', adminController.getAllProfiles);
router.get('/profiles/:id', adminController.getProfileById);
router.delete('/profiles/:id', adminController.deleteProfile);

// Analysis Job Monitoring
router.get('/jobs', adminController.getAllAnalysisJobs);
router.get('/jobs/stats', adminController.getJobStats);
router.post('/jobs/:id/retry', adminController.retryFailedJob);

// System Statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// Analytics
router.get('/analytics', adminController.getAnalytics);

export default router;
