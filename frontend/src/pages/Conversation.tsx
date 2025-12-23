import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';

interface Message {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

// Helper function to render markdown-style formatting in messages
const formatMessageContent = (content: string): React.ReactNode => {
    // Split by **bold** and *italic* patterns
    const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text
            return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
            // Italic text
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const Conversation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState<number>(5);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const resumeText = location.state?.resumeText;
    const profileId = location.state?.profileId; // Get profileId from ProfileReview
    const model = location.state?.model || localStorage.getItem('selectedModel') || 'gemini-2.0-flash';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log('🔍 Conversation component mounted, resumeText:', resumeText ? 'present' : 'missing');
        console.log('🔍 fromSession:', location.state?.fromSession);
        console.log('🔍 conversationHistory length:', location.state?.conversationHistory?.length || 0);

        // If we have location.state with resumeText, use it
        if (resumeText) {
            // Check if restoring from session with conversation history
            if (location.state?.fromSession && location.state?.conversationHistory) {
                let history = location.state.conversationHistory;

                // Parse if it's a string (from JSON storage)
                if (typeof history === 'string') {
                    try {
                        history = JSON.parse(history);
                    } catch (e) {
                        console.error('Failed to parse conversation history:', e);
                        history = [];
                    }
                }

                // Validate it's an array with items
                if (Array.isArray(history) && history.length > 0) {
                    // Convert timestamp strings back to Date objects
                    const parsedHistory: Message[] = history.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    console.log('🔄 Restoring conversation from session (via navigation):', parsedHistory.length, 'messages');
                    setMessages(parsedHistory);
                    setQuestionCount(Math.ceil(parsedHistory.length / 2));
                    setIsLoading(false);
                } else {
                    console.log('🆕 Invalid or empty history, starting new conversation');
                    startConversation();
                }
            } else {
                console.log('🆕 Starting new conversation');
                startConversation();
            }
        } else {
            // No location.state (probably a refresh) - try to fetch session from backend
            console.log('🔄 No location.state detected, fetching session from backend...');
            fetchAndRestoreSession();
        }
    }, []);

    const fetchAndRestoreSession = async () => {
        setIsLoading(true);
        try {
            const sessionRes = await axios.get(`${config.apiUrl}/session/state`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const session = sessionRes.data;
            console.log('📥 Fetched session state:', session);

            // Parse conversation history if it's a string
            let history = session.conversationHistory;
            if (typeof history === 'string') {
                try {
                    history = JSON.parse(history);
                } catch (e) {
                    console.error('Failed to parse conversation history:', e);
                    history = [];
                }
            }

            if (session.stage === 'conversation' && Array.isArray(history) && history.length > 0) {
                // Restore conversation from backend - convert timestamps to Date objects
                const parsedHistory: Message[] = history.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                console.log('🔄 Restoring conversation from backend:', parsedHistory.length, 'messages');
                setMessages(parsedHistory);
                setQuestionCount(Math.ceil(parsedHistory.length / 2));
            } else if (session.resumeText) {
                // Have resumeText but no conversation history - start new conversation
                console.log('🆕 Have resumeText, starting new conversation');
                const response = await axios.post(
                    `${config.apiUrl}/conversation/start`,
                    { resumeText: session.resumeText, answers: { availableHoursPerWeek }, model },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.data.question,
                    timestamp: new Date()
                };
                setMessages([aiMessage]);
                setQuestionCount(1);
            } else {
                // No useful session data - redirect to roadmap
                console.log('❌ No session data, redirecting to roadmap');
                navigate('/roadmap');
            }
        } catch (error) {
            console.error('Error fetching session:', error);
            navigate('/roadmap');
        } finally {
            setIsLoading(false);
        }
    };

    const startConversation = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.apiUrl}/conversation/start`,
                { resumeText, answers: { availableHoursPerWeek }, model },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMessage: Message = {
                role: 'assistant',
                content: response.data.question,
                timestamp: new Date()
            };
            setMessages([aiMessage]);
            setQuestionCount(1);
        } catch (error) {
            console.error('Error starting conversation:', error);
            showToast('error', 'Failed to start conversation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: userInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${config.apiUrl}/conversation/next`,
                {
                    resumeText,
                    conversationHistory: [...messages, userMessage],
                    answers: { availableHoursPerWeek },
                    model
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.isLastQuestion) {
                setIsComplete(true);
                completeAnalysis([...messages, userMessage]);
            } else {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.data.question,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setQuestionCount(prev => prev + 1);

                // Save conversation history after each exchange
                saveConversationProgress([...messages, userMessage, aiMessage]);
            }
        } catch (error) {
            console.error('Error getting next question:', error);
            showToast('error', 'Failed to continue conversation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveConversationProgress = async (conversationHistory: Message[]) => {
        // Save conversation to backend for session restoration
        try {
            await axios.post(
                `${config.apiUrl}/session/state`,
                {
                    stage: 'conversation',
                    profileId,
                    conversationHistory
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('💾 Conversation progress saved');
        } catch (err) {
            console.error('Failed to save conversation progress:', err);
            // Don't show error to user - it's a background save
        }
    };

    const completeAnalysis = async (conversationHistory: Message[]) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${config.apiUrl}/analyze`,
                {
                    resumeText,
                    conversationHistory,
                    answers: { availableHoursPerWeek },
                    model,
                    profileId // Pass profileId to backend
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/roadmap', { state: { analysis: response.data } });
        } catch (error) {
            console.error('Error completing analysis:', error);
            showToast('error', 'Failed to generate roadmap. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto flex flex-col h-screen max-h-screen">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-3xl shadow-2xl p-4 sm:p-6 border-b-4 border-blue-500">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <Sparkles className="w-8 h-8" />
                                AI Career Coach
                            </h1>
                            <p className="text-blue-100 text-sm mt-2 font-semibold">
                                Let's discuss your career goals and aspirations
                            </p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6">
                            <div className="text-right">
                                <div className="text-3xl sm:text-4xl font-bold text-white">{questionCount}</div>
                                <div className="text-xs text-blue-100 font-bold">Questions</div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <label className="text-xs text-blue-100 font-bold">Hours/week</label>
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

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="w-full bg-blue-400 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((questionCount / 7) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-blue-100 mt-2 font-semibold">
                                {isComplete ? '✅ Complete! Generating your roadmap...' : '⏳ Typically 5-7 questions'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="bg-gradient-to-br from-white to-slate-50 shadow-lg p-3 sm:p-6 flex-1 overflow-y-auto border-x-2 border-slate-200">
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] sm:max-w-[80%] rounded-3xl px-4 sm:px-5 py-3 sm:py-4 ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 shadow-md'
                                        }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-600">🤖 Coach</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed font-medium">{formatMessageContent(msg.content)}</p>
                                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-600'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl px-5 py-4 shadow-md">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs text-slate-700 font-bold">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isComplete && (
                            <div className="flex justify-center mt-4">
                                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 border-2 border-emerald-400 rounded-3xl px-6 py-5 flex items-center gap-3 shadow-lg">
                                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                                    <div>
                                        <p className="font-bold text-emerald-900">✅ Conversation Complete!</p>
                                        <p className="text-sm text-emerald-700 font-semibold">Generating your personalized roadmap...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                {!isComplete && (
                    <div className="bg-white rounded-b-3xl shadow-2xl p-5 border-t-4 border-slate-200">
                        <div className="flex gap-3">
                            <textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your answer here..."
                                className="flex-1 px-3 sm:px-5 py-2 sm:py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-semibold text-slate-900 bg-slate-50 text-sm sm:text-base"
                                rows={2}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !userInput.trim()}
                                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm sm:text-base"
                            >
                                <Send className="w-5 h-5" />
                                Send
                            </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 font-semibold">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conversation;



