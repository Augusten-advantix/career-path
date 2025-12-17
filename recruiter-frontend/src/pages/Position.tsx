import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import UploadArea from '../components/UploadArea';
import ProfileList from '../components/ProfileList';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/ToastContext';

const PositionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const reqId = id ? Number(id) : null;
    const [jobReq, setJobReq] = useState<any | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchJobRequirement();
        fetchProfiles();
    }, [id]);

    const fetchJobRequirement = async () => {
        try {
            const res = await axios.get('/api/recruiter/job-requirements');
            const found = res.data.find((r: any) => r.id === reqId);
            setJobReq(found || null);
        } catch (err) {
            console.error('Failed to load job requirement', err);
        }
    };

    const fetchProfiles = async () => {
        if (!reqId) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/recruiter/profiles', { params: { jobRequirementId: reqId } });
            setProfiles(response.data);
        } catch (err) {
            console.error('Failed to fetch profiles', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePosition = async () => {
        if (!reqId) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/recruiter/job-requirements/${reqId}`);
            showToast('success', 'Position deleted');
            // Navigate back to dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Delete position failed', err);
            showToast('error', 'Failed to delete position');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Position: {jobReq?.structuredRequirements?.jobTitle || 'Untitled'}</h1>
                        <p className="text-sm text-slate-600">Created: {jobReq ? new Date(jobReq.createdAt).toLocaleString() : ' — '}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="text-sm underline">Back to Positions</Link>
                        <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => setShowDelete(true)}>Delete Position</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="font-semibold mb-4">Upload Resumes for this Position</h3>
                    <UploadArea jobRequirementId={reqId} onUploadComplete={fetchProfiles} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-4">Analyzed Candidates</h3>
                    {loading ? (
                        <p className="text-center text-slate-500">Loading...</p>
                    ) : (
                        <ProfileList profiles={profiles} onAnalysisStart={fetchProfiles} />
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showDelete}
                title={`Delete Position`}
                message={'Are you sure you want to delete this position? uploads will be unlinked but not deleted.'}
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
                confirmDisabled={isDeleting}
                cancelText='Cancel'
                onConfirm={handleDeletePosition}
                onCancel={() => setShowDelete(false)}
            />
        </div>
    );
};

export default PositionPage;
