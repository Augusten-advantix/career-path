import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from './ToastContext';

interface Profile {
    id: number;
    name: string;
    title: string;
    parseConfidence: number;
    analysis: any;
    analysisJob?: { id?: number; status?: 'queued' | 'running' | 'success' | 'failed' } | null;
}

interface ProfileListProps {
    profiles: Profile[];
    onAnalysisStart: () => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles, onAnalysisStart }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsDeleting(true);
        try {
            await axios.post('/api/recruiter/profiles/delete', { profileIds: selectedIds });
            showToast('success', 'Selected profiles deleted.');
            setSelectedIds([]);
            onAnalysisStart(); // refresh
            setShowConfirm(false);
        } catch (error) {
            console.error('Delete failed:', error);
            showToast('error', 'Failed to delete selected profiles.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Analyzed Candidates ({profiles.length})</h2>
                {selectedIds.length > 0 && (
                    <>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Delete Selected ({selectedIds.length})
                        </button>
                        <ConfirmDialog
                            open={showConfirm}
                            title={`Delete ${selectedIds.length} profile${selectedIds.length > 1 ? 's' : ''}`}
                            message={`Are you sure you want to permanently delete ${selectedIds.length} profile${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
                            confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                            confirmDisabled={isDeleting}
                            cancelText="Cancel"
                            onConfirm={handleConfirmDelete}
                            onCancel={() => setShowConfirm(false)}
                        />
                    </>
                )}
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {profiles.map(profile => (
                        <li key={profile.id} className="flex items-center px-6 py-4 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(profile.id)}
                                onChange={() => toggleSelect(profile.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div className="flex-1 min-w-0">
                                <Link to={`/profile/${profile.id}`} className="block focus:outline-none">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">{profile.name}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            {profile.analysis ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Analyzed
                                                </span>
                                            ) : (profile.analysisJob && (profile.analysisJob.status === 'queued' || profile.analysisJob.status === 'running') ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Analyzing
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Pending
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {profile.title || 'Unknown Title'}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 gap-4">
                                            <p>Confidence: {Math.round((profile.parseConfidence || 0) * 100)}%</p>
                                            {profile.analysis && (
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${profile.analysis.match_score >= 75 ? 'bg-green-100 text-green-800' : profile.analysis.match_score >= 45 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        Score: {Math.round(profile.analysis.match_score)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{profile.analysis.match_reasons || ''}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProfileList;
