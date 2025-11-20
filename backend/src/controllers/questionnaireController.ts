import { Request, Response } from 'express';
import { getQuestions } from '../services/questionnaire';

export const getQuestionnaire = (req: Request, res: Response) => {
    const questions = getQuestions();
    res.status(200).json(questions);
};

export const submitQuestionnaire = (req: Request, res: Response) => {
    const { answers } = req.body;
    // In a real app, save answers to DB associated with the user/analysis
    res.status(200).json({ message: 'Answers submitted successfully', answers });
};
