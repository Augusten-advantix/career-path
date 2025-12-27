import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Users, Target, MessageSquare, TrendingUp, Activity } from 'lucide-react';

interface EngagementStats {
    activeUsers: {
        dau: number;
        wau: number;
        mau: number;
        stickiness: string;
    };
    roadmapEngagement: {
        totalRoadmaps: number;
        activeRoadmaps: number;
        highEngagement: number;
        avgCompletionRate: number;
    };
    conversations: {
        avgQuestions: number;
        completionRate: number;
        totalCompleted: number;
    };
    activityTrend: Array<{
        date: string;
        activeUsers: number;
    }>;
}

const AdminDashboard: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<EngagementStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchStats();
    }, [isAdmin, navigate, token]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard/engagement`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch engagement statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </AdminLayout>
        );
    }

    if (!stats) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">User Engagement Dashboard</h1>
                        <p className="text-slate-400 text-sm mt-1">Monitor platform adoption and user success metrics</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-all flex items-center gap-2 text-sm"
                    >
                        <Activity className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Active Users - Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Daily</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.activeUsers.dau}</div>
                        <p className="text-sm text-slate-400">Active Users (24h)</p>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Weekly</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.activeUsers.wau}</div>
                        <p className="text-sm text-slate-400">Active Users (7d)</p>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Monthly</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.activeUsers.mau}</div>
                        <p className="text-sm text-slate-400">Active Users (30d)</p>
                        <div className="mt-2 pt-2 border-t border-white/5">
                            <p className="text-xs text-slate-500">
                                Stickiness: <span className="text-indigo-400 font-medium">{stats.activeUsers.stickiness}%</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Roadmap Engagement Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            <Target className="w-5 h-5 text-orange-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Roadmap Engagement</h2>
                    </div>

                    {/* Average Completion Rate */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Average Completion Rate</span>
                            <span className="text-2xl font-bold text-white">{stats.roadmapEngagement.avgCompletionRate}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${stats.roadmapEngagement.avgCompletionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="text-2xl font-bold text-white mb-1">
                                {stats.roadmapEngagement.totalRoadmaps}
                            </div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Roadmaps</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <div className="text-2xl font-bold text-emerald-400 mb-1">
                                {stats.roadmapEngagement.activeRoadmaps}
                            </div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Active (7d)</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <div className="text-2xl font-bold text-indigo-400 mb-1">
                                {stats.roadmapEngagement.highEngagement}
                            </div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">High Engagement (&gt;50%)</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Conversations & Activity Trend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Conversation Analytics */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Conversation Analytics</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400">Avg Questions</span>
                                <span className="text-xl font-bold text-white">{stats.conversations.avgQuestions}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400">Completion Rate</span>
                                <span className="text-xl font-bold text-emerald-400">{stats.conversations.completionRate}%</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400">Total Completed</span>
                                <span className="text-xl font-bold text-white">{stats.conversations.totalCompleted}</span>
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Activity Trend */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-pink-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">7-Day Activity Trend</h2>
                        </div>

                        <div className="space-y-2">
                            {stats.activityTrend.map((day, idx) => {
                                const maxUsers = Math.max(...stats.activityTrend.map(d => d.activeUsers));
                                const widthPercent = maxUsers > 0 ? (day.activeUsers / maxUsers) * 100 : 0;

                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 w-16">
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex-1 bg-white/5 rounded-full h-6 relative">
                                            <div
                                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                                style={{ width: `${widthPercent}%` }}
                                            >
                                                {day.activeUsers > 0 && (
                                                    <span className="text-xs font-medium text-white">{day.activeUsers}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
