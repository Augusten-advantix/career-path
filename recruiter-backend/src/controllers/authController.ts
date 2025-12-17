import { Request, Response } from 'express';
import Recruiter from '../models/Recruiter';
import jwt from 'jsonwebtoken';

/**
 * Register a new recruiter.
 * Includes basic validation and detailed logging.
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        // Validate required fields
        if (!email || !password) {
            console.warn('Register attempt with missing email or password', { email, name });
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingRecruiter = await Recruiter.findOne({ where: { email } });
        if (existingRecruiter) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const recruiter = await Recruiter.create({ email, password, name });
        const token = jwt.sign(
            { id: recruiter.id, email: recruiter.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Recruiter registered successfully',
            token,
            user: { id: recruiter.id, email: recruiter.email, name: recruiter.name },
        });
    } catch (error) {
        console.error('Register error:', error instanceof Error ? error.stack : error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Login an existing recruiter.
 * Includes validation and detailed error logging.
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.warn('Login attempt with missing fields', { email });
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const recruiter = await Recruiter.findOne({ where: { email } });
        if (!recruiter) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValid = await recruiter.validatePassword(password);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: recruiter.id, email: recruiter.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: recruiter.id, email: recruiter.email, name: recruiter.name },
        });
    } catch (error) {
        console.error('Login error:', error instanceof Error ? error.stack : error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
