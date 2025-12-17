import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { config } from '../config';
import { useToast } from '../components/ToastContext';

const JobQuestionnaire: React.FC = () => {
    const { token } = useAuth();
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [answer, setAnswer] = useState('');
    const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [requirements, setRequirements] = useState<any>(null);
    const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState<number>(5);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { showToast } = useToast();

    useEffect(() => {
        startConversation();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [history, currentQuestion]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${config.apiUrl}/recruiter/job-requirements/start`, { availableHoursPerWeek }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setConversationId(response.data.conversationId);
            setCurrentQuestion(response.data.question);
        } catch (error) {
            console.error('Error starting conversation:', error);
            showToast('error', 'Failed to start conversation');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim() || !conversationId) return;

        try {
            setLoading(true);

            // Add to history
            setHistory([...history, { question: currentQuestion, answer }]);

            const response = await axios.post(
                `${config.apiUrl}/recruiter/job-requirements/${conversationId}/answer`,
                { answer, availableHoursPerWeek },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.complete) {
                setIsComplete(true);
                setRequirements(response.data.requirements);
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setCurrentQuestion(response.data.question);
            }

            setAnswer('');
        } catch (error) {
            console.error('Error submitting answer:', error);
            showToast('error', 'Failed to submit answer');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitAnswer();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-2xl p-4 sm:p-6 border-b-2 sm:border-b-4 border-purple-500">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            ✨ Define Job Requirements
                        </h1>
                        <p className="text-purple-100 text-xs sm:text-sm mt-1 sm:mt-2 font-semibold">
                            Let's understand what you're looking for in candidates
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-3xl sm:text-4xl font-bold text-white">{history.length}</div>
                            <div className="text-xs text-purple-100 font-bold">Questions</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-purple-100 font-bold hidden sm:inline">Hours/week</label>
                            <label className="text-xs text-purple-100 font-bold sm:hidden">Hrs</label>
                            <input
                                type="number"
                                min={1}
                                max={40}
                                step={1}
                                value={availableHoursPerWeek}
                                onChange={(e) => setAvailableHoursPerWeek(Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-md text-black font-semibold"
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="max-w-4xl mx-auto mt-6">
                    <div className="w-full bg-purple-400 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((history.length / 5) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-purple-100 mt-2 font-semibold">
                        {isComplete ? '✅ Complete! Analyzing your requirements...' : '⏳ Typically 5-7 questions'}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {history.map((entry, index) => (
                        <div key={index} className="space-y-4">
                            {/* AI Question */}
                            <div className="flex justify-start">
                                <div className="max-w-[85%] sm:max-w-[80%] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 shadow-md rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">✨</span>
                                        <span className="text-xs font-bold text-purple-600">🤖 Assistant</span>
                                    </div>
                                    <p className="text-sm leading-relaxed font-semibold">{entry.question}</p>
                                </div>
                            </div>
                            {/* User Answer */}
                            <div className="flex justify-end">
                                <div className="max-w-[80%] bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg rounded-3xl px-5 py-4">
                                    <p className="text-sm leading-relaxed font-semibold">{entry.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Current Question */}
                    {currentQuestion && !isComplete && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 shadow-md rounded-3xl px-5 py-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">✨</span>
                                    <span className="text-xs font-bold text-purple-600">🤖 Assistant</span>
                                </div>
                                <p className="text-sm leading-relaxed font-semibold">{currentQuestion}</p>
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl px-5 py-4 shadow-md">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-slate-700 font-bold">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete Indicator */}
                    {isComplete && (
                        <div className="flex justify-center mt-4">
                            <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 border-2 border-emerald-400 rounded-3xl px-6 py-5 flex items-center gap-3 shadow-lg">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-bold text-emerald-900">Requirements Captured!</p>
                                    <p className="text-sm text-emerald-700 font-semibold">Preparing your dashboard...</p>
                                    {requirements && requirements.jobTitle && (
                                        <p className="text-xs text-emerald-700 mt-1 font-semibold">Job: {requirements.jobTitle}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            {!isComplete && (
                <div className="bg-white shadow-2xl p-5 border-t-4 border-slate-200">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer here..."
                            className="flex-1 px-3 sm:px-5 py-2 sm:py-3 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none font-semibold text-slate-900 bg-slate-50 text-sm sm:text-base"
                            rows={2}
                            disabled={loading}
                        />
                        <button
                            onClick={submitAnswer}
                            disabled={!answer.trim() || loading}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm sm:text-base"
                        >
                            {loading ? '⏳ Sending...' : '📤 Send'}
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-semibold max-w-4xl mx-auto">Press Enter to send, Shift+Enter for new line</p>
                </div>
            )}
        </div>
    );
};

export default JobQuestionnaire;
