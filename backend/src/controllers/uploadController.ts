import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { parseDocument } from '../services/parser';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Files of type PDF, DOC, DOCX, and TXT only!'));
        }
    },
});

export const uploadMiddleware = upload.single('resume');

export const uploadResume = async (req: Request, res: Response) => {
    console.log('📤 Upload request received');
    if (!req.file) {
        console.log('❌ No file attached to request');
        return res.status(400).json({ message: 'Please upload a file' });
    }

    console.log('📄 File details:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });

    try {
        console.log('🔍 Starting document parsing...');
        const text = await parseDocument(req.file.path);
        console.log('✅ Document parsed successfully');
        console.log('📝 Parsed text length:', text.length, 'characters');
        console.log('📝 First 200 characters:', text.substring(0, 200));

        res.status(200).json({
            message: 'File uploaded and parsed successfully',
            filename: req.file.filename,
            text: text,
        });
        console.log('✅ Response sent to client');
    } catch (error) {
        console.error('❌ Error processing file:', error);
        res.status(500).json({ message: 'Error processing file' });
    }
};
