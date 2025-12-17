import { Message } from './conversationService';

export interface ProgressItem {
    stepId: string;
    completed: boolean;
    completedAt: Date | null;
    deadline: Date;
    startDate: Date;
}

/**
 * Calculate deadline date by adding deadline_days to start date
 */
export const calculateDeadline = (deadlineDays: number, startDate: Date): Date => {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + deadlineDays);
    return deadline;
};

/**
 * Initialize progress array with calculated deadlines for all roadmap steps
 */
export const initializeProgress = (roadmapSteps: any[], createdAt: Date = new Date()): ProgressItem[] => {
    return roadmapSteps.map((step) => ({
        stepId: step.id,
        completed: false,
        completedAt: null,
        deadline: calculateDeadline(step.deadline_days || 30, createdAt),
        startDate: createdAt,
    }));
};

/**
 * Check which steps are past their deadline and not completed
 */
export const checkOverdueSteps = (progress: ProgressItem[]): string[] => {
    const now = new Date();
    return progress
        .filter((item) => !item.completed && new Date(item.deadline) < now)
        .map((item) => item.stepId);
};

/**
 * Update completion status of a specific step
 */
export const updateStepCompletion = (
    progress: ProgressItem[],
    stepId: string,
    completed: boolean
): ProgressItem[] => {
    return progress.map((item) => {
        if (item.stepId === stepId) {
            return {
                ...item,
                completed,
                completedAt: completed ? new Date() : null,
            };
        }
        return item;
    });
};

/**
 * Calculate overall completion percentage
 */
export const calculateCompletionPercentage = (progress: ProgressItem[]): number => {
    if (progress.length === 0) return 0;
    const completedCount = progress.filter((item) => item.completed).length;
    return Math.round((completedCount / progress.length) * 100);
};
