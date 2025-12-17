import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const Dashboard: React.FC = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProfiles: 0,
        newProfiles: 0,
        analysisInProgress: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // Refresh every 10 seconds
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            // Fetch profiles if the endpoint exists
            try {
                const response = await axios.get(`${config.apiUrl}/recruiter/profiles`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStats({
                    totalProfiles: response.data.length || 0,
                    newProfiles: response.data.filter((p: any) => p.isNew).length || 0,
                    analysisInProgress: response.data.filter((p: any) => p.analyzing).length || 0
                });
            } catch (err) {
                // If endpoint doesn't exist yet, just show 0
                setStats({
                    totalProfiles: 0,
                    newProfiles: 0,
                    analysisInProgress: 0
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigateToJobQuestionnaire = () => {
        navigate('/job-questionnaire');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navbar */}
            <nav className="bg-slate-800 shadow-lg border-b border-blue-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 h-auto sm:h-16 py-4 sm:py-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <img src="/colorlogo.png" alt="CareerPath AI" className="w-7 h-7 sm:w-8 sm:h-8" />
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                Recruiter Dashboard
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                            <button
                                onClick={navigateToJobQuestionnaire}
                                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                                <span className="text-base sm:text-lg">+</span>
                                <span className="hidden xs:inline">New Job </span>Requirements
                            </button>
                            <span className="text-gray-300 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">👤 {user?.name || 'Recruiter'}</span>
                            <button
                                onClick={handleLogout}
                                className="text-red-400 hover:text-red-300 font-semibold transition text-sm sm:text-base"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-400 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-300 text-lg">Loading your dashboard...</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                            {/* Total Profiles Card */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-semibold">Total Profiles</p>
                                        <p className="text-4xl font-bold text-blue-400 mt-2">{stats.totalProfiles}</p>
                                    </div>
                                    <div className="text-6xl">📊</div>
                                </div>
                            </div>

                            {/* New Profiles Card */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-500 rounded-2xl p-8 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-semibold">New Profiles</p>
                                        <p className="text-4xl font-bold text-green-400 mt-2">{stats.newProfiles}</p>
                                    </div>
                                    <div className="text-6xl">✨</div>
                                </div>
                            </div>

                            {/* Analysis In Progress Card */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 rounded-2xl p-8 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-semibold">Analyzing</p>
                                        <p className="text-4xl font-bold text-yellow-400 mt-2">{stats.analysisInProgress}</p>
                                    </div>
                                    <div className="text-6xl">⚙️</div>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-purple-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">👋 Welcome, {user?.name || 'Recruiter'}!</h2>
                            <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6">
                                Ready to find perfect candidates? Start by creating new job requirements through our AI-powered questionnaire.
                            </p>
                            <button
                                onClick={navigateToJobQuestionnaire}
                                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold text-base sm:text-lg inline-block"
                            >
                                🎯 Get Started →
                            </button>
                        </div>

                        {/* Coming Soon Section */}
                        <div className="mt-12 bg-slate-800 border-2 border-slate-700 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-gray-300 mb-4">📈 Coming Soon</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-xl">✓</span> View all candidate profiles
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-xl">✓</span> Advanced filtering and search
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-xl">✓</span> Real-time profile analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-xl">✓</span> Candidate matching recommendations
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
