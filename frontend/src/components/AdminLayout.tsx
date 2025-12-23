import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, FileText, Activity, BarChart3,
    LogOut, ChevronLeft, ChevronRight, Home, Menu, X
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/profiles', label: 'Profiles', icon: FileText },
        { path: '/admin/jobs', label: 'Jobs', icon: Activity },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen z-40
                ${collapsed ? 'w-16' : 'w-64'} 
                bg-gradient-to-b from-slate-900 to-slate-950 
                border-r border-slate-800/50
                flex flex-col
                transition-all duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className={`p-4 border-b border-slate-800/50 ${collapsed ? 'px-3' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-white font-bold text-lg whitespace-nowrap">CareerPath</h1>
                                <p className="text-slate-500 text-xs">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-indigo-400' : 'group-hover:text-white'}`} />
                                {!collapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-800/50 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Back to Site' : undefined}
                    >
                        <Home className="w-5 h-5" />
                        {!collapsed && <span className="text-sm">Back to Site</span>}
                    </Link>

                    {/* Collapse Toggle - Desktop Only */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        {!collapsed && <span className="text-sm">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                    <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-4">
                            <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
                            <h2 className="text-lg lg:text-xl font-semibold text-white">
                                {navItems.find(item => isActive(item.path))?.label || 'Admin'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-sm text-slate-300">{user?.email}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
