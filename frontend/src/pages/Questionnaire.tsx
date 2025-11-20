import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { config } from '../config';

interface Question {
    id: string;
    text: string;
    type: 'text' | 'number' | 'textarea';
}

const Questionnaire: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/questions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setQuestions(response.data);
            } catch (error) {
                console.error('Error fetching questions', error);
            }
        };
        fetchQuestions();
    }, [token]);

    const handleChange = (id: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 Questionnaire submission started');

        try {
            const resumePath = location.state?.resumePath || localStorage.getItem('resumePath');
            const resumeText = location.state?.resumeText;

            console.log('📋 Submission data:', {
                answersCount: Object.keys(answers).length,
                answers: answers,
                resumePath: resumePath,
                hasResumeText: !!resumeText,
                resumeTextLength: resumeText ? resumeText.length : 0,
                locationState: location.state,
                localStorageResumePath: localStorage.getItem('resumePath')
            });

            console.log('📤 Sending request to API...');
            const response = await axios.post(`${config.apiUrl}/analyze`, { answers, resumePath, resumeText }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('✅ API response received:', response.data);
            navigate('/roadmap', { state: { analysis: response.data } });
        } catch (error) {
            console.error('❌ Error analyzing profile:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
            }
            alert('Failed to generate roadmap. Please ensure you have uploaded a resume.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Career Context Questionnaire</h2>
                <form onSubmit={handleSubmit}>
                    {questions.map((q) => (
                        <div key={q.id} className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">{q.text}</label>
                            {q.type === 'textarea' ? (
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    required
                                />
                            ) : (
                                <input
                                    type={q.type}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Submit & Generate Roadmap
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;
