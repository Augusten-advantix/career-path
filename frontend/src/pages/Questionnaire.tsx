import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContext';
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
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const { showToast } = useToast();
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
        setLoading(true);

        try {
            const resumeText = location.state?.resumeText;

            if (!resumeText) {
                showToast('error', 'Resume text not found. Please upload your resume again.');
                navigate('/');
                return;
            }

            const targetRole = answers['role'] || 'Software Engineer';

            const response = await axios.post(
                `${config.apiUrl}/analysis/complete`,
                { resumeText, targetRole, answers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/roadmap', { state: { analysis: response.data } });
        } catch (error) {
            console.error('Error analyzing profile:', error);
            showToast('error', 'Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-3">📋 Career Questionnaire</h2>
                <p className="text-slate-700 mb-8 text-base sm:text-lg font-semibold">
                    Help us understand your goals by answering a few questions.
                </p>
                <form onSubmit={handleSubmit}>
                    {questions.map((q, index) => (
                        <div key={q.id} className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200 last:border-b-0">
                            <label className="block text-slate-900 font-bold mb-3 text-base sm:text-lg">✨ {index + 1}. {q.text}</label>
                            {q.type === 'textarea' ? (
                                <textarea
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Your answer here..."
                                />
                            ) : (
                                <input
                                    type={q.type}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-slate-900 placeholder-slate-400 font-medium"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleChange(q.id, e.target.value)}
                                    required
                                    placeholder={q.type === 'number' ? 'Enter a number...' : 'Your answer here...'}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                            ? 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                🤖 Analyzing with AI...
                            </span>
                        ) : (
                            '🚀 Generate Your AI Roadmap'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;
