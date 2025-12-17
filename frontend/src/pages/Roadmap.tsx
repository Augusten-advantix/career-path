import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Calendar, Clock, CheckCircle, ArrowRight, AlertTriangle, Sparkles, LayoutDashboard, Map, LogOut, User, Home, ChevronRight } from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 font-semibold">Loading your roadmap...</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">No Roadmap Found</h2>
                    <p className="text-slate-300 mb-8">
                        We couldn't find an existing roadmap for you. Let's create one!
                    </p>
                    <Link
                        to="/home"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
                    >
                        Start New Analysis
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 gap-3 sm:gap-0 py-4 sm:py-0">
                        <Link to="/" className="flex items-center gap-1">
                            <img src="/colorlogo.png" alt="CareerPath Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">CareerPath AI</span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-slate-700/50 px-3 sm:px-4 py-2 rounded-full border border-slate-600 truncate max-w-[150px] sm:max-w-none">
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
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">Your Career Roadmap</h1>
                        <p className="text-slate-600 mt-2 text-base sm:text-lg">
                            Target Role: <span className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                {typeof analysis.assessment?.targetRole === 'object'
                                    ? analysis.assessment.targetRole.title
                                    : (analysis.assessment?.targetRole || 'Software Engineer')}
                            </span>
                        </p>
                        {analysis.roadmap?.assumptions && (
                            <p className="text-sm text-slate-500 mt-1">
                                <strong>Assumptions:</strong> {typeof analysis.roadmap.assumptions === 'string' ? analysis.roadmap.assumptions : (analysis.roadmap.assumptions.availableHoursPerWeek ? `Assumes ${analysis.roadmap.assumptions.availableHoursPerWeek} hours/week` : JSON.stringify(analysis.roadmap.assumptions))}
                            </p>
                        )}
                    </div>
                    <Link
                        to="/home"
                        className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all w-full sm:w-auto justify-center"
                    >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        New Analysis
                    </Link>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
                    <div className="flex border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-4 sm:py-5 px-4 sm:px-6 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'overview'
                                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50/70'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Overview & Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('roadmap')}
                            className={`flex-1 py-5 px-6 text-center font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'roadmap'
                                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50/70'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <Map className="w-5 h-5" />
                            Roadmap
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 bg-slate-50">
                        {/* Roadmap Tab */}
                        {activeTab === 'roadmap' && (
                            <div className="space-y-8">
                                {/* Progress Card */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                                        <CheckCircle className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">Track Your Progress</p>
                                                <p className="text-blue-100 text-sm">
                                                    {completedSteps.length} of {visibleSteps.length} steps completed
                                                </p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block w-32 sm:w-40 h-3 bg-white/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white transition-all duration-500 shadow-lg"
                                                style={{ width: `${(completedSteps.length / (visibleSteps.length || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Roadmap list */}
                                    <div className="space-y-4">
                                        {roadmap.map((step: any, index: number) => {
                                            const isCompleted = completedSteps.includes(step.id || `step-${index}`);
                                            if (step.isGroup) {
                                                return (
                                                    <div key={`group-${index}`} className="px-4 py-4 border-l-4 border-slate-200 mb-2 bg-slate-50 rounded-md">
                                                        <h4 className="text-lg font-semibold text-slate-800">{step.title}</h4>
                                                        {step.description && <p className="text-sm text-slate-600 mt-1">{step.description}</p>}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div
                                                    key={index}
                                                    className={`group relative flex gap-4 p-6 rounded-2xl border-2 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${isCompleted
                                                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300'
                                                        : 'bg-gradient-to-r from-white to-slate-50 border-slate-200 hover:border-blue-400'
                                                        }`}
                                                    onClick={() => navigate(`/roadmap/step/${index}`, { state: { step } })}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStep(step.id || `step-${index}`);
                                                        }}
                                                        disabled={isUpdating}
                                                        className={`flex-shrink-0 mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all font-bold ${isCompleted
                                                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                                                            : 'border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-500'
                                                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                                                    >
                                                        {isCompleted ? '✓' : '○'}
                                                    </button>

                                                    <div className="flex-1">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                                                            <h3 className={`font-bold text-lg ${isCompleted ? 'text-emerald-800 line-through decoration-emerald-500/50' : 'text-slate-900'}`}>
                                                                {step.title}
                                                            </h3>
                                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full w-fit ${step.priority <= 2 ? 'bg-red-200 text-red-800' :
                                                                step.priority <= 4 ? 'bg-amber-200 text-amber-800' :
                                                                    'bg-emerald-200 text-emerald-800'
                                                                }`}>
                                                                ⚡ Priority {step.priority}
                                                            </span>
                                                        </div>

                                                        <p className={`text-sm font-medium mb-3 ${isCompleted ? 'text-emerald-700/90' : 'text-slate-700'}`}>
                                                            {step.description}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {/* category tag removed per UX request - only learning steps shown */}
                                                            <span className="inline-flex items-center text-slate-700 bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                                {typeof step.suggested_timeframe === 'string' ? step.suggested_timeframe : 'Flexible'}
                                                            </span>
                                                            {step.deadline_days && (
                                                                <span className="inline-flex items-center text-slate-700 bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                                    {step.deadline_days} days
                                                                </span>
                                                            )}
                                                            <span className="ml-auto inline-flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                                                View Details
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                        }
                                    </div>
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
                                    <div className="text-center py-12 text-gray-500">
                                        No detailed analysis data available.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Roadmap;
