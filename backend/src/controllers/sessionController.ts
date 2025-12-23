import { Request, Response } from 'express';
import Profile from '../models/Profile';
import RoadmapProgress from '../models/RoadmapProgress';

interface AuthRequest extends Request {
    user?: any;
}

// Get user's session state
export const getSessionState = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log('📍 Getting session state for user:', userId);

        // First check if user has an existing roadmap
        const roadmap = await RoadmapProgress.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        if (roadmap) {
            console.log('✅ User has roadmap, stage: complete');
            return res.json({
                stage: 'complete',
                hasRoadmap: true,
            });
        }

        // Check for latest profile with session data
        const profile = await Profile.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        if (profile) {
            console.log('📝 User has profile, stage:', profile.sessionStage || 'review');
            return res.json({
                stage: profile.sessionStage || 'review',
                profileId: profile.id,
                resumeText: profile.resumeText,
                classification: profile.extractedSnippets?.classification,
                conversationHistory: profile.conversationHistory || [],
                hasRoadmap: false,
            });
        }

        // No profile or roadmap found
        console.log('🆕 New user, no session data');
        return res.json({
            stage: 'none',
            hasRoadmap: false,
        });

    } catch (error) {
        console.error('Error getting session state:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user's session stage
export const updateSessionState = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { stage, profileId, resumeText, conversationHistory } = req.body;
        console.log('💾 Updating session state for user:', userId, 'stage:', stage);

        if (profileId) {
            // Update specific profile
            await Profile.update(
                {
                    sessionStage: stage,
                    ...(resumeText && { resumeText }),
                    ...(conversationHistory && { conversationHistory })
                },
                { where: { id: profileId, userId } }
            );
        } else {
            // Update latest profile
            const profile = await Profile.findOne({
                where: { userId },
                order: [['createdAt', 'DESC']],
            });

            if (profile) {
                await profile.update({
                    sessionStage: stage,
                    ...(resumeText && { resumeText }),
                    ...(conversationHistory && { conversationHistory })
                });
            }
        }

        console.log('✅ Session state updated');
        res.json({ success: true, stage });

    } catch (error) {
        console.error('Error updating session state:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
