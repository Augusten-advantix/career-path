import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Calendar, Clock, CheckCircle, ArrowRight, Sparkles, LayoutDashboard, Map, LogOut, User, Home, ChevronRight } from 'lucide-react';
import ProfileSummary from '../components/ProfileSummary';
import AssessmentDisplay from '../components/AssessmentDisplay';

const Roadmap: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user, token } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<'overview' | 'roadmap'>(location.state?.activeTab || 'overview');
    const [analysis, setAnalysis] = useState<any>(location.state?.analysis || null);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(!location.state?.analysis);

    // Fetch roadmap if not in state (e.g., on refresh)
    useEffect(() => {
        if (!analysis) {
            fetchRoadmap();
        }
    }, []);

    const fetchRoadmap = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/roadmap/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setAnalysis(response.data);
                // If backend returns progress, set it here
                if (response.data.progress) {
                    setCompletedSteps(response.data.progress.map((p: any) => p.stepId));
                }
            } else {
                // No roadmap found
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching roadmap:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleToggleStep = async (stepId: string) => {
        // Optimistic update
        const isCompleted = completedSteps.includes(stepId);
        const newCompletedSteps = isCompleted
            ? completedSteps.filter(id => id !== stepId)
            : [...completedSteps, stepId];

        setCompletedSteps(newCompletedSteps);
        setIsUpdating(true);

        try {
            // Call backend to update progress
            const roadmapId = analysis.id || analysis._id || 'current';

            const response = await axios.post(
                `${config.apiUrl}/roadmap/${roadmapId}/update-overview`,
                {
                    stepId,
                    completed: !isCompleted,
                    progress: newCompletedSteps
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update analysis with new classification/assessment if returned
            if (response.data && (response.data.classification || response.data.assessment)) {
                setAnalysis((prev: any) => ({
                    ...prev,
                    classification: response.data.classification || prev.classification,
                    assessment: response.data.assessment || prev.assessment
                }));
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            // Revert on error
            setCompletedSteps(completedSteps);
        } finally {
            setIsUpdating(false);
        }
    };

    // Compute roadmap & visible steps once for rendering
    const getRoadmapSteps = () => {
        if (!analysis) return [];
        let steps: any[] = [];
        if (Array.isArray(analysis.roadmap)) steps = analysis.roadmap;
        else if (analysis.roadmap?.steps && Array.isArray(analysis.roadmap.steps)) steps = analysis.roadmap.steps;
        else if (Array.isArray(analysis.analysis?.roadmap)) steps = analysis.analysis.roadmap;

        // Deduplicate steps based on title (keep first occurrence)
        const seen = new Set<string>();
        return steps.filter((step: any) => {
            const key = step.title?.toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const roadmap = getRoadmapSteps();
    const visibleSteps = roadmap.filter((r: any) => !r.isGroup);

    if (loading && !analysis) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">Initializing roadmap engine...</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen bg-[#050505] relative overflow-hidden">
                {/* Header */}
                <header className="border-b border-white/5 bg-[#050505] sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">CareerPath AI</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{user?.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Welcome Content */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-8 border border-white/10">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                            Welcome to <span className="text-indigo-400">CareerPath AI</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Your personalized AI-powered career roadmap is ready to be discovered. Let's analyze your potential.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: ArrowRight, color: 'text-blue-400', title: 'Upload Resume', desc: 'Securely analyze your profile' },
                            { icon: Sparkles, color: 'text-purple-400', title: 'AI Analysis', desc: 'Identify gaps & opportunities' },
                            { icon: Map, color: 'text-emerald-400', title: 'Get Roadmap', desc: 'Step-by-step career plan' }
                        ].map((item, idx) => (
                            <div key={idx} className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                        <Link
                            to="/home"
                            className="group inline-flex items-center justify-center px-8 py-4 bg-white text-black text-lg font-semibold rounded-xl hover:bg-slate-100 transition-all transform hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                        >
                            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                            Start New Analysis
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-slate-500 text-sm mt-6">Takes less than 5 minutes · 100% Free</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30">
            {/* Header */}
            <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                                <Sparkles className="h-5 w-5 text-indigo-400" />
                            </div>
                            <span className="text-lg font-semibold text-white tracking-tight">CareerPath AI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <User className="w-3.5 h-3.5" />
                                <span className="tracking-wide">{user?.email}</span>
                            </div>
                            <Link to="/" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                <Home className="w-5 h-5" />
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">Career Roadmap</h1>
                        <p className="text-slate-400">
                            Target: <span className="font-medium text-indigo-400/90 tracking-wide">
                                {typeof analysis.assessment?.targetRole === 'object'
                                    ? analysis.assessment.targetRole.title
                                    : (analysis.assessment?.targetRole || 'Software Engineer')}
                            </span>
                        </p>
                    </div>
                    <Link
                        to="/home"
                        className="group inline-flex items-center px-4 py-2 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all tracking-wide"
                    >
                        <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        New Analysis
                    </Link>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-white/[0.03]">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {[
                            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                            { id: 'roadmap', icon: Map, label: 'Roadmap' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all tracking-wide
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }
                                `}
                            >
                                <tab.icon className={`
                                    -ml-0.5 mr-2 h-5 w-5
                                    ${activeTab === tab.id ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}
                                `} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="animate-fade-in-up">
                    {/* Roadmap Tab */}
                    {activeTab === 'roadmap' && (
                        <div className="space-y-8">
                            {/* Progress Card */}
                            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white mb-0.5 tracking-tight">Your Journey Progress</h3>
                                            <p className="text-slate-400 text-sm">
                                                <span className="font-medium text-white">{completedSteps.length}</span> of {visibleSteps.length} steps completed
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block">
                                        <div className="text-right mb-1.5">
                                            <span className="text-2xl font-bold text-white">
                                                {Math.round((completedSteps.length / (visibleSteps.length || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(completedSteps.length / (visibleSteps.length || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {roadmap.map((step: any, index: number) => {
                                    const isCompleted = completedSteps.includes(step.id || `step-${index}`);

                                    if (step.isGroup) {
                                        return (
                                            <div key={`group-${index}`} className="pt-6 pb-2">
                                                <h4 className="text-lg font-semibold text-slate-200 border-l-2 border-indigo-500 pl-4">{step.title}</h4>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => navigate(`/roadmap/step/${index}`, { state: { step } })}
                                            className={`
                                                group relative rounded-lg border p-3.5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5
                                                ${isCompleted
                                                    ? 'bg-emerald-950/10 border-emerald-500/20 hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/5'
                                                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-lg hover:shadow-black/10'
                                                }
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleStep(step.id || `step-${index}`);
                                                    }}
                                                    disabled={isUpdating}
                                                    className={`
                                                        mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all
                                                        ${isCompleted
                                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'border-slate-700 bg-transparent text-transparent hover:border-indigo-400'
                                                        }
                                                        ${isUpdating ? 'opacity-50 cursor-wait' : ''}
                                                    `}
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                </button>

                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                                                        <h3 className={`text-base font-semibold transition-colors ${isCompleted ? 'text-emerald-400 line-through decoration-emerald-500/30' : 'text-white group-hover:text-indigo-400'}`}>
                                                            {step.title}
                                                        </h3>
                                                        <span className={`
                                                            inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border
                                                            ${step.priority <= 2
                                                                ? 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                                                                : step.priority <= 4
                                                                    ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                                                                    : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                                                            }
                                                        `}>
                                                            Priority {step.priority}
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="flex items-center text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                            <Clock className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                                                            {typeof step.suggested_timeframe === 'string' ? step.suggested_timeframe : 'Flexible'}
                                                        </div>

                                                        {step.deadline_days && (
                                                            <div className="flex items-center text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                                                                {step.deadline_days} days
                                                            </div>
                                                        )}

                                                        <div className="ml-auto flex items-center text-xs font-medium text-indigo-400 opacity-0 transform translate-x-[-10px] transition-all group-hover:opacity-100 group-hover:translate-x-0">
                                                            View Details
                                                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {analysis.classification && (
                                <ProfileSummary classification={analysis.classification} />
                            )}
                            {analysis.assessment && (
                                <AssessmentDisplay assessment={analysis.assessment} />
                            )}
                            {!analysis.classification && !analysis.assessment && (
                                <div className="text-center py-20 rounded-xl border border-white/5 bg-[#0A0A0A]">
                                    <p className="text-slate-500">No detailed analysis data available.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Roadmap;
