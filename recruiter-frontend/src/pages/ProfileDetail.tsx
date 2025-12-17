import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Award, Star, Shield, AlertTriangle } from 'lucide-react';

const ProfileDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // In a real app we'd have a specific endpoint for single profile or filter the list
                // For now, let's just fetch the list and find it, or assume the backend supports /profiles/:id
                // Wait, I didn't implement /profiles/:id in backend yet. I only did /profiles (list) and /analysis/:id (job status)
                // Let's quickly add a get profile by ID endpoint in the backend or just filter client side for MVP speed.
                // Client side filtering is faster for now given the context.
                const response = await axios.get('/api/recruiter/profiles');
                const found = response.data.find((p: any) => p.id === Number(id));
                setProfile(found);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!profile) return <div className="p-8 text-center">Profile not found</div>;

    const analysis = profile.analysis;
    const structured = profile.extractedSnippets?.structured;
    const confidence = Math.round((profile.parseConfidence || 0) * 100);
    const isAnalyzing = profile.analysisJob && (profile.analysisJob.status === 'queued' || profile.analysisJob.status === 'running');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h1>
                            <p className="text-sm text-slate-500 mt-1">{profile.title}</p>
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-sm text-slate-500">Parse Confidence: <strong className="text-slate-800">{confidence}%</strong></span>
                                {isAnalyzing && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs font-semibold border border-yellow-100">
                                        <AlertTriangle className="w-3 h-3" /> Analysis in progress
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {analysis && (
                                <div className="inline-flex items-center gap-3 bg-white px-3 py-2 rounded-full shadow-sm border border-slate-100">
                                    <div className="text-xs text-slate-500">Match Score</div>
                                    <div className={`px-3 py-1 rounded-full font-semibold text-sm ${analysis.match_score >= 75 ? 'bg-emerald-100 text-emerald-800' : analysis.match_score >= 45 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                        {Math.round(analysis.match_score)}/100
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {analysis ? (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="w-4 h-4 text-emerald-600" />
                                    <h3 className="text-lg font-semibold text-emerald-700">Strengths</h3>
                                </div>
                                <ul className="list-disc list-inside space-y-2">
                                    {analysis.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-slate-700">{s}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <h3 className="text-lg font-semibold text-red-700">Weaknesses</h3>
                                </div>
                                <ul className="list-disc list-inside space-y-2">
                                    {analysis.weaknesses?.map((s: string, i: number) => (
                                        <li key={i} className="text-slate-700">{s}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-lg font-semibold text-amber-700 mb-3">Identified Gaps</h3>
                                <div className="space-y-3">
                                    {analysis.gaps?.map((gap: any, i: number) => (
                                        <div key={i} className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-amber-900">{gap.description}</p>
                                                <div className="text-xs text-amber-700">Severity: <strong className="font-semibold">{gap.severity}</strong></div>
                                            </div>
                                            <div className="mt-2 text-xs text-amber-700">Type: {gap.type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-indigo-700" />
                                    <h3 className="text-lg font-semibold text-indigo-800">Suggested Solution</h3>
                                </div>
                                <p className="text-indigo-900">{analysis.one_solution}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            Analysis pending or not started.
                        </div>
                    )}
                    {structured && (
                        <div className="p-6 bg-slate-50 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-3">Structured Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Name:</span> {structured.name || '—'}</p>
                                    <p><span className="font-semibold">Title:</span> {structured.title || '—'}</p>
                                    <p><span className="font-semibold">Years Experience:</span> {structured.yearsExperience || '—'}</p>
                                    <p><span className="font-semibold">Location:</span> {structured.location || '—'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Skills:</span> {(structured.skills && structured.skills.join(', ')) || '—'}</p>
                                    <p><span className="font-semibold">Emails:</span> {(structured.emails && structured.emails.join(', ')) || '—'}</p>
                                    <p><span className="font-semibold">Phones:</span> {(structured.phones && structured.phones.join(', ')) || '—'}</p>
                                    <p><span className="font-semibold">Education:</span> {(structured.education && structured.education.join(', ')) || '—'}</p>
                                </div>
                            </div>
                            {structured.summary && (
                                <div className="mt-4 text-sm text-slate-700">
                                    <p className="font-semibold mb-2">Summary</p>
                                    <p className="text-slate-600">{structured.summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileDetail;
