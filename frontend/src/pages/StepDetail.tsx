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
    User,
    Sparkles
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
        if (priority <= 2) return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
        if (priority <= 4) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading step details...</p>
                </div>
            </div>
        );
    }

    if (!step) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="text-center bg-[#050505] p-12 rounded-xl shadow-sm max-w-md w-full border border-white/10">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Step Not Found</h2>
                    <p className="text-slate-400 mb-8">We couldn't find this step in your roadmap.</p>
                    <Link
                        to="/roadmap"
                        state={{ activeTab: 'roadmap' }}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-slate-200 transition-all font-semibold"
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
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30">
            {/* Header */}
            <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <Sparkles className="h-4 w-4 text-indigo-400" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">CareerPath AI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <User className="w-3.5 h-3.5" />
                                <span>{user?.email}</span>
                            </div>
                            <Link
                                to="/"
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Go to Home"
                            >
                                <Home className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
                {/* Back Navigation */}
                <Link
                    to="/roadmap"
                    state={{ activeTab: 'roadmap' }}
                    className="inline-flex items-center text-slate-500 hover:text-white mb-8 transition-colors group text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Roadmap
                </Link>

                {/* Step Header */}
                <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white font-bold text-xl border border-white/10">
                                {stepNumber}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{step.title}</h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`}>
                                        Priority {step.priority}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                                        <Clock className="w-3 h-3 mr-1.5" />
                                        {step.suggested_timeframe || `${step.timeframeWeeks || 1} weeks`}
                                    </span>
                                    {step.estimatedHours && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                                            <Calendar className="w-3 h-3 mr-1.5" />
                                            ~{step.estimatedHours} hours
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goal Section */}
                    {step.goal ? (
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                            <div className="flex items-start gap-4">
                                <Target className="w-5 h-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">Goal</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.goal}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                            <div className="flex items-start gap-4">
                                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">Overview</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sub-Steps Section */}
                {step.subSteps && step.subSteps.length > 0 ? (
                    <div className="space-y-8 mb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg font-semibold text-white">Step Breakdown</h2>
                        </div>

                        <div className="relative pl-6 space-y-6 border-l border-white/10 ml-3">
                            {step.subSteps.map((subStep, index) => (
                                <div key={subStep.id || index} className="relative pl-6">
                                    {/* Timeline dot */}
                                    <div className="absolute left-[-29px] top-6 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#050505]"></div>

                                    <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/10 transition-all hover:bg-white/[0.02]">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <h3 className="font-semibold text-white text-lg">
                                                {subStep.title}
                                            </h3>
                                            <span className="inline-flex items-center px-2 py-0.5 bg-white/5 text-slate-500 rounded text-[10px] font-medium border border-white/10 uppercase tracking-wider w-fit">
                                                {subStep.dayRange}
                                            </span>
                                        </div>

                                        <p className="text-slate-400 mb-5 leading-relaxed text-sm">{subStep.description}</p>

                                        {/* Micro Tasks */}
                                        {subStep.microTasks && subStep.microTasks.length > 0 && (
                                            <div className="mb-5">
                                                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Action Items</h4>
                                                <ul className="space-y-2">
                                                    {subStep.microTasks.map((task, taskIndex) => (
                                                        <li key={taskIndex} className="flex items-start gap-3 text-sm text-slate-300">
                                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500/50 flex-shrink-0"></div>
                                                            <span className="leading-relaxed">{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Expected Output */}
                                        {subStep.expectedOutput && (
                                            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex gap-3">
                                                <Lightbulb className="w-4 h-4 text-amber-500/70 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    <span className="font-medium text-slate-300">Output:</span> {subStep.expectedOutput}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-indigo-500" />
                            What You'll Learn
                        </h2>

                        <div className="bg-white/[0.02] rounded-lg p-5 border border-white/5 mb-6">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{step.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <h4 className="font-medium text-slate-200 text-sm">Suggested Pace</h4>
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed pl-6">
                                    ~{step.estimatedHours ? Math.round(step.estimatedHours / (step.timeframeWeeks || 1)) : '5-10'} hours/week over {step.suggested_timeframe || `${step.timeframeWeeks || 1} weeks`}
                                </p>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <h4 className="font-medium text-slate-200 text-sm">Focus Area</h4>
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed pl-6">
                                    {step.category || 'Learning'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Practice Exercises */}
                    {step.practiceExercises && step.practiceExercises.length > 0 && (
                        <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Practice
                            </h2>
                            <div className="space-y-3">
                                {step.practiceExercises.map((exercise, index) => (
                                    <div key={index} className="flex gap-3 text-sm">
                                        <div className="flex-shrink-0 w-5 h-5 bg-purple-500/10 rounded flex items-center justify-center text-purple-400 text-xs font-bold border border-purple-500/20">
                                            {index + 1}
                                        </div>
                                        <span className="text-slate-400 leading-relaxed">{exercise}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Common Mistakes */}
                    {step.commonMistakes && step.commonMistakes.length > 0 && (
                        <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                                Common Pitfalls
                            </h2>
                            <div className="space-y-3">
                                {step.commonMistakes.map((mistake, index) => (
                                    <div key={index} className="flex gap-3 text-sm">
                                        <AlertTriangle className="w-4 h-4 text-orange-500/50 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-400 leading-relaxed">{mistake}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Completion Criteria aka Acceptance Criteria */}
                {step.completionCriteria && step.completionCriteria.length > 0 && (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            Definition of Done
                        </h2>
                        <div className="grid gap-3">
                            {step.completionCriteria.map((criteria, index) => (
                                <div key={index} className="flex gap-3 p-3 bg-emerald-500/[0.02] rounded-lg border border-emerald-500/10">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500/70 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 text-sm leading-relaxed">{criteria}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Milestone */}
                {step.milestone && (
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-8 mb-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                </div>
                                {step.milestone.title}
                            </h2>
                            {step.milestone.checkpoints && step.milestone.checkpoints.length > 0 && (
                                <ul className="space-y-3">
                                    {step.milestone.checkpoints.map((checkpoint, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500/60 flex-shrink-0"></div>
                                            <span className="text-slate-300 leading-relaxed text-sm">{checkpoint}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Prerequisites */}
                {step.prerequisites && step.prerequisites.length > 0 && (
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-slate-400" />
                            Prerequisites
                        </h2>
                        <ul className="space-y-2">
                            {step.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5 text-sm">
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-400">{prereq}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StepDetail;
