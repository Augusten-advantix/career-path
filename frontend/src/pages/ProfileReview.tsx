import React, { useState, useEffect } from 'react';
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

    const [text, setText] = useState('');
    const [filename, setFilename] = useState('');
    const [model, setModel] = useState<string>('');
    const [classification, setClassification] = useState<ClassificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRawText, setShowRawText] = useState(false);

    useEffect(() => {
        if (location.state?.text) {
            setText(location.state.text);
            setFilename(location.state.filename || 'Uploaded Resume');
            const selectedModel = location.state.model || localStorage.getItem('selectedModel') || 'gemini-1.5-flash';
            setModel(selectedModel);
            analyzeResume(location.state.text, selectedModel);
        } else {
            navigate('/');
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
        } catch (err) {
            console.error('Error classifying resume:', err);
            // Fallback to raw text view if analysis fails
            setShowRawText(true);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate('/conversation', {
            state: {
                resumeText: text,
                resumePath: location.state?.filename,
                model: model
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-200">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-full p-5 text-white">
                            <Sparkles className="w-10 h-10 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">Analyzing Your Profile</h2>
                    <p className="text-slate-700 font-semibold">
                        Our AI is extracting your skills, experience, and qualifications...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 mb-2">
                                <FileText className="text-blue-600 w-8 h-8 sm:w-10 sm:h-10" />
                                Profile Analysis
                            </h1>
                            <p className="text-slate-700 mt-2 font-semibold text-sm sm:text-base">
                                We've extracted the following from <strong className="text-blue-600 break-all">{filename}</strong>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setShowRawText(!showRawText)}
                                className="px-4 sm:px-6 py-2 sm:py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-sm sm:text-base"
                            >
                                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                {showRawText ? 'Hide Raw' : 'View Raw'}
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 font-bold text-sm sm:text-base"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {showRawText ? (
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 mb-6 sm:mb-8 animate-fade-in">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg sm:text-xl">📝 Raw Extracted Text</h3>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-96 p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-slate-50 text-slate-900"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Personal Info & Summary */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl text-blue-600">
                                    <User className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">👤 Personal Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase">Name</label>
                                        <p className="font-bold text-slate-900 text-lg">{classification?.personalInfo.name || 'Not found'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase">Location</label>
                                        <p className="font-bold text-slate-900 text-lg">{classification?.personalInfo.location || 'Not found'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase">Level</label>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 capitalize">
                                            {classification?.experienceLevel || 'Unknown'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase">Experience</label>
                                        <p className="font-bold text-slate-900 text-lg">{classification?.totalYearsExperience} yrs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl text-purple-600">
                                    <Code className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">💻 Top Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {classification?.skills.technical.slice(0, 8).map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-bold border border-purple-300">
                                        {skill.name}
                                    </span>
                                ))}
                                {classification?.skills.soft.slice(0, 4).map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-bold border border-blue-300">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg border border-slate-200 p-6 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl text-orange-600">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">💼 Work Experience</h3>
                            </div>
                            <div className="space-y-6">
                                {classification?.experience.map((exp, idx) => (
                                    <div key={idx} className="flex gap-4 pb-6 border-b border-slate-200 last:border-0 last:pb-0">
                                        <div className="mt-1">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{exp.role}</h4>
                                            <p className="text-slate-700 font-semibold">{exp.company}</p>
                                            <p className="text-sm text-slate-600 mt-1">{exp.duration}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!classification?.experience || classification.experience.length === 0) && (
                                    <p className="text-slate-600 italic">No experience found</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl text-pink-600">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">🎓 Education</h3>
                            </div>
                            <div className="space-y-4">
                                {classification?.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <h4 className="font-bold text-slate-900 text-lg">{edu.institution}</h4>
                                        <p className="text-slate-700 font-semibold">{edu.degree}</p>
                                    </div>
                                ))}
                                {(!classification?.education || classification.education.length === 0) && (
                                    <p className="text-slate-600 italic">No education found</p>
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
