import React from 'react';
import { TrendingUp, TrendingDown, GaugeCircle, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    assessment: any;
}

const AssessmentDisplay: React.FC<Props> = ({ assessment }) => {
    if (!assessment) {
        return null;
    }

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBackground = (score: number): string => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const competitiveAnalysis = assessment.competitiveAnalysis || {
        overallScore: 0,
        comparedToPeers: 'unknown',
        marketReadiness: 0,
        estimatedTimeToTarget: 'N/A'
    };

    const strengths = assessment.strengths || [];
    const weaknesses = assessment.weaknesses || [];
    const gaps = assessment.gaps || [];
    const targetRole = assessment.targetRole || 'Target Role';
    const currentLevel = assessment.currentLevel || 'Unknown';

    return (
        <div className="space-y-6">
            {/* Target Role & Level - Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
                        <Target className="w-32 h-32" />
                    </div>
                    <p className="text-sm font-semibold opacity-90 uppercase tracking-widest mb-2">Target Role</p>
                    <h3 className="text-4xl font-bold">{targetRole}</h3>
                    <p className="text-purple-100 mt-3 text-sm">Your career destination</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
                        <CheckCircle className="w-32 h-32" />
                    </div>
                    <p className="text-sm font-semibold opacity-90 uppercase tracking-widest mb-2">Current Level</p>
                    <h3 className="text-4xl font-bold">{currentLevel}</h3>
                    <p className="text-blue-100 mt-3 text-sm">Your experience tier</p>
                </div>
            </div>

            {/* Competitive Analysis */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-8 border border-slate-200">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1 flex items-center">
                    <div className="p-2.5 bg-blue-600 rounded-lg mr-3">
                        <GaugeCircle className="w-6 h-6 text-white" />
                    </div>
                    Competitive Analysis
                </h2>
                <p className="text-slate-600 mb-6">Your market position and readiness</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Score */}
                    <div className={`p-8 rounded-xl ${getScoreBackground(competitiveAnalysis.overallScore)} border-2 ${competitiveAnalysis.overallScore >= 80 ? 'border-green-400' :
                            competitiveAnalysis.overallScore >= 60 ? 'border-yellow-400' :
                                'border-red-400'
                        }`}>
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-3">Overall Score</p>
                            <div className={`text-6xl font-bold ${getScoreColor(competitiveAnalysis.overallScore)} mb-3`}>
                                {competitiveAnalysis.overallScore}%
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                                {competitiveAnalysis.comparedToPeers}
                            </p>
                        </div>
                    </div>

                    {/* Market Readiness */}
                    <div className="p-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-400">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-wide text-blue-900 mb-3">Market Readiness</p>
                            <div className="text-6xl font-bold text-blue-600 mb-3">
                                {competitiveAnalysis.marketReadiness}%
                            </div>
                            <div className="flex items-center justify-center text-sm font-semibold text-blue-800 bg-white rounded-lg p-3">
                                ⏱️ {competitiveAnalysis.estimatedTimeToTarget}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strengths and Weaknesses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg p-8 border border-emerald-200">
                    <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center">
                        <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        Strengths ({strengths.length})
                    </h3>
                    <div className="space-y-3">
                        {strengths.length > 0 ? (
                            strengths.map((strength: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start">
                                        <span className="text-emerald-600 font-bold mr-3">✓</span>
                                        <p className="font-semibold text-slate-800">{strength}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 text-center py-4">No strengths listed</p>
                        )}
                    </div>
                </div>

                {/* Weaknesses */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl shadow-lg p-8 border border-rose-200">
                    <h3 className="text-2xl font-bold text-rose-900 mb-6 flex items-center">
                        <div className="p-2 bg-rose-500 rounded-lg mr-3">
                            <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        Areas for Improvement ({weaknesses.length})
                    </h3>
                    <div className="space-y-3">
                        {weaknesses.length > 0 ? (
                            weaknesses.map((weakness: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border-l-4 border-rose-500 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start">
                                        <span className="text-rose-600 font-bold mr-3">!</span>
                                        <p className="font-semibold text-slate-800">{weakness}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 text-center py-4">No weaknesses listed</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Skill Gaps */}
            {gaps.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-lg p-8 border border-amber-200">
                    <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
                        <div className="p-2 bg-amber-500 rounded-lg mr-3">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        Skill Gaps to Address ({gaps.length})
                    </h3>
                    <div className="space-y-3">
                        {gaps.map((gap: any, idx: number) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                    <span className="text-amber-600 font-bold mr-3">→</span>
                                    <p className="font-semibold text-slate-800">{gap}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentDisplay;
