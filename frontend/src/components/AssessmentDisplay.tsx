import React from 'react';
import { TrendingUp, TrendingDown, GaugeCircle, Target, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Props {
    assessment: any;
}

const AssessmentDisplay: React.FC<Props> = ({ assessment }) => {
    if (!assessment) {
        return null;
    }

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-rose-400';
    };

    const getScoreBorder = (score: number): string => {
        if (score >= 80) return 'border-emerald-500/20';
        if (score >= 60) return 'border-yellow-500/20';
        return 'border-rose-500/20';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group rounded-xl border border-white/10 bg-[#0A0A0A] p-5 transition-all hover:bg-white/[0.02]">
                    <div className="mb-2.5 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">Target Role</p>
                        <Target className="h-4 w-4 text-indigo-400/70" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{targetRole}</h3>
                    <p className="text-sm text-slate-500">Your calculated career destination</p>
                </div>

                <div className="group rounded-xl border border-white/10 bg-[#0A0A0A] p-5 transition-all hover:bg-white/[0.02]">
                    <div className="mb-2.5 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Current Level</p>
                        <CheckCircle className="h-4 w-4 text-emerald-400/70" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{currentLevel}</h3>
                    <p className="text-sm text-slate-500">Your assessed experience tier</p>
                </div>
            </div>

            {/* Competitive Analysis */}
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5">
                <div className="mb-5 flex items-center gap-2.5 border-b border-white/5 pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                        <GaugeCircle className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-white">Competitive Analysis</h2>
                        <p className="text-xs text-slate-500">Market position & readiness assessment</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overall Score */}
                    <div className={`rounded-lg border bg-white/[0.02] p-5 ${getScoreBorder(competitiveAnalysis.overallScore)}`}>
                        <div className="text-center">
                            <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">Overall Score</p>
                            <div className={`mb-1 text-4xl font-bold tracking-tight ${getScoreColor(competitiveAnalysis.overallScore)}`}>
                                {competitiveAnalysis.overallScore}%
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                {competitiveAnalysis.comparedToPeers}
                            </p>
                        </div>
                    </div>

                    {/* Market Readiness */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.02] p-5">
                        <div className="text-center">
                            <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-blue-400/80">Market Readiness</p>
                            <div className="mb-2.5 text-4xl font-bold tracking-tight text-blue-400">
                                {competitiveAnalysis.marketReadiness}%
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                                <Clock className="h-3 w-3" />
                                {competitiveAnalysis.estimatedTimeToTarget} to target
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strengths and Weaknesses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="rounded-xl border border-emerald-500/20 bg-[#0A0A0A] p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-500/90">
                        <TrendingUp className="h-4 w-4" />
                        Strengths ({strengths.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {strengths.length > 0 ? (
                            strengths.map((strength: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-500/70 flex-shrink-0" />
                                    <p className="text-sm text-slate-300 leading-snug">{strength}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-sm text-slate-500">No strengths listed</p>
                        )}
                    </div>
                </div>

                {/* Weaknesses */}
                <div className="rounded-xl border border-rose-500/20 bg-[#0A0A0A] p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-rose-500/90">
                        <TrendingDown className="h-4 w-4" />
                        Areas for Improvement ({weaknesses.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {weaknesses.length > 0 ? (
                            weaknesses.map((weakness: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 rounded-lg border border-rose-500/10 bg-rose-500/[0.03] p-3">
                                    <div className="mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-500 flex-shrink-0">!</div>
                                    <p className="text-sm text-slate-300 leading-snug">{weakness}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-sm text-slate-500">No weaknesses listed</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Skill Gaps */}
            {gaps.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-[#0A0A0A] p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-500/90">
                        <AlertCircle className="h-4 w-4" />
                        Skill Gaps ({gaps.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {gaps.map((gap: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/70 flex-shrink-0"></div>
                                <p className="text-sm text-slate-300 leading-snug">{gap}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentDisplay;
