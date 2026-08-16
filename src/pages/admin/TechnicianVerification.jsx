import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import API from '../../utils/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const TechnicianVerification = () => {
    const { user } = useAuth();
    const [pendingTechnicians, setPendingTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [notesMap, setNotesMap] = useState({});

    const fetchPending = useCallback(async () => {
        try {
            const res = await API.get('/api/technician/admin/pending');
            setPendingTechnicians(res.data.technicians || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load pending technician profiles.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    useDataRefresh(() => {
        fetchPending();
    }, 'admin');

    const handleOutcome = async (technicianId, action) => {
        const note = (notesMap[technicianId] || '').trim();
        setProcessingId(technicianId);
        setError('');
        setSuccess('');

        if (action === 'reject' && !note) {
            setError('Please enter a reason before rejecting this technician.');
            setProcessingId(null);
            return;
        }

        try {
            const endpoint = action === 'approve' ? `/api/technician/admin/${technicianId}/verify` : `/api/technician/admin/${technicianId}/reject`;
            await API.put(endpoint, { verificationNotes: note || (action === 'approve' ? 'Approved by admin.' : 'Rejected by admin.') });
            setSuccess(action === 'approve' ? 'Technician approved successfully.' : 'Technician rejected successfully.');
            setNotesMap((prev) => ({ ...prev, [technicianId]: '' }));
            triggerDataRefresh('admin');
            await fetchPending();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to update technician verification status.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#f7f9ff]">
            <AdminSidebar />

            <main className="flex-1 overflow-hidden md:ml-64">
                <div className="min-h-screen p-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-[#181c20]">Technician Verification</h1>
                                <p className="text-sm text-[#414754]">Review and approve or reject technician profiles.</p>
                            </div>
                            <div className="rounded-full bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white">
                                {user?.full_name || 'Admin'}
                            </div>
                        </div>

                        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                        {loading ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-6 text-[#414754]">Loading technician profiles...</div>
                        ) : pendingTechnicians.length === 0 ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-center text-[#414754]">
                                No pending technician profiles to review.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {pendingTechnicians.map((profile) => {
                                    const userData = profile.userId || {};
                                    return (
                                        <div key={profile._id} className="rounded-xl border border-[#c1c6d6] bg-white p-6 shadow-sm">
                                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <h2 className="text-xl font-bold text-[#181c20]">{userData.full_name || 'Unnamed technician'}</h2>
                                                    <p className="text-sm text-[#414754]">{userData.email || 'No email'} | {userData.phone_number || 'No phone'}</p>
                                                </div>
                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                                                    {profile.verificationStatus || 'pending'}
                                                </span>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Specializations</p>
                                                    <p className="text-sm text-[#181c20]">{(profile.specializations || []).join(', ') || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Years of experience</p>
                                                    <p className="text-sm text-[#181c20]">{profile.yearsOfExperience ?? 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Service location</p>
                                                    <p className="text-sm text-[#181c20]">{profile.serviceLocation || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Certifications</p>
                                                    <p className="text-sm text-[#181c20]">{(profile.certifications || []).join(', ') || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Availability</p>
                                                    <p className="text-sm text-[#181c20]">{profile.isAvailable ? 'Available' : 'Unavailable'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Qualification docs</p>
                                                    <div className="text-sm text-[#181c20]">
                                                        {(profile.qualificationDocuments || []).length > 0 ? (
                                                            <ul className="list-disc pl-5">
                                                                {(profile.qualificationDocuments || []).map((doc, idx) => (
                                                                    <li key={`${doc.name}-${idx}`}>
                                                                        {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="text-[#005bbf] underline">{doc.name}</a> : doc.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            'No documents uploaded'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-lg border border-[#d8e2ff] bg-[#f1f4fa] p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">Bio</p>
                                                <p className="mt-1 text-sm text-[#181c20]">{profile.bio || 'No bio provided.'}</p>
                                            </div>

                                            <div className="mt-4">
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#414754]">Verification notes</label>
                                                <textarea
                                                    value={notesMap[profile.userId?._id] || ''}
                                                    onChange={(e) => setNotesMap((prev) => ({ ...prev, [profile.userId?._id]: e.target.value }))}
                                                    className="w-full rounded-lg border border-[#c1c6d6] px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                                    rows="3"
                                                    placeholder="Add optional admin notes..."
                                                />
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOutcome(profile.userId?._id, 'approve')}
                                                    disabled={processingId === profile.userId?._id}
                                                    className="rounded-lg bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                >
                                                    {processingId === profile.userId?._id ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOutcome(profile.userId?._id, 'reject')}
                                                    disabled={processingId === profile.userId?._id}
                                                    className="rounded-lg border border-[#c1c6d6] bg-white px-4 py-2 text-sm font-semibold text-[#181c20] disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicianVerification;
