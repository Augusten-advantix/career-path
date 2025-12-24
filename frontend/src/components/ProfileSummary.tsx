import React from 'react';
import { User, Briefcase, Code, Zap, Brain, Sparkles } from 'lucide-react';

interface Props {
    classification: any;
}

const ProfileSummary: React.FC<Props> = ({ classification }) => {
    if (!classification) {
        return null;
    }

    const skills = classification.skills || { technical: [], soft: [], domain: [] };
    const totalSkills =
        (skills.technical?.length || 0) +
        (skills.soft?.length || 0) +
        (skills.domain?.length || 0);

    const currentRole = classification.currentRole || 'N/A';
    const yearsOfExperience = classification.yearsOfExperience || 0;
    const primarySkills = classification.primarySkills || [];

    return (
        <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="mb-1 flex items-center gap-2.5 text-base font-semibold text-white">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                            <User className="h-4 w-4 text-slate-300" />
                        </div>
                        Profile Overview
                    </h2>
                    <p className="text-xs text-slate-500 pl-9.5">Professional snapshot & analysis</p>
                </div>
                <div className="hidden sm:block">
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
                        AI Analysis
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="mb-5 grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Current Role Card */}
                <div className="group overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                    <div className="mb-2.5 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Current Role</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">{currentRole}</h3>
                    {classification.personalInfo?.location && (
                        <p className="text-sm text-slate-500">{classification.personalInfo.location}</p>
                    )}
                </div>

                {/* Experience & Skills Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Experience</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-white">{yearsOfExperience}</span>
                            <span className="text-sm text-slate-500">years</span>
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Skills</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-white">{totalSkills}</span>
                            <span className="text-sm text-slate-500">total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Competencies */}
            {primarySkills.length > 0 && (
                <div className="mb-8">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                        <Sparkles className="h-3.5 w-3.5" />
                        Key Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {primarySkills.map((skill: string, idx: number) => (
                            <span
                                key={idx}
                                className="rounded px-2.5 py-1 text-xs font-medium text-indigo-200 bg-indigo-500/10 border border-indigo-500/20"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Skills Breakdown */}
            <div className="grid gap-6 md:grid-cols-3 border-t border-white/5 pt-6">
                {/* Technical Skills */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Code className="h-3.5 w-3.5 text-slate-500" />
                            Technical
                        </h4>
                        <span className="text-xs text-slate-600 font-mono">{skills.technical?.length || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.technical?.slice(0, 8).map((skill: any, idx: number) => (
                            <span key={idx} className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400 border border-white/5">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Soft Skills */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Brain className="h-3.5 w-3.5 text-slate-500" />
                            Soft Skills
                        </h4>
                        <span className="text-xs text-slate-600 font-mono">{skills.soft?.length || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.soft?.slice(0, 8).map((skill: any, idx: number) => (
                            <span key={idx} className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400 border border-white/5">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Domain Skills */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Zap className="h-3.5 w-3.5 text-slate-500" />
                            Domain
                        </h4>
                        <span className="text-xs text-slate-600 font-mono">{skills.domain?.length || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.domain?.slice(0, 8).map((skill: any, idx: number) => (
                            <span key={idx} className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400 border border-white/5">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSummary;
