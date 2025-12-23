import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${config.apiUrl}/auth/login`, { email, password });
            const { token: authToken, user } = response.data;
            login(authToken, user);

            // Check user's session state for smart redirection
            try {
                const sessionRes = await axios.get(`${config.apiUrl}/session/state`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                const session = sessionRes.data;
                console.log('📍 Session state:', session);

                if (session.hasRoadmap) {
                    // User has completed roadmap
                    navigate('/roadmap');
                    return;
                }

                if (session.stage === 'review' && session.resumeText && session.classification) {
                    // User was in profile review - restore their session
                    navigate('/review', {
                        state: {
                            text: session.resumeText,
                            classification: session.classification,
                            profileId: session.profileId,
                            fromSession: true
                        }
                    });
                    return;
                }

                if (session.stage === 'conversation' && session.resumeText) {
                    // User was in conversation - restore their session
                    navigate('/conversation', {
                        state: {
                            resumeText: session.resumeText,
                            classification: session.classification,
                            profileId: session.profileId,
                            conversationHistory: session.conversationHistory || [],
                            fromSession: true
                        }
                    });
                    return;
                }

            } catch (sessionError) {
                console.log('No session state found');
            }

            // Default: go to roadmap (will show welcome page if no roadmap)
            navigate('/roadmap');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6">
            <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 text-left bg-gradient-to-br from-white to-slate-50 shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-slate-200">
                <h3 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6 sm:mb-8">Login</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block font-bold text-slate-700 mb-2 text-sm sm:text-base" htmlFor="email">📧 Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-slate-700 mb-2 text-sm sm:text-base">🔐 Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-600 text-xs sm:text-sm font-semibold bg-red-100 p-2.5 sm:p-3 rounded-lg break-words">❌ {error}</p>}
                        <div className="pt-2 sm:pt-4">
                            <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 mt-2 text-white font-bold bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all text-base sm:text-lg">
                                Sign In
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-600 text-sm sm:text-base">Don't have an account? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Create one</Link></p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
