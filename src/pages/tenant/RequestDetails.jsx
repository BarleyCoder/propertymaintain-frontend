import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import API from '../../utils/axios';

const RequestDetails = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRequestDetails = useCallback(async () => {
        try {
            const response = await API.get(`/api/maintenance/${id}`);
            setRequest(response.data.request);
        } catch (error) {
            console.error('Error fetching request details:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRequestDetails();
    }, [fetchRequestDetails]);

    const priorityColors = {
        high: 'bg-red-100 text-red-700',
        emergency: 'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-gray-100 text-gray-700'
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-amber-700',
        approved: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700'
    };

    const steps = {
        pending: { progress: '0%', active: ['pending'] },
        approved: { progress: '33%', active: ['pending', 'approved'] },
        in_progress: { progress: '66%', active: ['pending', 'approved', 'in_progress'] },
        completed: { progress: '100%', active: ['pending', 'approved', 'in_progress', 'completed'] }
    };

    const currentStep = request ? (steps[request.status] || steps.pending) : steps.pending;

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TenantSidebar />
                <main className="flex-1 flex items-center justify-center md:ml-64">
                    <p className="text-[#414754]">Loading request details...</p>
                </main>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TenantSidebar />
                <main className="flex-1 flex items-center justify-center md:ml-64">
                    <p className="text-[#414754]">Request not found.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f7f9ff]">
            <TenantSidebar />

            <main className="flex-grow md:ml-64 flex flex-col min-h-screen">

                {/* Top Navbar */}
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-white border-b border-[#c1c6d6]">
                    <span className="font-bold text-lg text-[#005bbf]">Request Details</span>
                    <div className="flex items-center gap-4">
                        <button className="material-symbols-outlined text-[#414754] p-2 hover:bg-[#f1f4fa] rounded-full">notifications</button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">

                    {/* Back Button & Header */}
                    <div>
                        <Link className="flex items-center gap-1 text-[#005bbf] hover:underline text-xs font-semibold mb-2" to="/tenant/my-requests">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to My Requests
                        </Link>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-[#181c20] capitalize">
                                {request.category} Issue
                            </h2>
                            <span className="text-xs font-semibold text-[#414754] bg-[#ebeef4] px-3 py-1 rounded-lg">
                                #TKT-{request.id}
                            </span>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                        <h3 className="text-xs font-semibold text-[#414754] uppercase tracking-wider mb-6">Request Status</h3>
                        <div className="relative flex justify-between items-center w-full">
                            <div className="absolute top-4 left-0 w-full h-1 bg-[#dfe3e8] rounded-full z-0"></div>
                            <div
                                className="absolute top-4 left-0 h-1 bg-[#005bbf] rounded-full z-0 transition-all"
                                style={{ width: currentStep.progress }}>
                            </div>

                            {['pending', 'approved', 'in_progress', 'completed'].map((step) => {
                                const isActive = currentStep.active.includes(step);
                                const icons = { pending: 'hourglass_empty', approved: 'thumb_up', in_progress: 'sync', completed: 'done_all' };
                                const labels = { pending: 'Pending', approved: 'Approved', in_progress: 'In Progress', completed: 'Completed' };

                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${isActive ? 'bg-[#005bbf] text-white' : 'bg-[#dfe3e8] text-[#414754]'}`}>
                                            <span className="material-symbols-outlined text-sm">{icons[step]}</span>
                                        </div>
                                        <span className={`text-xs font-semibold ${isActive ? 'text-[#005bbf] font-bold' : 'text-[#414754]'}`}>
                                            {labels[step]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Request Info */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-[#181c20]">Request Information</h3>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${priorityColors[request.priority] || 'bg-gray-100 text-gray-700'}`}>
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                    <span className="capitalize">{request.priority} Priority</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#c1c6d6] pb-6 mb-6">
                                <div>
                                    <span className="text-xs font-semibold text-[#414754] uppercase">Category</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="material-symbols-outlined text-[#005bbf]">build</span>
                                        <span className="text-sm font-medium capitalize">{request.category}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-[#414754] uppercase">Date Submitted</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="material-symbols-outlined text-[#414754]">calendar_today</span>
                                        <span className="text-sm font-medium">
                                            {new Date(request.submitted_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-semibold text-[#414754] uppercase mb-2">Description</h4>
                                <p className="text-sm text-[#181c20] leading-relaxed">{request.description}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-[#414754] uppercase mb-2">Current Status</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[request.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {formatStatus(request.status)}
                                </span>
                            </div>
                        </div>

                        {/* Right: Technician & Actions */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <h3 className="text-lg font-bold text-[#181c20] mb-4">Technician Details</h3>
                                {request.technician_name ? (
                                    <div className="flex items-center gap-3 p-3 bg-[#f1f4fa] rounded-lg border border-[#c1c6d6]">
                                        <div className="w-10 h-10 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#005bbf] font-bold">
                                            {request.technician_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#181c20]">{request.technician_name}</p>
                                            <p className="text-xs text-[#414754]">Assigned Technician</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-[#f1f4fa] rounded-lg border border-[#c1c6d6]">
                                        <div className="w-10 h-10 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#005bbf] font-bold">?</div>
                                        <div>
                                            <p className="text-sm font-bold text-[#181c20]">Not yet assigned</p>
                                            <p className="text-xs text-[#414754]">Awaiting landlord approval</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#f1f4fa] p-6 rounded-xl border border-[#c1c6d6] flex flex-col gap-3">
                                <h4 className="text-xs font-semibold text-[#414754] uppercase">Need Help?</h4>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-xs font-semibold hover:bg-white/80 transition-colors">
                                    <span className="material-symbols-outlined text-xl">call</span>
                                    Call Property Manager
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-xs font-semibold hover:bg-white/80 transition-colors">
                                    <span className="material-symbols-outlined text-xl">help</span>
                                    Help Center
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RequestDetails;