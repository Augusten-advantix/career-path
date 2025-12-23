import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface Profile {
    id: number;
    name: string;
    title: string;
    company: string;
    yearsExperience: number;
    skills: any;
    parseConfidence: number;
    createdAt: string;
}

const ProfileManagement: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchProfiles();
    }, [isAdmin, navigate, page, search]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/profiles`, {
                params: { page, limit: 20, search },
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfiles(response.data.profiles);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (profileId: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/profiles/${profileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedProfile(response.data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to fetch profile details');
        }
    };

    const handleDelete = async (profileId: number) => {
        if (!window.confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/admin/profiles/${profileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProfiles();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete profile');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-spinner">Loading profiles...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <h2>Profile Management</h2>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name, title, or company..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="search-input"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Profiles Table */}
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Experience</th>
                                <th>Confidence</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td>{profile.id}</td>
                                    <td>{profile.name || '--'}</td>
                                    <td>{profile.title || '--'}</td>
                                    <td>{profile.company || '--'}</td>
                                    <td>{profile.yearsExperience || '--'} yrs</td>
                                    <td>
                                        <span className={`confidence-badge ${profile.parseConfidence > 0.8 ? 'high' :
                                                profile.parseConfidence > 0.5 ? 'medium' : 'low'
                                            }`}>
                                            {profile.parseConfidence ? (profile.parseConfidence * 100).toFixed(0) + '%' : 'N/A'}
                                        </span>
                                    </td>
                                    <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleViewDetails(profile.id)}
                                            className="btn-small btn-primary"
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(profile.id)}
                                            className="btn-small btn-danger"
                                        >
                                            🗑️ Delete
                                        </button>
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

                {/* Profile Detail Modal */}
                {selectedProfile && (
                    <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Profile Details</h3>
                                <button onClick={() => setSelectedProfile(null)} className="close-btn">
                                    ✕
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-section">
                                    <h4>Basic Information</h4>
                                    <p><strong>Name:</strong> {selectedProfile.profile.name || 'N/A'}</p>
                                    <p><strong>Title:</strong> {selectedProfile.profile.title || 'N/A'}</p>
                                    <p><strong>Company:</strong> {selectedProfile.profile.company || 'N/A'}</p>
                                    <p><strong>Experience:</strong> {selectedProfile.profile.yearsExperience || 'N/A'} years</p>
                                </div>
                                {selectedProfile.profile.skills && (
                                    <div className="detail-section">
                                        <h4>Skills</h4>
                                        <div className="skills-list">
                                            {Array.isArray(selectedProfile.profile.skills) ? (
                                                selectedProfile.profile.skills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="skill-tag">{skill}</span>
                                                ))
                                            ) : (
                                                <p>{JSON.stringify(selectedProfile.profile.skills)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {selectedProfile.analysisJob && (
                                    <div className="detail-section">
                                        <h4>Analysis Status</h4>
                                        <p><strong>Status:</strong> {selectedProfile.analysisJob.status}</p>
                                        {selectedProfile.analysisJob.error && (
                                            <p className="error-text">
                                                <strong>Error:</strong> {selectedProfile.analysisJob.error}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProfileManagement;
