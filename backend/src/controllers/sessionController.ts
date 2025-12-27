import { Request, Response } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

// In-memory session storage (replace with Redis in production)
const sessionStore = new Map<number, any>();

export const getSessionState = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const sessionData = sessionStore.get(userId) || null;

        res.json(sessionData);
    } catch (error) {
        console.error('Error getting session state:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSessionState = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const sessionData = req.body;

        sessionStore.set(userId, {
            ...sessionData,
            userId,
            updatedAt: new Date()
        });

        res.json({ message: 'Session state updated successfully' });
    } catch (error) {
        console.error('Error updating session state:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
