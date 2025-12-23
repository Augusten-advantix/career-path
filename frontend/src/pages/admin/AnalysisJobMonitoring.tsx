import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface AnalysisJob {
    id: number;
    status: 'queued' | 'running' | 'success' | 'failed';
    error: string | null;
    createdAt: string;
    Profile?: {
        name: string;
        title: string;
        company: string;
    };
}

const AnalysisJobMonitoring: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<AnalysisJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchJobs();

        // Auto-refresh every 5 seconds if enabled
        if (autoRefresh) {
            const interval = setInterval(fetchJobs, 5000);
            return () => clearInterval(interval);
        }
    }, [isAdmin, navigate, page, statusFilter, autoRefresh]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: 20 };
            if (statusFilter) params.status = statusFilter;

            const response = await axios.get(`${API_BASE_URL}/admin/jobs`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setJobs(response.data.jobs);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (jobId: number) => {
        try {
            await axios.post(
                `${API_BASE_URL}/admin/jobs/${jobId}/retry`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchJobs();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to retry job');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'status-success';
            case 'failed':
                return 'status-failed';
            case 'running':
                return 'status-running';
            case 'queued':
                return 'status-queued';
            default:
                return '';
        }
    };

    if (loading && !autoRefresh) {
        return (
            <AdminLayout>
                <div className="loading-spinner">Loading jobs...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <h2>Analysis Job Monitoring</h2>
                    <div className="header-actions">
                        <label className="auto-refresh-toggle">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                            <span>Auto-refresh (5s)</span>
                        </label>
                        <button onClick={fetchJobs} className="refresh-btn">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="filter-tabs">
                    {['', 'queued', 'running', 'success', 'failed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                        >
                            {status || 'All'}
                        </button>
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Jobs Table */}
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Profile</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Error</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id}>
                                    <td>{job.id}</td>
                                    <td>{job.Profile?.name || '--'}</td>
                                    <td>{job.Profile?.title || '--'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td>{new Date(job.createdAt).toLocaleString()}</td>
                                    <td className="error-cell">
                                        {job.error ? (
                                            <span className="error-text" title={job.error}>
                                                {job.error.substring(0, 50)}...
                                            </span>
                                        ) : (
                                            '--'
                                        )}
                                    </td>
                                    <td className="actions">
                                        {job.status === 'failed' && (
                                            <button
                                                onClick={() => handleRetry(job.id)}
                                                className="btn-small btn-primary"
                                            >
                                                🔄 Retry
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AnalysisJobMonitoring;
