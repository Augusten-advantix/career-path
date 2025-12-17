import express from 'express';
import multer from 'multer';
import { uploadFiles, getProfiles, deleteProfiles } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', authenticateToken, upload.array('files'), uploadFiles);
router.get('/profiles', authenticateToken, getProfiles);
router.post('/profiles/delete', authenticateToken, deleteProfiles);

export default router;
