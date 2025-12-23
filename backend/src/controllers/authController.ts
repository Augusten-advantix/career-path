import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ email, password, name });

        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create Admin User - Requires ADMIN_SECRET_KEY
 * This endpoint allows creating admin users remotely without existing auth
 * Usage: POST /api/auth/create-admin
 * Body: { email, password, name, secretKey }
 */
export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password, name, secretKey } = req.body;

        // Verify secret key
        const expectedSecretKey = process.env.ADMIN_SECRET_KEY;
        if (!expectedSecretKey) {
            console.error('❌ ADMIN_SECRET_KEY not configured in environment');
            return res.status(500).json({ message: 'Admin creation not configured' });
        }

        if (secretKey !== expectedSecretKey) {
            console.warn('⚠️ Invalid admin secret key attempt');
            return res.status(403).json({ message: 'Invalid secret key' });
        }

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create admin user
        const adminUser = await User.create({
            email,
            password,
            name: name || 'Admin',
            isAdmin: true,
            role: 'admin'
        });

        console.log(`✅ Admin user created: ${email}`);

        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                isAdmin: adminUser.isAdmin,
                role: adminUser.role,
            }
        });
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
