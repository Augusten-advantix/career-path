import React from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';

const Home: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Career Roadmap AI</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <span className="text-blue-100 font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">👋 Welcome, {user?.name || user?.email?.split('@')[0]}</span>
                        <button onClick={logout} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all text-xs sm:text-sm font-bold w-full sm:w-auto">
                            Logout
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8 md:p-12">
                    <div className="text-center mb-8 sm:mb-10 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">Build Your Future Career Path</h2>
                        <p className="text-slate-700 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4">
                            Upload your resume to get started. Our AI will analyze your profile, identify gaps, and create a personalized roadmap to help you reach your goals.
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto px-2 sm:px-0">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 md:mb-10 shadow-md">
                            <h3 className="font-bold text-blue-900 mb-3 text-lg">⚡ How it works:</h3>
                            <ol className="space-y-3 text-blue-900">
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-blue-600 text-lg">1</span>
                                    <span className="font-semibold">Upload your current resume (PDF, DOCX, or TXT)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-blue-600 text-lg">2</span>
                                    <span className="font-semibold">Answer a few questions about your career goals</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-blue-600 text-lg">3</span>
                                    <span className="font-semibold">Receive a tailored roadmap with actionable steps</span>
                                </li>
                            </ol>
                        </div>

                        <FileUpload />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
