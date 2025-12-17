import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import {
    ArrowLeft,
    Target,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    Lightbulb,
    ListChecks,
    Trophy,
    ChevronRight,
    Home,
    LogOut,
    User
} from 'lucide-react';

interface SubStep {
    id: string;
    title: string;
    dayRange: string;
    description: string;
    microTasks: string[];
    expectedOutput?: string;
}

interface StepMilestone {
    title: string;
    checkpoints: string[];
}

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    goal?: string;
    category: string;
    priority: number;
    estimatedHours?: number;
    timeframeWeeks?: number;
    suggested_timeframe?: string;
    subSteps?: SubStep[];
    prerequisites?: string[];
    completionCriteria?: string[];
    practiceExercises?: string[];
    commonMistakes?: string[];
    milestone?: StepMilestone;
}

const StepDetail: React.FC = () => {
    const { stepIndex } = useParams<{ stepIndex: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user, token } = useAuth();

    const [step, setStep] = useState<RoadmapStep | null>(location.state?.step || null);
    const [stepNumber, setStepNumber] = useState<number>(parseInt(stepIndex || '0') + 1);
    const [loading, setLoading] = useState(!location.state?.step);

    useEffect(() => {
        if (!step) {
            fetchStep();
        }
    }, [stepIndex]);

    const fetchStep = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/roadmap/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.roadmap) {
                const roadmapData = response.data.roadmap;
                const steps = Array.isArray(roadmapData) ? roadmapData : (roadmapData.steps || []);
                const index = parseInt(stepIndex || '0');

                if (steps[index]) {
                    setStep(steps[index]);
                    setStepNumber(index + 1);
                } else {
                    navigate('/roadmap');
                }
            }
        } catch (error) {
            console.error('Error fetching step:', error);
            navigate('/roadmap');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
        if (priority <= 4) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 font-semibold">Loading step details...</p>
                </div>
            </div>
        );
    }

    if (!step) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Step Not Found</h2>
                    <p className="text-slate-300 mb-8">We couldn't find this step in your roadmap.</p>
                    <Link
                        to="/roadmap"
                        state={{ activeTab: 'roadmap' }}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Roadmap
                    </Link>
                </div>
            </div>
        );
    }

    const priorityColors = getPriorityColor(step.priority);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <Link to="/" className="flex items-center gap-1">
                            <img src="/colorlogo.png" alt="CareerPath Logo" className="w-14 h-14" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">CareerPath AI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600">
                                <User className="w-4 h-4" />
                                <span>{user?.email}</span>
                            </div>
                            <Link
                                to="/"
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                title="Go to Home"
                            >
                                <Home className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Back Navigation */}
                <Link
                    to="/roadmap"
                    state={{ activeTab: 'roadmap' }}
                    className="inline-flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Roadmap
                </Link>

                {/* Step Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {stepNumber}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{step.title}</h1>
                                <div className="flex flex-wrap gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${priorityColors.bg} ${priorityColors.text}`}>
                                        ⚡ Priority {step.priority}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                        {step.suggested_timeframe || `${step.timeframeWeeks || 1} weeks`}
                                    </span>
                                    {step.estimatedHours && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                            ~{step.estimatedHours} hours
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goal Section - or Description as fallback */}
                    {step.goal ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-800 mb-1"> Goal</h3>
                                    <p className="text-emerald-700">{step.goal}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Fallback: Show description as overview when no goal exists */
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-800 mb-1">📚 Overview</h3>
                                    <p className="text-blue-700">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sub-Steps Section */}
                {step.subSteps && step.subSteps.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ListChecks className="w-6 h-6 text-blue-500" />
                            Step-by-Step Breakdown
                        </h2>
                        <div className="space-y-6">
                            {step.subSteps.map((subStep, index) => (
                                <div
                                    key={subStep.id || index}
                                    className="relative pl-8 pb-6 border-l-2 border-blue-200 last:border-l-0 last:pb-0"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>

                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <span className="text-blue-500">🔹</span>
                                                Step {index + 1} — {subStep.title}
                                            </h3>
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium w-fit">
                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                {subStep.dayRange}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 mb-4">{subStep.description}</p>

                                        {/* Micro Tasks */}
                                        {subStep.microTasks && subStep.microTasks.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Sub-steps:</h4>
                                                <ul className="space-y-2">
                                                    {subStep.microTasks.map((task, taskIndex) => (
                                                        <li key={taskIndex} className="flex items-start gap-2 text-sm text-slate-600">
                                                            <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                            <span>{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Expected Output */}
                                        {subStep.expectedOutput && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <p className="text-sm text-amber-800">
                                                    <span className="font-semibold">Expected Output:</span> {subStep.expectedOutput}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Fallback: Create a "What You'll Learn" section from the description */
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ListChecks className="w-6 h-6 text-blue-500" />
                            What You'll Learn
                        </h2>

                        {/* Show the full description in a well-formatted way */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{step.description}</p>
                        </div>

                        {/* Suggested approach based on timeframe */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-800">Suggested Pace</h4>
                                </div>
                                <p className="text-blue-700 text-sm">
                                    Dedicate {step.estimatedHours ? `~${Math.round(step.estimatedHours / (step.timeframeWeeks || 1))} hours/week` : '5-10 hours/week'} over {step.suggested_timeframe || `${step.timeframeWeeks || 1} weeks`}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-semibold text-purple-800">Focus Area</h4>
                                </div>
                                <p className="text-purple-700 text-sm">
                                    {step.category || 'Learning'} - Priority {step.priority} task
                                </p>
                            </div>
                        </div>

                        {/* Tip for users */}
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-amber-800 text-sm flex items-start gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong>Tip:</strong> Break down this step into daily tasks. For example, if you have 1 week,
                                    divide the learning into 5-7 smaller chunks and track your progress daily.
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Practice Exercises */}
                {step.practiceExercises && step.practiceExercises.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-purple-500" />
                            Practice Exercises
                        </h2>
                        <ul className="space-y-3">
                            {step.practiceExercises.map((exercise, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="text-purple-800">{exercise}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Common Mistakes */}
                {step.commonMistakes && step.commonMistakes.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                            Common Pitfalls to Avoid
                        </h2>
                        <ul className="space-y-3">
                            {step.commonMistakes.map((mistake, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <span className="text-orange-500 text-lg">⚠️</span>
                                    <span className="text-orange-800">{mistake}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Completion Criteria */}
                {step.completionCriteria && step.completionCriteria.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            Completion Criteria
                        </h2>
                        <ul className="space-y-3">
                            {step.completionCriteria.map((criteria, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-emerald-800">{criteria}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Milestone */}
                {step.milestone && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            {step.milestone.title}
                        </h2>
                        {step.milestone.checkpoints && step.milestone.checkpoints.length > 0 && (
                            <ul className="space-y-2">
                                {step.milestone.checkpoints.map((checkpoint, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="text-blue-200">✔</span>
                                        <span>{checkpoint}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Prerequisites */}
                {step.prerequisites && step.prerequisites.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-amber-500" />
                            Prerequisites
                        </h2>
                        <ul className="space-y-2">
                            {step.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-center gap-2 text-slate-700">
                                    <ChevronRight className="w-4 h-4 text-amber-500" />
                                    <span>{prereq}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Back to Roadmap Button */}
                <div className="flex justify-center mt-8">
                    <Link
                        to="/roadmap"
                        state={{ activeTab: 'roadmap' }}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Roadmap
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default StepDetail;
