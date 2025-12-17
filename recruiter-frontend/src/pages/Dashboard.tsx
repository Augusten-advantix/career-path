import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Home, Sparkles, Loader, ExternalLink, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/ToastContext';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [jobRequirements, setJobRequirements] = useState<any[]>([]);
    const [selectedJobRequirementId, setSelectedJobRequirementId] = useState<number | null>(null);
    const [showDeleteReq, setShowDeleteReq] = useState(false);
    const [isDeletingReq, setIsDeletingReq] = useState(false);
    const { showToast } = useToast();


    const fetchProfiles = async (jobReqId?: number | null) => {
        try {
            setLoading(true);
            const params: any = {};
            if (jobReqId) params.jobRequirementId = jobReqId;
            const response = await axios.get('/api/recruiter/profiles', { params });
            // We'll not store profiles in dashboard; this is only used for counts or debug (if needed).
            return response.data;
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch profiles on mount and poll for updates (mainly used for pendingCount or future enhancements)
    useEffect(() => {
        fetchProfiles(selectedJobRequirementId);
        // Poll for updates every 5 seconds
        const interval = setInterval(() => fetchProfiles(selectedJobRequirementId), 5000);
        return () => clearInterval(interval);
    }, [selectedJobRequirementId]);

    useEffect(() => {
        fetchJobRequirements();
    }, []);

    useEffect(() => {
        const selectedFromNav = (location.state as any)?.selectedJobRequirementId;
        if (selectedFromNav) {
            handleSelectRequirement(selectedFromNav as number);
        }
    }, [location.state]);
    const fetchJobRequirements = async () => {
        try {
            const res = await axios.get('/api/recruiter/job-requirements');
            setJobRequirements(res.data);
        } catch (err) {
            console.error('Failed to fetch job reqs', err);
        }
    };

    const handleSelectRequirement = (id: number | null) => {
        setSelectedJobRequirementId(id);
        setLoading(true);
        fetchProfiles(id);
    };

    const handleDeleteRequirement = async () => {
        if (!selectedJobRequirementId) return;
        setIsDeletingReq(true);
        try {
            await axios.delete(`/api/recruiter/job-requirements/${selectedJobRequirementId}`);
            showToast('success', 'Position deleted');
            setSelectedJobRequirementId(null);
            await fetchJobRequirements();
            await fetchProfiles(null);
        } catch (err) {
            console.error('Failed to delete requirement', err);
            showToast('error', 'Failed to delete position');
        } finally {
            setIsDeletingReq(false);
            setShowDeleteReq(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Poll small API to compute pending count across all profiles
        const computePendingCount = async () => {
            try {
                const allProfiles = await fetchProfiles(null);
                const pCount = (allProfiles || []).filter((p: any) => p.analysisJob && (p.analysisJob.status === 'queued' || p.analysisJob.status === 'running')).length;
                setPendingCount(pCount);
            } catch (err) {
                console.error('Failed to compute pending count', err);
            }
        };
        computePendingCount();
        const interval = setInterval(computePendingCount, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-xl">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Recruiter Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/job-questionnaire')}
                                className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <span>+</span>
                                New Requirements
                            </button>
                            <div className="flex items-center gap-4 text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-xl">
                                <span>Welcome, {user?.name}</span>
                            </div>
                            <Link
                                to="/"
                                className="p-2 text-gray-600 hover:text-purple-600 transition-all hover:bg-gray-100 rounded-lg"
                                title="Go to Home"
                            >
                                <Home className="w-6 h-6" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <ConfirmDialog
                        open={showDeleteReq}
                        title={`Delete Position`}
                        message={`Are you sure you want to delete this position? uploads assigned to it will not be deleted.`}
                        confirmText={isDeletingReq ? 'Deleting...' : 'Delete'}
                        confirmDisabled={isDeletingReq}
                        cancelText="Cancel"
                        onConfirm={handleDeleteRequirement}
                        onCancel={() => setShowDeleteReq(false)}
                    />

                    {/* Stats / Pending Analysis Banner */}
                    {pendingCount > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="bg-amber-100 p-2 rounded-full animate-pulse">
                                <Loader className="h-5 w-5 text-amber-600 animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-amber-900 font-bold">Analysis in Progress</h3>
                                <p className="text-amber-700 text-sm">{pendingCount} resume{pendingCount > 1 ? 's' : ''} currently being analyzed</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Positions List */}
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                                    Active Positions
                                </h2>
                                <span className="text-gray-600 font-medium bg-white px-3 py-1 rounded-lg border border-gray-200">
                                    {jobRequirements.length} Total
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {jobRequirements.map((req: any) => (
                                    <div
                                        key={req.id}
                                        className={`group bg-white rounded-2xl p-5 shadow-md border-l-8 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden
                                            ${selectedJobRequirementId === req.id ? 'border-purple-600 ring-2 ring-purple-300' : 'border-gray-200 hover:border-purple-400'}`}
                                        onClick={() => handleSelectRequirement(req.id)}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-5 h-5 text-slate-400" />
                                        </div>

                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">
                                                    {req.structuredRequirements?.jobTitle || 'Untitled Position'}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/position/${req.id}`}
                                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Open Dashboard
                                                </Link>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedJobRequirementId(req.id); setShowDeleteReq(true); }}
                                                    title="Delete Position"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {jobRequirements.length === 0 && (
                                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center shadow-sm">
                                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Positions Yet</h3>
                                        <p className="text-gray-600 mb-6">Create your first job requirement to start analyzing resumes.</p>
                                        <button
                                            onClick={() => navigate('/job-questionnaire')}
                                            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition font-bold shadow-md inline-flex items-center gap-2"
                                        >
                                            <span>+</span> Create Position
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar / Overview */}
                        <div className="col-span-1 space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    Quick Tips
                                </h3>
                                <ul className="space-y-4 text-gray-700 text-sm font-medium">
                                    <li className="flex gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-lg h-fit text-purple-700 font-bold">1</div>
                                        <p>Create a new requirement to define what you're looking for.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-lg h-fit text-purple-700 font-bold">2</div>
                                        <p>Open the position dashboard to upload resumes (PDF/DOCX).</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-lg h-fit text-purple-700 font-bold">3</div>
                                        <p>Our AI analyzes candidates against your specific criteria.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
