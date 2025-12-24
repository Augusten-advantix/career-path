import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Send, Sparkles } from 'lucide-react';
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
    const [availableHoursPerWeek] = useState<number>(5); // Hidden from UI but used in backend
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
            console.log('📊 Session details:', {
                stage: session.stage,
                hasResumeText: !!session.resumeText,
                hasHistory: !!session.conversationHistory,
                historyLength: session.conversationHistory?.length || 0,
                profileId: session.profileId
            });

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
                console.warn('⚠️ No session data - stage:', session.stage, 'resumeText:', !!session.resumeText, 'history:', history?.length || 0);
                console.log('❌ Redirecting to roadmap');
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
                    resumeText,  // Include resumeText for session restoration
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
        <div className="min-h-screen bg-[#050505] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white tracking-tight">AI Career Coach</h1>
                            <p className="text-sm text-slate-400">Let's discuss your career goals and aspirations</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-2 sm:p-4">{/* Header removed - using sticky header above */}

                {/* Messages Area */}
                <div className="bg-[#0A0A0A] border-x border-white/5 shadow-lg p-3 sm:p-5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] sm:max-w-[80%] rounded-lg px-4 sm:px-4 py-3 sm:py-3 ${msg.role === 'user'
                                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-slate-200'
                                        : 'bg-white/5 border border-white/10 text-slate-300'
                                        }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-xs font-medium text-indigo-400">Coach</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed">{formatMessageContent(msg.content)}</p>
                                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isComplete && (
                            <div className="flex justify-center mt-4">
                                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg px-6 py-4 flex items-center gap-4">
                                    {/* Animated spinner */}
                                    <div className="relative">
                                        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-indigo-400/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-indigo-400 text-sm flex items-center gap-2">
                                            <span className="inline-block animate-pulse">✨</span>
                                            Generating Your Roadmap
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">Analyzing your profile and creating a personalized plan...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                {!isComplete && (
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-b-xl shadow-lg p-4">
                        <div className="flex gap-3">
                            <textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your answer here..."
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-200 placeholder-slate-500 text-sm sm:text-base"
                                rows={2}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !userInput.trim()}
                                className="px-4 sm:px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm sm:text-base border border-indigo-500/50"
                            >
                                <Send className="w-4 h-4" />
                                Send
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conversation;



