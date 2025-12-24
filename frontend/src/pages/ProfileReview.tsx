import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import {
    FileText, ArrowRight, CheckCircle, User, Briefcase,
    GraduationCap, Code, Sparkles, Edit2
} from 'lucide-react';

interface ClassificationData {
    personalInfo: {
        name?: string;
        email?: string;
        location?: string;
    };
    skills: {
        technical: { name: string; category: string }[];
        soft: { name: string }[];
        domain: { name: string }[];
    };
    experience: {
        company: string;
        role: string;
        duration?: string;
    }[];
    education: {
        institution: string;
        degree: string;
    }[];
    experienceLevel: string;
    totalYearsExperience: number;
}

const ProfileReview: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useAuth();
    const hasAnalyzed = useRef(false); // Prevent double API calls from StrictMode

    const [text, setText] = useState('');
    const [filename, setFilename] = useState('');
    const [model, setModel] = useState<string>('');
    const [profileId, setProfileId] = useState<number | null>(null);
    const [classification, setClassification] = useState<ClassificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRawText, setShowRawText] = useState(false);

    useEffect(() => {
        // Check if restoring from session (already has classification)
        if (location.state?.fromSession && location.state?.classification) {
            hasAnalyzed.current = true;
            setText(location.state.text);
            setClassification(location.state.classification);
            setProfileId(location.state.profileId);
            setLoading(false);
            return;
        }

        if (location.state?.text && !hasAnalyzed.current) {
            hasAnalyzed.current = true; // Mark as analyzed to prevent re-run
            setText(location.state.text);
            setFilename(location.state.filename || 'Uploaded Resume');
            const selectedModel = location.state.model || localStorage.getItem('selectedModel') || 'gemini-1.5-flash';
            setModel(selectedModel);
            analyzeResume(location.state.text, selectedModel);
        } else if (!location.state?.text) {
            navigate('/roadmap');
        }
    }, [location.state, navigate]);

    const analyzeResume = async (resumeText: string, selectedModel: string) => {
        try {
            console.log('🤖 Analyzing resume with model:', selectedModel);
            const response = await axios.post(
                `${config.apiUrl}/analysis/classify`,
                { resumeText, model: selectedModel },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setClassification(response.data.classification);
            setProfileId(response.data.profileId); // Store the profileId
        } catch (err) {
            console.error('Error classifying resume:', err);
            // Fallback to raw text view if analysis fails
            setShowRawText(true);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        // Update session stage to 'conversation' before navigating
        try {
            await axios.post(
                `${config.apiUrl}/session/state`,
                { stage: 'conversation', profileId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Failed to update session state:', err);
        }

        navigate('/conversation', {
            state: {
                resumeText: text,
                resumePath: location.state?.filename,
                model: model,
                profileId: profileId // Pass profileId to Conversation
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
                        <div className="relative bg-indigo-500/10 border border-indigo-500/20 rounded-full p-4 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Analyzing Your Profile</h2>
                    <p className="text-slate-400 text-sm">
                        Our AI is extracting your skills, experience, and qualifications...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2 sm:gap-3 mb-2 tracking-tight">
                                <FileText className="text-indigo-400 w-7 h-7 sm:w-8 sm:h-8" />
                                Profile Analysis
                            </h1>
                            <p className="text-slate-400 mt-2 text-sm sm:text-base">
                                We've extracted the following from <strong className="text-indigo-400 break-all">{filename}</strong>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowRawText(!showRawText)}
                                className="px-4 sm:px-6 py-2 sm:py-3 text-slate-300 font-medium hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-sm sm:text-base"
                            >
                                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                {showRawText ? 'Hide Raw' : 'View Raw'}
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base border border-indigo-500/50"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {showRawText ? (
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8">
                        <h3 className="font-semibold text-white mb-4 text-base flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Raw Extracted Text
                        </h3>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-96 p-4 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 font-mono text-sm bg-white/5 text-slate-200 placeholder-slate-500"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Personal Info & Summary */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <User className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h3 className="text-base font-semibold text-white">Personal Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name</label>
                                        <p className="font-medium text-slate-200 text-base mt-1">{classification?.personalInfo.name || 'Not found'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Location</label>
                                        <p className="font-medium text-slate-200 text-base mt-1">{classification?.personalInfo.location || 'Not found'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Level</label>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                                                {classification?.experienceLevel || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Experience</label>
                                        <p className="font-medium text-slate-200 text-base mt-1">{classification?.totalYearsExperience} yrs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <Code className="w-4 h-4 text-purple-400" />
                                </div>
                                <h3 className="text-base font-semibold text-white">Top Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {classification?.skills.technical.slice(0, 8).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs font-medium border border-purple-500/20">
                                        {skill.name}
                                    </span>
                                ))}
                                {classification?.skills.soft.slice(0, 4).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5 md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-orange-400" />
                                </div>
                                <h3 className="text-base font-semibold text-white">Work Experience</h3>
                            </div>
                            <div className="space-y-4">
                                {classification?.experience.map((exp, idx) => (
                                    <div key={idx} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className="mt-0.5">
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-200 text-base">{exp.role}</h4>
                                            <p className="text-slate-400 text-sm">{exp.company}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{exp.duration}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!classification?.experience || classification.experience.length === 0) && (
                                    <p className="text-slate-500 italic text-sm">No experience found</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5 md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                                    <GraduationCap className="w-4 h-4 text-pink-400" />
                                </div>
                                <h3 className="text-base font-semibold text-white">Education</h3>
                            </div>
                            <div className="space-y-3">
                                {classification?.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <h4 className="font-semibold text-slate-200 text-base">{edu.institution}</h4>
                                        <p className="text-slate-400 text-sm">{edu.degree}</p>
                                    </div>
                                ))}
                                {(!classification?.education || classification.education.length === 0) && (
                                    <p className="text-slate-500 italic text-sm">No education found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileReview;
