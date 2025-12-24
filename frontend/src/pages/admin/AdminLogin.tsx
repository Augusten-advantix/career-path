import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { config } from '../../config';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, isAdmin } = useAuth();

    // If already logged in as admin, redirect to admin dashboard
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            navigate('/admin');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${config.apiUrl}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data;

            // Check if user is admin
            if (!user.isAdmin && user.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Login and redirect to admin dashboard
            login(token, user);
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 sm:p-6">
            <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 text-left bg-[#0A0A0A] border border-white/10 shadow-lg rounded-xl">
                <div className="mb-6 sm:mb-8">
                    <h3 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">Admin Panel</h3>
                    <p className="text-center text-slate-400 text-sm">Sign in to access the administration dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 sm:space-y-6">
                        {error && <p className="text-red-400 text-xs sm:text-sm font-medium bg-red-950/20 border border-red-500/20 p-2.5 sm:p-3 rounded-lg break-words">{error}</p>}

                        <div>
                            <label className="block font-medium text-slate-300 mb-2 text-sm sm:text-base" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@example.com"
                                autoComplete="email"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base text-slate-200 placeholder-slate-500"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-slate-300 mb-2 text-sm sm:text-base" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-200 placeholder-slate-500"
                            />
                        </div>

                        <div className="pt-2 sm:pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 mt-2 text-white font-medium bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all text-base sm:text-lg border border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>

                        <div className="text-center">
                            <a href="/" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors text-sm">← Back to main site</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
