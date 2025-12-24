import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Search } from 'lucide-react';

interface User {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}

const UserManagement: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [isAdmin, navigate, page, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                params: { page, limit: 20, search: searchQuery },
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteToggle = async (user: User) => {
        if (!window.confirm(`Are you sure you want to ${user.isAdmin ? 'demote' : 'promote'} this user?`)) {
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/admin/users/${user.id}`,
                { isAdmin: !user.isAdmin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDelete = async (user: User) => {
        if (!window.confirm(`Are you sure you want to delete ${user.email}? This cannot be undone.`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/admin/users/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-spinner">Loading users...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <h2>User Management</h2>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="search-input pr-12"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Users Table */}
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.name || '--'}</td>
                                    <td>
                                        <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                            {user.isAdmin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handlePromoteToggle(user)}
                                            className="btn-small btn-primary"
                                        >
                                            {user.isAdmin ? '⬇️ Demote' : '⬆️ Promote'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
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
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
