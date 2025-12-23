import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('🔐 Admin middleware called for:', req.method, req.path);

    if (!req.user) {
        console.log('❌ No user found in request (auth middleware not applied?)');
        return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('👤 User:', req.user.email, 'isAdmin:', req.user.isAdmin);

    if (!req.user.isAdmin && req.user.role !== 'admin') {
        console.log('❌ User is not an admin');
        return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('✅ Admin access granted');
    next();
};
