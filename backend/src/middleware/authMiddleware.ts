import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('🔐 Auth middleware called for:', req.method, req.path);
    const authHeader = req.header('Authorization');
    console.log('🔑 Authorization header:', authHeader ? 'Present' : 'Missing');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        console.log('❌ No token found in request');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔍 Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('🔐 JWT Secret being used:', config.jwtSecret ? 'Set' : 'Not set');

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('✅ Token verified successfully. User:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error instanceof Error ? error.message : error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
