import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Users, FileText, Activity, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';

interface DashboardStats {
    users: {
        total: number;
        admin: number;
        regular: number;
        recentlyAdded: number;
    };
    profiles: {
        total: number;
        recentlyAdded: number;
    };
    jobs: {
        total: number;
        queued: number;
        running: number;
        success: number;
        failed: number;
        successRate: string;
    };
    recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchStats();
    }, [isAdmin, navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch statistics');
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

    const statCards = [
        {
            title: 'Total Users',
            value: stats.users.total,
            subtitle: `${stats.users.admin} admin · ${stats.users.regular} regular`,
            badge: `+${stats.users.recentlyAdded} this week`,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
            link: '/admin/users'
        },
        {
            title: 'Profiles',
            value: stats.profiles.total,
            subtitle: 'Resume profiles uploaded',
            badge: `+${stats.profiles.recentlyAdded} this week`,
            icon: FileText,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
            link: '/admin/profiles'
        },
        {
            title: 'Analysis Jobs',
            value: stats.jobs.total,
            subtitle: `${stats.jobs.successRate}% success rate`,
            badge: `${stats.jobs.running} running`,
            icon: Activity,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-500/10',
            link: '/admin/jobs'
        },
        {
            title: 'Performance',
            value: `${stats.jobs.successRate}%`,
            subtitle: 'Overall success rate',
            badge: `${stats.jobs.success} completed`,
            icon: TrendingUp,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            link: '/admin/analytics'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
                        <p className="text-slate-400 mt-1 text-sm">Here's what's happening with your platform today</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-all text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={idx}
                                to={card.link}
                                className="group bg-[#0A0A0A] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                                        <Icon className={`w-5 h-5 text-white`} />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        {card.badge}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                                    <p className="text-sm font-medium text-slate-300">{card.title}</p>
                                    <p className="text-xs text-slate-500">{card.subtitle}</p>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View details <ArrowRight className="w-3 h-3 ml-1" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Job Status + Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Job Status Breakdown */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4 shadow-lg shadow-black/20">
                        <h2 className="text-lg font-semibold text-white mb-4">Job Status</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                    <span className="text-slate-300">Queued</span>
                                </div>
                                <span className="text-white font-semibold">{stats.jobs.queued}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                    <span className="text-slate-300">Running</span>
                                </div>
                                <span className="text-white font-semibold">{stats.jobs.running}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-slate-300">Success</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">{stats.jobs.success}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-slate-300">Failed</span>
                                </div>
                                <span className="text-red-400 font-semibold">{stats.jobs.failed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-lg p-4 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            <Link to="/admin/jobs" className="text-xs text-indigo-400 hover:text-indigo-300">
                                View all →
                            </Link>
                        </div>
                        {stats.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Clock className="w-10 h-10 mb-3 opacity-50" />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentActivity.slice(0, 5).map((activity: any) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${activity.status === 'success' ? 'bg-emerald-500/20' :
                                            activity.status === 'failed' ? 'bg-red-500/20' :
                                                activity.status === 'running' ? 'bg-blue-500/20' : 'bg-slate-500/20'
                                            }`}>
                                            {activity.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                                                activity.status === 'failed' ? <XCircle className="w-4 h-4 text-red-400" /> :
                                                    <Clock className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">
                                                Analysis for <span className="font-medium">{activity.Profile?.name || 'Unknown'}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {activity.Profile?.title || 'No title'} · {new Date(activity.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            activity.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/analytics" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                            View Analytics →
                        </Link>
                        <Link to="/admin/users" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                            Manage Users
                        </Link>
                        <Link to="/admin/profiles" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                            View Profiles
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
