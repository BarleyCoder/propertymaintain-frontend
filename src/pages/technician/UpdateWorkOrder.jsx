import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TechnicianSidebar from '../../components/TechnicianSidebar';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const UpdateWorkOrder = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [workOrder, setWorkOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showConfirmComplete, setShowConfirmComplete] = useState(false);
    const [showConfirmUnableComplete, setShowConfirmUnableComplete] = useState(false);

    const [completionData, setCompletionData] = useState({
        completionNotes: '',
        proofImageUrl: ''
    });

    const [unableData, setUnableData] = useState({
        reason: '',
        notes: ''
    });

    const [completionEvidence, setCompletionEvidence] = useState([]);
    const [uploadingEvidence, setUploadingEvidence] = useState(false);

    const fetchWorkOrder = useCallback(async () => {
        try {
            const response = await API.get(`/api/workorders/${id}`);
            setWorkOrder(response.data.workOrder);
            if (response.data.workOrder.completionNotes) {
                setCompletionData({
                    completionNotes: response.data.workOrder.completionNotes,
                    proofImageUrl: response.data.workOrder.proofImageUrl || ''
                });
            }
            if (response.data.workOrder.completionEvidence) {
                setCompletionEvidence(response.data.workOrder.completionEvidence);
            }
        } catch (error) {
            console.error('Error fetching work order:', error);
            setError('Failed to load work order details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchWorkOrder();
    }, [fetchWorkOrder]);

    useDataRefresh(() => {
        fetchWorkOrder();
    }, 'technician');

    const handleStartWork = async () => {
        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            await API.patch(`/api/workorders/${id}/start`);
            setSuccess('Work started. Status updated to In Progress.');
            triggerDataRefresh('technician');
            await fetchWorkOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to start work. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteWork = async () => {
        if (!completionData.completionNotes.trim()) {
            setError('Please enter a completion note.');
            return;
        }

        setActionLoading(true);
        setError('');
        setSuccess('');
        setShowConfirmComplete(false);

        try {
            await API.patch(`/api/workorders/${id}/complete`, {
                completionNotes: completionData.completionNotes.trim(),
                proofImageUrl: completionData.proofImageUrl.trim() || ''
            });
            setSuccess('Work completed successfully. The landlord has been notified.');
            triggerDataRefresh('technician');
            triggerDataRefresh('landlord');
            await fetchWorkOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to complete work. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnableToComplete = async () => {
        if (!unableData.reason.trim()) {
            setError('Please select a reason.');
            return;
        }

        setActionLoading(true);
        setError('');
        setSuccess('');
        setShowConfirmUnableComplete(false);

        try {
            await API.patch(`/api/workorders/${id}/unable-to-complete`, {
                reason: unableData.reason,
                notes: unableData.notes.trim() || ''
            });
            setSuccess('Status updated. The landlord has been notified.');
            triggerDataRefresh('technician');
            triggerDataRefresh('landlord');
            await fetchWorkOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to update status. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUploadCompletionEvidence = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
        const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allAllowedTypes.includes(file.type)) {
            setError('Invalid file format. Please upload images (JPG, PNG, WEBP) or videos (MP4, MOV, WEBM).');
            return;
        }
        
        // Validate file size (20 MB)
        if (file.size > 20 * 1024 * 1024) {
            setError('File size must not exceed 20 MB.');
            return;
        }

        setUploadingEvidence(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('evidence', file);
            
            const res = await API.post(`/api/workorders/${id}/upload-evidence`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setCompletionEvidence([...completionEvidence, res.data.evidence]);
            triggerDataRefresh('technician');
            triggerDataRefresh('landlord');
            setSuccess('Evidence uploaded successfully');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading evidence');
        } finally {
            setUploadingEvidence(false);
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

    // Extract nested data safely
    const getPropertyInfo = () => {
        if (!workOrder?.requestId?.propertyId) return null;
        return workOrder.requestId.propertyId;
    };

    const getMaintenanceInfo = () => {
        if (!workOrder?.requestId) return null;
        return workOrder.requestId;
    };

    const getTenantInfo = () => {
        if (!workOrder?.requestId?.tenantId) return null;
        return workOrder.requestId.tenantId;
    };

    const getLandlordInfo = () => {
        if (!workOrder?.assignedBy) return null;
        return workOrder.assignedBy;
    };

    const property = getPropertyInfo();
    const maintenance = getMaintenanceInfo();
    const tenant = getTenantInfo();
    const landlord = getLandlordInfo();

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TechnicianSidebar />
                <main className="flex-1 flex items-center justify-center md:ml-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#005bbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#414754]">Loading work order details...</p>
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

    const isCompleted = workOrder.status === 'completed';
    const isAssigned = workOrder.status === 'assigned';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TechnicianSidebar />

            {/* Confirm Complete Modal */}
            {showConfirmComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl my-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-[#181c20] mb-4">Mark Task as Completed</h3>
                            <p className="text-sm text-[#414754] mb-6">Please provide details about the work completed.</p>
                            
                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Completion Note (Required)</label>
                                    <textarea
                                        className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none resize-none"
                                        placeholder="Describe what was done to complete this task..."
                                        rows="4"
                                        value={completionData.completionNotes}
                                        onChange={(e) => setCompletionData({...completionData, completionNotes: e.target.value})}
                                    />
                                </div>

                                {/* Completion Evidence Upload */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Work Completion Evidence (Optional)</label>
                                    <p className="text-xs text-[#727785] mb-3">Upload before/after photos or videos (JPG, PNG, WEBP, MP4, MOV, WEBM - Max 20 MB)</p>
                                    
                                    {completionEvidence.length > 0 && (
                                        <div className="mb-3 space-y-2">
                                            {completionEvidence.map((evidence, idx) => (
                                                <div key={idx} className="bg-[#f1f4fa] rounded p-2 text-xs flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">
                                                        {evidence.resourceType === 'video' ? 'videocam' : 'image'}
                                                    </span>
                                                    <span className="flex-1 truncate">{evidence.originalName}</span>
                                                    <span className="text-[#727785]">✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="block bg-[#f7f9ff] border-2 border-dashed border-[#c1c6d6] rounded-lg p-3 text-center cursor-pointer hover:border-[#005bbf] transition-colors">
                                        <span className="material-symbols-outlined text-3xl text-[#005bbf] block mb-1">cloud_upload</span>
                                        <span className="text-sm text-[#414754] font-semibold">{uploadingEvidence ? 'Uploading...' : 'Upload Evidence'}</span>
                                        <input type="file" accept="image/*,video/*" onChange={handleUploadCompletionEvidence} className="hidden" disabled={uploadingEvidence} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" className="px-4 py-2 rounded-lg border border-[#c1c6d6] text-[#414754] font-bold hover:bg-[#f1f4fa]" onClick={() => setShowConfirmComplete(false)}>Cancel</button>
                                <button type="button" className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50" onClick={handleCompleteWork} disabled={actionLoading || !completionData.completionNotes.trim()}>{actionLoading ? 'Saving...' : 'Confirm Completion'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unable to Complete Modal */}
            {showConfirmUnableComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-[#181c20] mb-4">Unable to Complete Task</h3>
                        <p className="text-sm text-[#414754] mb-6">Please explain why this task cannot be completed.</p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Reason (Required)</label>
                                <select
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={unableData.reason}
                                    onChange={(e) => setUnableData({...unableData, reason: e.target.value})}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Part unavailable">Required part is unavailable</option>
                                    <option value="Access denied">Property access unavailable</option>
                                    <option value="More serious">Problem is more serious than expected</option>
                                    <option value="More time">More time required</option>
                                    <option value="Additional work">Additional work/materials needed</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                                <textarea
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none resize-none"
                                    placeholder="Provide more details about the issue..."
                                    rows="3"
                                    value={unableData.notes}
                                    onChange={(e) => setUnableData({...unableData, notes: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" className="px-4 py-2 rounded-lg border border-[#c1c6d6] text-[#414754] font-bold hover:bg-[#f1f4fa]" onClick={() => setShowConfirmUnableComplete(false)}>Cancel</button>
                            <button type="button" className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50" onClick={handleUnableToComplete} disabled={actionLoading || !unableData.reason}>{actionLoading ? 'Saving...' : 'Submit'}</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-40 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="flex items-center gap-4">
                        <button className="text-[#005bbf] hover:bg-[#f1f4fa] p-2 rounded-lg" onClick={() => navigate('/technician/work-orders')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span className="font-bold text-lg text-[#005bbf]">Task Details</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <span className="material-symbols-outlined flex-shrink-0">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <span className="material-symbols-outlined flex-shrink-0">check_circle</span>
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Work Order Header */}
                        <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                            <div className="bg-[#1a73e8] p-6 text-white">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Work Order</p>
                                        <h1 className="text-3xl font-bold">#WO-{workOrder._id}</h1>
                                    </div>
                                    <span className={`px-4 py-2 rounded-lg text-xs font-bold ${getStatusBadge(workOrder.status)}`}>
                                        {formatStatus(workOrder.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Maintenance Request Info */}
                            {maintenance && (
                                <div className="p-6 border-b border-[#c1c6d6]">
                                    <h3 className="text-lg font-bold text-[#181c20] mb-4">Maintenance Request</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Category</p>
                                            <p className="text-sm font-bold capitalize">{maintenance.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Priority</p>
                                            <p className="text-sm font-bold capitalize">{maintenance.priority}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Description</p>
                                            <p className="text-sm text-[#181c20]">{maintenance.description}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Requested Date</p>
                                            <p className="text-sm">{maintenance.createdAt ? new Date(maintenance.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Scheduled Date</p>
                                            <p className="text-sm">{workOrder.scheduledDate ? new Date(workOrder.scheduledDate).toLocaleDateString() : 'No deadline set'}</p>
                                        </div>
                                        {workOrder.notes && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Special Instructions</p>
                                                <p className="text-sm text-[#181c20]">{workOrder.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Property Address Info */}
                            {property && (
                                <div className="p-6 border-b border-[#c1c6d6]">
                                    <h3 className="text-lg font-bold text-[#181c20] mb-4">Property Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Property Name</p>
                                            <p className="text-sm font-bold">{property.name}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Address</p>
                                            <p className="text-sm">{property.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">City</p>
                                            <p className="text-sm">{property.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">State</p>
                                            <p className="text-sm">{property.state}</p>
                                        </div>
                                        {property.postalCode && (
                                            <div>
                                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Postal Code</p>
                                                <p className="text-sm">{property.postalCode}</p>
                                            </div>
                                        )}
                                        {property.description && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Landmark/Notes</p>
                                                <p className="text-sm">{property.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="p-6 bg-[#f7f9ff]">
                                <h3 className="text-lg font-bold text-[#181c20] mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {landlord && (
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Landlord/Manager</p>
                                            <p className="text-sm font-bold">{landlord.full_name}</p>
                                            {landlord.phone_number && <p className="text-sm text-[#414754]">{landlord.phone_number}</p>}
                                        </div>
                                    )}
                                    {tenant && (
                                        <div>
                                            <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Tenant</p>
                                            <p className="text-sm font-bold">{tenant.full_name}</p>
                                            {tenant.phone_number && <p className="text-sm text-[#414754]">{tenant.phone_number}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Completion Notes */}
                        {isCompleted && workOrder.completionNotes && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-green-900 mb-3">✓ Task Completed</h3>
                                    <p className="text-sm text-[#414754] mb-3">Completed on: {workOrder.completedAt ? new Date(workOrder.completedAt).toLocaleDateString() : 'N/A'}</p>
                                    <div>
                                        <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Completion Note</p>
                                        <p className="text-sm text-[#181c20]">{workOrder.completionNotes}</p>
                                    </div>
                                </div>

                                {/* Completion Evidence */}
                                {workOrder.completionEvidence && workOrder.completionEvidence.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-[#414754] uppercase mb-3">Work Completion Evidence</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {workOrder.completionEvidence.map((evidence, idx) => (
                                                <a
                                                    key={idx}
                                                    href={evidence.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-300 hover:bg-green-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg text-green-700">
                                                        {evidence.resourceType === 'video' ? 'videocam' : 'image'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-[#005bbf] truncate">{evidence.originalName}</p>
                                                        <p className="text-xs text-[#727785]">{new Date(evidence.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-lg text-[#005bbf]">open_in_new</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!isCompleted && (
                            <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-6">
                                <h3 className="text-lg font-bold text-[#181c20] mb-4">Task Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    {isAssigned && (
                                        <button
                                            className="px-6 py-3 rounded-lg border-2 border-[#005bbf] text-[#005bbf] font-bold hover:bg-[#005bbf]/5 transition-colors disabled:opacity-50"
                                            onClick={handleStartWork}
                                            disabled={actionLoading}>
                                            {actionLoading ? 'Starting...' : '▶ Start Work'}
                                        </button>
                                    )}
                                    <button
                                        className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                        onClick={() => setShowConfirmComplete(true)}
                                        disabled={actionLoading || isAssigned}>
                                        ✓ Mark as Completed
                                    </button>
                                    <button
                                        className="px-6 py-3 rounded-lg border-2 border-red-600 text-red-600 font-bold hover:bg-red-600/5 transition-colors disabled:opacity-50"
                                        onClick={() => setShowConfirmUnableComplete(true)}
                                        disabled={actionLoading || isAssigned}>
                                        ✗ Unable to Complete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdateWorkOrder;