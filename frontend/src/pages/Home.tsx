import React from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';

const Home: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Career Roadmap Generator</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-blue-100">Welcome, {user?.name || user?.email}</span>
                        <button onClick={logout} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors text-sm font-medium">
                            Logout
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Build Your Future Career Path</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Upload your resume to get started. Our AI will analyze your profile, identify gaps, and create a personalized roadmap to help you reach your goals.
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                            <ol className="list-decimal list-inside text-blue-700 space-y-2">
                                <li>Upload your current resume (PDF, DOCX, or TXT)</li>
                                <li>Answer a few questions about your career goals</li>
                                <li>Receive a tailored roadmap with actionable steps</li>
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
