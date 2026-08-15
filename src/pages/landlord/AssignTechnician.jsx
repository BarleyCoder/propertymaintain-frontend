import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const AssignTechnician = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const requestsRes = await API.get('/api/maintenance/landlord');
            const pendingRequests = requestsRes.data.requests.filter(
                r => r.status === 'pending' || r.status === 'approved'
            );
            setRequests(pendingRequests);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch technicians for selected request when request changes
    useEffect(() => {
        const fetchTechs = async () => {
            if (!selectedRequest) return setTechnicians([]);
            setLoading(true);
            try {
                const res = await API.get(`/api/technician/available/${selectedRequest}`);
                // Each item is a profile with userId populated
                setTechnicians(res.data.technicians || []);
            } catch (err) {
                console.error('Error fetching technicians for request:', err);
                setTechnicians([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTechs();
    }, [selectedRequest]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await API.post('/api/workorders', {
                request_id: selectedRequest,
                technician_id: selectedTechnician,
                scheduled_date: scheduledDate,
                notes: notes
            });
            setSuccess('Technician assigned successfully!');
            setSelectedRequest('');
            setSelectedTechnician('');
            setScheduledDate('');
            setNotes('');
            fetchData();
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) setError('You must be logged in');
            else if (status === 403) setError('You are not authorized to assign technicians');
            else if (status === 404) setError('Resource not found');
            else if (status === 500) setError('Server error. Try again later');
            else setError(err.response?.data?.message || 'Error assigning technician');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#181c20]">Technician Profile</h3>
                            <button type="button" onClick={() => setSelectedProfile(null)} className="rounded-full bg-[#f1f4fa] px-2 py-1 text-sm text-[#414754]">Close</button>
                        </div>
                        <div className="space-y-4 text-sm text-[#414754]">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d8e2ff] text-lg font-bold text-[#005bbf]">
                                    {(selectedProfile.userId?.full_name || 'T').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-[#181c20]">{selectedProfile.userId?.full_name || 'Technician'}</p>
                                    <p className="text-xs uppercase tracking-wide text-[#005bbf]">{selectedProfile.verificationStatus}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>Specialization:</strong> {[selectedProfile.primarySpecialization, ...(selectedProfile.specializations || [])].filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') || 'N/A'}</div>
                                <div><strong>Experience:</strong> {selectedProfile.yearsOfExperience || 0} years</div>
                                <div><strong>Service Area:</strong> {selectedProfile.serviceLocation || 'N/A'}</div>
                                <div><strong>Availability:</strong> {selectedProfile.isAvailable ? 'Available' : 'Unavailable'}</div>
                            </div>
                            <div>
                                <strong>Bio:</strong>
                                <p className="mt-1">{selectedProfile.bio || 'No bio provided.'}</p>
                            </div>
                            <div>
                                <strong>Certifications:</strong>
                                <p className="mt-1">{(selectedProfile.certifications || []).join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <strong>Qualification Documents:</strong>
                                <ul className="mt-1 list-disc pl-5">
                                    {(selectedProfile.qualificationDocuments || []).length > 0 ? selectedProfile.qualificationDocuments.map((doc, index) => (
                                        <li key={`${doc.name}-${index}`}>
                                            {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="text-[#005bbf] underline">{doc.name}</a> : doc.name}
                                        </li>
                                    )) : <li>No documents uploaded</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="font-bold text-lg text-[#005bbf]">Assign Technician</div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa]">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto">

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-[#181c20]">Assign Technician</h1>
                            <p className="text-sm text-[#414754]">Select a qualified professional to handle a maintenance request.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Assignment Form */}
                            <div className="lg:col-span-5">
                                <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#181c20] mb-6">Assignment Details</h3>

                                    {error && (
                                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                            {success}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">

                                        {/* Select Request */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-[#414754] uppercase">Select Request</label>
                                            <select
                                                className="w-full border border-[#c1c6d6] rounded-lg px-4 py-3 text-sm focus:border-[#005bbf] outline-none"
                                                required
                                                value={selectedRequest}
                                                onChange={(e) => setSelectedRequest(e.target.value)}>
                                                <option value="">Choose a request...</option>
                                                {requests.map(r => (
                                                    <option key={r._id} value={r._id}>
                                                        #PM-{r._id} - {r.category} ({r.tenantId?.full_name || 'Tenant'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Select Technician */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-[#414754] uppercase">Select Technician</label>
                                            <select
                                                className="w-full border border-[#c1c6d6] rounded-lg px-4 py-3 text-sm focus:border-[#005bbf] outline-none"
                                                required
                                                value={selectedTechnician}
                                                onChange={(e) => setSelectedTechnician(e.target.value)}>
                                                <option value="">Choose a technician...</option>
                                                {technicians.map(profile => (
                                                    <option key={profile.userId._id} value={profile.userId._id}>
                                                        {profile.userId.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Scheduled Date */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-[#414754] uppercase">Deadline Date</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">calendar_today</span>
                                                <input
                                                    className="w-full pl-10 pr-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                                    required
                                                    type="date"
                                                    value={scheduledDate}
                                                    onChange={(e) => setScheduledDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-[#414754] uppercase">Special Instructions</label>
                                            <textarea
                                                className="w-full border border-[#c1c6d6] rounded-lg px-4 py-3 text-sm focus:border-[#005bbf] outline-none resize-none"
                                                placeholder="Enter specific instructions for the technician..."
                                                rows="4"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}>
                                            </textarea>
                                        </div>

                                        {/* Info Box */}
                                        <div className="bg-[#d8e2ff]/30 p-4 rounded-lg flex items-start gap-3">
                                            <span className="material-symbols-outlined text-[#005bbf]">info</span>
                                            <p className="text-xs text-[#414754]">
                                                Assigning a technician will automatically update the request status to In Progress.
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            className="w-full bg-[#005bbf] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#004493] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            disabled={submitting}
                                            type="submit">
                                            <span className="material-symbols-outlined">engineering</span>
                                            {submitting ? 'Assigning...' : 'Assign Technician'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Technician Cards */}
                            <div className="lg:col-span-7">
                                <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#181c20] mb-6">Available Technicians</h3>

                                    {loading ? (
                                        <p className="text-sm text-[#414754]">Loading technicians...</p>
                                    ) : technicians.length === 0 ? (
                                        <div className="text-center py-8">
                                            <span className="material-symbols-outlined text-5xl text-[#c1c6d6]">engineering</span>
                                            <p className="text-sm text-[#414754] mt-2">No technicians registered yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {technicians.map(profile => {
                                                const tech = profile.userId || {};
                                                const isSelected = selectedTechnician === String(tech._id);
                                                return (
                                                    <div
                                                        key={tech._id}
                                                        className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#005bbf] bg-[#f1f4fa]' : 'border-[#c1c6d6] hover:shadow-md'}`}
                                                        onClick={() => setSelectedTechnician(tech._id)}>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-14 h-14 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#005bbf] font-bold text-xl">
                                                                    {tech.full_name?.charAt(0) || 'T'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[#181c20]">{tech.full_name}</p>
                                                                    <span className="text-xs font-semibold text-[#005bbf] bg-[#d8e2ff]/30 px-2 py-0.5 rounded">✓ Verified</span>
                                                                </div>
                                                            </div>
                                                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${profile.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                {profile.isAvailable ? 'Available' : 'Unavailable'}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 border-t border-[#c1c6d6] pt-3">
                                                            <div className="text-sm text-[#414754]">
                                                                <strong>Specialization:</strong> {[profile.primarySpecialization, ...(profile.specializations || [])].filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-[#414754]">
                                                                <strong>Years:</strong> {profile.yearsOfExperience || 0}
                                                            </div>
                                                            <div className="text-sm text-[#414754]">
                                                                <strong>Certs:</strong> {(profile.certifications || []).join(', ') || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-[#414754]">
                                                                <strong>Avg Rating:</strong> {profile.averageRating || 0}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2 pt-2">
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedProfile(profile); }} className="text-xs font-semibold text-[#005bbf] underline">View Profile</button>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedTechnician(tech._id); }} className="rounded-lg bg-[#005bbf] px-3 py-1.5 text-xs font-bold text-white">Assign</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignTechnician;