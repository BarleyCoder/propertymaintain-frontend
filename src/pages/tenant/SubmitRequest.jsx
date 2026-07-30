import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import API from '../../utils/axios';

const SubmitRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: '',
        priority: '',
        description: '',
        property_id: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await API.post('/api/maintenance', formData);
            setShowSuccess(true);
            setFormData({ category: '', priority: '', description: '', property_id: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TenantSidebar />

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="font-bold text-lg text-[#005bbf]">Submit Maintenance Request</div>
                    <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Success Toast */}
                    {showSuccess && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                                </div>
                                <h2 className="text-xl font-bold text-[#181c20] mb-2">Request Submitted!</h2>
                                <p className="text-[#414754] mb-6">Your maintenance request has been submitted successfully.</p>
                                <button
                                    className="w-full bg-[#005bbf] text-white py-3 rounded-lg font-bold hover:bg-[#004493]"
                                    onClick={() => navigate('/tenant/my-requests')}>
                                    View My Requests
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Form */}
                        <div className="lg:col-span-8 bg-white rounded-xl border border-[#c1c6d6] overflow-hidden shadow-sm">
                            <div className="p-6 bg-[#f7f9ff] border-b border-[#c1c6d6]">
                                <h1 className="text-xl font-bold text-[#181c20]">Submit Maintenance Ticket</h1>
                                <p className="text-sm text-[#414754]">Please provide detailed information to help our technicians resolve your issue quickly.</p>
                            </div>

                            <form className="p-6 space-y-6" onSubmit={handleSubmit}>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-4 text-base focus:border-[#005bbf] outline-none"
                                                name="category"
                                                required
                                                value={formData.category}
                                                onChange={handleChange}>
                                                <option disabled value="">Select category</option>
                                                <option value="plumbing">Plumbing</option>
                                                <option value="electrical">Electrical</option>
                                                <option value="carpentry">Carpentry</option>
                                                <option value="roofing">Roofing</option>
                                                <option value="painting">Painting</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Priority Level</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-4 text-base focus:border-[#005bbf] outline-none"
                                                name="priority"
                                                required
                                                value={formData.priority}
                                                onChange={handleChange}>
                                                <option disabled value="">Select priority</option>
                                                <option value="low">Low (Routine)</option>
                                                <option value="medium">Medium (Standard)</option>
                                                <option value="high">High (Urgent)</option>
                                                <option value="emergency">Emergency</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Detailed Description</label>
                                    <textarea
                                        className="w-full bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-4 text-base focus:border-[#005bbf] outline-none placeholder:text-[#727785]"
                                        name="description"
                                        placeholder="Describe the issue, when it started, and its exact location..."
                                        required
                                        rows="5"
                                        value={formData.description}
                                        onChange={handleChange}>
                                    </textarea>
                                </div>

                                {/* Property ID */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Property ID</label>
                                    <input
                                        className="w-full bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-4 text-base focus:border-[#005bbf] outline-none placeholder:text-[#727785]"
                                        name="property_id"
                                        placeholder="Enter your property ID (e.g. 1)"
                                        required
                                        type="number"
                                        value={formData.property_id}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-[#727785]">Ask your landlord for your property ID</p>
                                </div>

                                {/* Submit */}
                                <div className="pt-4 border-t border-[#c1c6d6] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#181c20]">Secure Submission</p>
                                            <p className="text-xs text-[#414754]">A Ticket ID will be generated</p>
                                        </div>
                                    </div>
                                    <button
                                        className="bg-[#005bbf] text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-[#004493] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                        disabled={loading}
                                        type="submit">
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tips Card */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-[#4d8efe] text-white p-6 rounded-xl">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">tips_and_updates</span>
                                    Submission Tips
                                </h3>
                                <ul className="space-y-3 text-sm opacity-90">
                                    <li className="flex gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Be as specific as possible about the location.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Mention when the issue started.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Mention if you give permission for entry while away.
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#f1f4fa] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#005bbf]">support_agent</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#181c20]">Need help?</p>
                                    <p className="text-xs text-[#414754]">Contact emergency support at +234 916 625 6254</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubmitRequest;