import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TechnicianSidebar from '../../components/TechnicianSidebar';
import API from '../../utils/axios';

const UpdateWorkOrder = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [workOrder, setWorkOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        status: '',
        comment: '',
        proof_image_url: ''
    });

    const fetchWorkOrder = useCallback(async () => {
        try {
            const response = await API.get(`/api/workorders/${id}`);
            setWorkOrder(response.data.workOrder);
            setFormData(prev => ({
                ...prev,
                status: response.data.workOrder.status
            }));
        } catch (error) {
            console.error('Error fetching work order:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchWorkOrder();
    }, [fetchWorkOrder]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await API.put(`/api/workorders/${id}/status`, formData);
            setSuccess('Work order updated successfully!');
            setTimeout(() => navigate('/technician/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating work order');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            assigned: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-amber-700',
            completed: 'bg-green-100 text-green-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TechnicianSidebar />
                <main className="flex-1 flex items-center justify-center md:ml-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#005bbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#414754]">Loading work order...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TechnicianSidebar />
                <main className="flex-1 flex items-center justify-center md:ml-64">
                    <p className="text-[#414754]">Work order not found.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TechnicianSidebar />

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-[#005bbf] hover:bg-[#f1f4fa] p-2 rounded-lg"
                            onClick={() => navigate('/technician/dashboard')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span className="font-bold text-lg text-[#005bbf]">Update Work Order</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs text-[#414754]">
                            <button
                                className="hover:text-[#005bbf]"
                                onClick={() => navigate('/technician/dashboard')}>
                                Dashboard
                            </button>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="text-[#181c20] font-bold">#WO-{workOrder.id}</span>
                        </nav>

                        <div>
                            <h2 className="text-3xl font-bold text-[#181c20]">Update Work Order</h2>
                            <p className="text-sm text-[#414754]">Provide details on the progress or completion of this maintenance request.</p>
                        </div>

                        {/* Ticket Details Card */}
                        <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                            <div className="bg-[#1a73e8] p-4 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white">
                                        <span className="material-symbols-outlined">build</span>
                                    </span>
                                    <div>
                                        <p className="text-white/80 text-xs uppercase tracking-wider">Work Order ID</p>
                                        <h3 className="text-white font-bold text-lg">#WO-{workOrder.id}</h3>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-lg text-xs font-bold ${getStatusBadge(workOrder.status)}`}>
                                    {formatStatus(workOrder.status)}
                                </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Category</p>
                                    <p className="text-sm font-bold capitalize">{workOrder.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Description</p>
                                    <p className="text-sm">{workOrder.description}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Priority</p>
                                    <p className="text-sm font-bold capitalize">{workOrder.priority}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Scheduled Date</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#414754] text-sm">calendar_today</span>
                                        <p className="text-sm">{new Date(workOrder.scheduled_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Location</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#414754] text-sm">location_on</span>
                                        <p className="text-sm">{workOrder.property_name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Notes from Manager</p>
                                    <p className="text-sm text-[#414754]">{workOrder.notes || 'No special instructions'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Update Form */}
                        <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#c1c6d6] bg-[#f1f4fa] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#005bbf]">edit_note</span>
                                <h3 className="text-lg font-bold text-[#181c20]">Update Details</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                                {error && (
                                    <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm">
                                        {success}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Status */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase">
                                            Updated Status <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full h-12 bg-white border border-[#c1c6d6] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none appearance-none"
                                                name="status"
                                                required
                                                value={formData.status}
                                                onChange={handleChange}>
                                                <option value="assigned">Assigned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
                                        </div>
                                    </div>

                                    {/* Completion Date */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase">
                                            Completion Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 bg-white border border-[#c1c6d6] rounded-lg px-4 text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none"
                                                type="date"
                                            />
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">calendar_month</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Repair Notes */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase">
                                        Repair & Progress Notes <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-white border border-[#c1c6d6] rounded-lg p-4 text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none resize-none"
                                        name="comment"
                                        placeholder="Describe the work performed, any parts used, and remaining steps..."
                                        required
                                        rows="5"
                                        value={formData.comment}
                                        onChange={handleChange}>
                                    </textarea>
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase">
                                        Proof Image URL (Optional)
                                    </label>
                                    <input
                                        className="w-full bg-white border border-[#c1c6d6] rounded-lg p-4 text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none"
                                        name="proof_image_url"
                                        placeholder="Enter image URL..."
                                        type="text"
                                        value={formData.proof_image_url}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4">
                                    <button
                                        className="w-full sm:w-auto px-6 h-12 rounded-lg border border-[#005bbf] text-[#005bbf] font-bold hover:bg-[#005bbf]/5 transition-colors"
                                        type="button"
                                        onClick={() => navigate('/technician/dashboard')}>
                                        Cancel
                                    </button>
                                    <button
                                        className="w-full sm:w-auto px-8 h-12 rounded-lg bg-[#005bbf] text-white font-bold hover:bg-[#004493] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={submitting}
                                        type="submit">
                                        <span className="material-symbols-outlined">sync</span>
                                        {submitting ? 'Updating...' : 'Update Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdateWorkOrder;