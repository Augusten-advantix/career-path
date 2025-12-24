import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, LogOut, User, Upload, MessageSquare, Map } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const Home: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200">
            {/* Header */}
            <header className="bg-[#050505] border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                                <Sparkles className="h-5 w-5 text-indigo-400" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">CareerPath AI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <User className="w-3.5 h-3.5" />
                                <span>{user?.email}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-8 border border-white/10">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                        Build Your Future <span className="text-indigo-400">Career Path</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Upload your resume to get started. Our AI will analyze your profile, identify gaps, and create a personalized roadmap to help you reach your goals.
                    </p>
                </div>

                {/* How it Works Section */}
                <div className="mb-12">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        How it works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6 hover:bg-white/[0.02] transition-all">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">1. Upload Resume</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Upload your current resume (PDF, DOCX, or TXT)
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6 hover:bg-white/[0.02] transition-all">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">2. Answer Questions</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Answer a few questions about your career goals
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6 hover:bg-white/[0.02] transition-all">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                <Map className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">3. Get Roadmap</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Receive a tailored roadmap with actionable steps
                            </p>
                        </div>
                    </div>
                </div>

                {/* File Upload Component */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                    <FileUpload />
                </div>
            </main>
        </div>
    );
};

export default Home;
