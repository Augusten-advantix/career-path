import React from 'react';
import { User, Briefcase, GraduationCap, Award, Code } from 'lucide-react';

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
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-8 mb-6 border border-slate-200">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-slate-200">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 flex items-center">
                    <div className="p-2.5 bg-blue-600 rounded-lg mr-3">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    Profile Overview
                </h2>
                <p className="text-slate-600">Your professional profile snapshot</p>
            </div>

            {/* Current Role Info - Highlighted Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-md">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide mb-2">Current Role</p>
                <h3 className="text-3xl font-bold">{currentRole}</h3>
                {classification.personalInfo?.location && (
                    <p className="text-blue-100 mt-2">📍 {classification.personalInfo.location}</p>
                )}
            </div>

            {/* Experience & Primary Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Experience Badge */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-2">Experience</p>
                    <p className="text-3xl font-bold text-amber-600">{yearsOfExperience}</p>
                    <p className="text-sm text-amber-700">{yearsOfExperience === 1 ? 'year' : 'years'} in the field</p>
                </div>

                {/* Total Skills Count */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-900 uppercase tracking-wide mb-2">Skills</p>
                    <p className="text-3xl font-bold text-emerald-600">{totalSkills}</p>
                    <p className="text-sm text-emerald-700">professional competencies</p>
                </div>
            </div>

            {/* Primary Skills - Highlighted Section */}
            {primarySkills.length > 0 && (
                <div className="mb-8">
                    <h4 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-sm flex items-center">
                        <span className="w-1 h-6 bg-blue-600 mr-2 rounded"></span>
                        Top Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {primarySkills.map((skill: string, idx: number) => (
                            <span 
                                key={idx} 
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
                            >
                                ✨ {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                    <Code className="w-7 h-7 text-blue-600 mb-2" />
                    <div className="text-3xl font-bold text-blue-900">{totalSkills}</div>
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mt-1">Total Skills</div>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                    <Code className="w-7 h-7 text-green-600 mb-2" />
                    <div className="text-3xl font-bold text-green-900">{skills.technical?.length || 0}</div>
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mt-1">Technical</div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                    <Award className="w-7 h-7 text-purple-600 mb-2" />
                    <div className="text-3xl font-bold text-purple-900">{skills.soft?.length || 0}</div>
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mt-1">Soft Skills</div>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                    <Briefcase className="w-7 h-7 text-orange-600 mb-2" />
                    <div className="text-3xl font-bold text-orange-900">{skills.domain?.length || 0}</div>
                    <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide mt-1">Domain Areas</div>
                </div>
            </div>

            {/* Skills Breakdown - Styled Sections */}
            <div className="space-y-6">
                {(skills.technical?.length || 0) > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Technical Skills <span className="ml-2 text-sm font-semibold text-green-600">({skills.technical.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.technical.slice(0, 12).map((skill: any, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors">
                                    {skill.name}
                                </span>
                            ))}
                            {skills.technical.length > 12 && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                    +{skills.technical.length - 12} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {(skills.soft?.length || 0) > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            Soft Skills <span className="ml-2 text-sm font-semibold text-purple-600">({skills.soft.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.soft.slice(0, 10).map((skill: any, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors">
                                    {skill.name}
                                </span>
                            ))}
                            {skills.soft.length > 10 && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                    +{skills.soft.length - 10} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {(skills.domain?.length || 0) > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            Domain Expertise <span className="ml-2 text-sm font-semibold text-orange-600">({skills.domain.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.domain.slice(0, 10).map((skill: any, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-800 text-sm font-medium rounded-full hover:bg-orange-200 transition-colors">
                                    {skill.name}
                                </span>
                            ))}
                            {skills.domain.length > 10 && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                    +{skills.domain.length - 10} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSummary;
