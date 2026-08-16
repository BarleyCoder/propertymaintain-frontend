import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import StatusMessage from '../../components/StatusMessage';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const TenantDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [propertyCode, setPropertyCode] = useState('');
    const [joinRequests, setJoinRequests] = useState([]);
    const [joinLoading, setJoinLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({ type: 'info', text: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await API.get('/api/maintenance/tenant');
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchJoinRequests = useCallback(async () => {
        setJoinLoading(true);
        try {
            const response = await API.get('/api/properties/join/tenant');
            setJoinRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching join requests:', error);
        } finally {
            setJoinLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            if (!active) return;
            await fetchRequests();
            await fetchJoinRequests();
        };
        loadData();
        return () => { active = false; };
    }, [fetchRequests, fetchJoinRequests]);

    useDataRefresh(() => {
        fetchRequests();
        fetchJoinRequests();
    }, 'tenant');

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-amber-700',
            approved: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'text-red-500',
            emergency: 'text-red-500',
            medium: 'text-amber-500',
            low: 'text-gray-500'
        };
        return colors[priority] || 'text-gray-500';
    };

    const getPriorityDot = (priority) => {
        const dots = {
            high: 'bg-red-500',
            emergency: 'bg-red-500',
            medium: 'bg-amber-500',
            low: 'bg-gray-400'
        };
        return dots[priority] || 'bg-gray-400';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    const latestRequest = joinRequests[0];
    const propertyStatusMessage = latestRequest?.status === 'approved'
        ? `You have been successfully added to ${latestRequest.propertyId?.name || 'this property'}.`
        : latestRequest?.status === 'rejected'
            ? 'Your request to join this property was rejected.'
            : latestRequest?.status === 'pending' && latestRequest.propertyId?.name
                ? `Your request to join ${latestRequest.propertyId.name} is waiting for landlord approval.`
                : 'Submit an access request to begin.';

    const approvedRequests = joinRequests.filter(r => r.status === 'approved');

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TenantSidebar />

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search tickets..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa] relative">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#181c20]">
                            Hello, {user?.full_name}! 👋
                        </h1>
                        <p className="text-[#414754]">
                            Here is an overview of your property maintenance status.
                        </p>
                    </div>

                    {/* Property Linking */}
                    <div className="mb-6">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 max-w-md">
                            <h3 className="text-sm font-semibold mb-2">Request Access to a Property</h3>
                            <p className="text-xs text-[#727785] mb-3">Enter the property code provided by your landlord. Your request will be sent for approval.</p>
                            {statusMessage.text && (
                                <div className="mb-3">
                                    <StatusMessage type={statusMessage.type} message={statusMessage.text} onClose={() => setStatusMessage({ type: 'info', text: '' })} />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border border-[#c1c6d6] rounded-lg px-3 py-2"
                                    placeholder="Property code"
                                    value={propertyCode}
                                    onChange={(e) => setPropertyCode(e.target.value)}
                                />
                                <button
                                    className="bg-[#005bbf] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    disabled={submitting}
                                    onClick={async () => {
                                        const code = propertyCode?.trim();
                                        if (!code) {
                                            setStatusMessage({ type: 'error', text: 'Please enter a property code.' });
                                            return;
                                        }

                                        setSubmitting(true);
                                        try {
                                            await API.post('/api/properties/join', { property_code: code.toUpperCase() });
                                            setStatusMessage({ type: 'success', text: 'Join request sent successfully. Waiting for landlord approval.' });
                                            setPropertyCode('');
                                            triggerDataRefresh('tenant');
                                            fetchRequests();
                                            fetchJoinRequests();
                                        } catch (err) {
                                            setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Error submitting join request' });
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                >{submitting ? 'Sending...' : 'Request'}</button>
                            </div>
                        </div>
                    </div>

                    {/* Property connection status */}
                    <div className="mb-6">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 max-w-4xl">
                            <h3 className="text-sm font-semibold">Property Connection Status</h3>
                            <p className="mt-2 text-sm text-[#414754]">{propertyStatusMessage}</p>
                        </div>
                    </div>

                    {/* Join Requests */}
                    <div className="mb-6">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 max-w-4xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold">Property Access Requests</h3>
                                    <p className="text-xs text-[#727785]">Review the status of requests to join a property.</p>
                                </div>
                            </div>
                            {joinLoading ? (
                                <p className="text-sm text-[#414754]">Loading join requests...</p>
                            ) : joinRequests.length === 0 ? (
                                <p className="text-sm text-[#414754]">No property access requests submitted yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {joinRequests.map((request) => (
                                        <div key={request._id} className="border rounded-lg p-4 bg-[#f7f9ff]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold">{request.propertyId?.name || request.propertyCode}</div>
                                                    <div className="text-xs text-[#727785]">Code: {request.propertyCode}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'approved' ? 'bg-green-100 text-green-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-amber-700'}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#414754] mt-2">Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-lg bg-[#d8e2ff] flex items-center justify-center text-[#004493]">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <span className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Total Requests</span>
                            <span className="text-3xl font-bold text-[#181c20]">{stats.total}</span>
                        </div>
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-amber-700">
                                <span className="material-symbols-outlined">hourglass_empty</span>
                            </div>
                            <span className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Pending</span>
                            <span className="text-3xl font-bold text-amber-600">{stats.pending}</span>
                        </div>
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-lg bg-[#d8e2ff] flex items-center justify-center text-[#004494]">
                                <span className="material-symbols-outlined">sync</span>
                            </div>
                            <span className="text-xs font-semibold text-[#414754] uppercase tracking-wider">In Progress</span>
                            <span className="text-3xl font-bold text-[#005ac1]">{stats.inProgress}</span>
                        </div>
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-lg bg-[#89fa9b] flex items-center justify-center text-[#005320]">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <span className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Completed</span>
                            <span className="text-3xl font-bold text-[#006d2c]">{stats.completed}</span>
                        </div>
                    </div>

                    {/* Recent Requests Table */}
                    <div className="bg-white border border-[#c1c6d6] rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#c1c6d6] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[#181c20]">Recent Requests</h3>
                            <Link
                                className="text-[#005bbf] font-bold text-xs hover:underline"
                                to="/tenant/my-requests">
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Ticket ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Priority</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c1c6d6]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                No requests found.{' '}
                                                <Link
                                                    to="/tenant/submit-request"
                                                    className="text-[#005bbf] font-bold hover:underline">
                                                    Submit your first request!
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.slice(0, 5).map(request => (
                                            <tr key={request.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#181c20]">#TKT-{request.id}</td>
                                                <td className="px-6 py-4 text-sm capitalize">{request.category}</td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${getPriorityColor(request.priority)}`}>
                                                        <span className={`w-2 h-2 rounded-full ${getPriorityDot(request.priority)}`}></span>
                                                        {request.priority}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(request.status)}`}>
                                                        {formatStatus(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[#414754] text-sm">
                                                    {new Date(request.submitted_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/tenant/request-details/${request.id}`}
                                                        className="text-[#005bbf] hover:bg-[#005bbf]/10 p-2 rounded-lg transition-all">
                                                        <span className="material-symbols-outlined">visibility</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TenantDashboard;