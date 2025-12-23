import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, TrendingUp, Users, PieChart as PieIcon, RefreshCw } from 'lucide-react';

interface AnalyticsData {
    signups: { date: string; signups: number }[];
    analyses: { date: string; total: number; success: number; failed: number }[];
    successRateTrend: { date: string; successRate: number }[];
    topSkills: { name: string; count: number }[];
    domainDistribution: { name: string; count: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#3b82f6', '#f59e0b'];

const AdminAnalytics: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.apiUrl}/admin/analytics?days=${days}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-7 h-7 text-indigo-400" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">Insights on user activity and platform performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={60}>Last 60 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <button
                            onClick={fetchAnalytics}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Time Series Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Signups Chart */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            User Signups
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={data?.signups}>
                                <defs>
                                    <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="signups" stroke="#3b82f6" fill="url(#signupGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Analyses Over Time */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Career Analyses
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data?.analyses}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="success" name="Success" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Success Rate Trend */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Success Rate Trend
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data?.successRateTrend}>
                            <defs>
                                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Success Rate']}
                            />
                            <Area type="monotone" dataKey="successRate" stroke="#10b981" fill="url(#successGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Skills and Domain Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Skills */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            🎯 Top Skills
                        </h2>
                        {data?.topSkills && data.topSkills.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.topSkills} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#9ca3af"
                                        tick={{ fontSize: 11 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                                        {data.topSkills.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-500">
                                No skills data available
                            </div>
                        )}
                    </div>

                    {/* Domain Distribution */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-pink-400" />
                            Domain Distribution
                        </h2>
                        {data?.domainDistribution && data.domainDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.domainDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        {data.domainDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-500">
                                No domain data available
                            </div>
                        )}

                        {/* Legend */}
                        {data?.domainDistribution && data.domainDistribution.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                {data.domainDistribution.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-1 text-xs text-slate-300">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        {item.name} ({item.count})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
