import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const SubmitRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        property_id: '',
        category: '',
        priority: '',
        description: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [propertiesLoading, setPropertiesLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const fetchProperties = useCallback(async () => {
        try {
            const response = await API.get('/api/properties/tenant/access');
            setProperties(response.data.properties || []);
            if (response.data.properties && response.data.properties.length > 0) {
                setFormData(prev => ({ ...prev, property_id: response.data.properties[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setPropertiesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    useDataRefresh(() => {
        fetchProperties();
    }, 'tenant');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid image format. Please upload JPG, PNG, or WEBP.');
                return;
            }
            
            // Validate file size (20 MB)
            if (file.size > 20 * 1024 * 1024) {
                setError('Image size must not exceed 20 MB.');
                return;
            }
            
            setSelectedImage(file);
            setError('');
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Submit maintenance request first
            const response = await API.post('/api/maintenance', formData);
            const requestId = response.data.request._id;

            // Upload image if selected
            if (selectedImage) {
                setUploadingImage(true);
                const imageFormData = new FormData();
                imageFormData.append('image', selectedImage);
                
                try {
                    await API.post(`/api/maintenance/${requestId}/upload-image`, imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (uploadErr) {
                    console.error('Image upload error:', uploadErr);
                    // Don't fail the whole request if image upload fails
                }
                setUploadingImage(false);
            }

            setShowSuccess(true);
            setFormData({ property_id: properties[0]?._id || '', category: '', priority: '', description: '' });
            setSelectedImage(null);
            setImagePreview(null);
            triggerDataRefresh('tenant');
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) setError('You must be logged in to submit a request.');
            else if (status === 403) setError('You are not authorized to perform this action.');
            else if (status === 404) setError(err.response?.data?.message || 'Resource not found');
            else if (status === 500) setError('Server error. Please try again later.');
            else setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    if (propertiesLoading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TenantSidebar />
                <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-[#005bbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#414754]">Loading your properties...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
                <TenantSidebar />
                <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                    <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                        <div className="font-bold text-lg text-[#005bbf]">Submit Maintenance Request</div>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                        <div className="bg-white rounded-xl border border-[#c1c6d6] p-8 max-w-md text-center">
                            <p className="text-[#414754] mb-4">You do not have access to any properties yet.</p>
                            <button
                                onClick={() => navigate('/tenant/dashboard')}
                                className="bg-[#005bbf] text-white px-4 py-2 rounded-lg font-bold">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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
                    <div className="max-w-2xl mx-auto">

                        {/* Error Messages */}
                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                                <span className="material-symbols-outlined flex-shrink-0 mt-0.5">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Messages */}
                        {showSuccess && (
                            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                                <span className="material-symbols-outlined flex-shrink-0 mt-0.5">check_circle</span>
                                <div>
                                    <p className="font-bold">Request Submitted Successfully!</p>
                                    <p className="text-sm">Your maintenance request has been logged. Please check your email for updates.</p>
                                </div>
                            </div>
                        )}

                        {/* Main Form Card */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold text-[#181c20] mb-2">Submit New Request</h2>
                            <p className="text-sm text-[#414754] mb-6">Tell us what needs to be fixed and we'll connect you with a professional.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Property Selection */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Select Property</label>
                                    <div className="relative">
                                        <select
                                            name="property_id"
                                            value={formData.property_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg px-4 py-3 text-base appearance-none focus:border-[#005bbf] outline-none cursor-pointer text-[#181c20]">
                                            {properties.map(prop => (
                                                <option key={prop._id} value={prop._id}>{prop.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg px-4 py-3 text-base appearance-none focus:border-[#005bbf] outline-none cursor-pointer text-[#181c20]">
                                            <option value="">Select category...</option>
                                            <option value="plumbing">Plumbing</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="carpentry">Carpentry</option>
                                            <option value="painting">Painting</option>
                                            <option value="general">General Maintenance</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Priority</label>
                                    <div className="relative">
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg px-4 py-3 text-base appearance-none focus:border-[#005bbf] outline-none cursor-pointer text-[#181c20]">
                                            <option value="">Select priority...</option>
                                            <option value="emergency">Urgent (1-24 hours)</option>
                                            <option value="high">High (3-5 days)</option>
                                            <option value="normal">Normal (1-2 weeks)</option>
                                            <option value="low">Low (No deadline)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#414754]">expand_more</span>
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

                                {/* Image Upload Section */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">Attach Photo (Optional)</label>
                                    <p className="text-xs text-[#727785]">Upload a photo of the issue to help technicians understand the problem better (JPG, PNG, WEBP - Max 20 MB)</p>
                                    
                                    {imagePreview && (
                                        <div className="relative w-full bg-[#f1f4fa] rounded-lg overflow-hidden">
                                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                                <label className="px-4 py-2 bg-[#005bbf] text-white rounded font-semibold cursor-pointer flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                    Change
                                                </label>
                                                <button type="button" onClick={removeImage} className="px-4 py-2 bg-red-600 text-white rounded font-semibold flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!imagePreview && (
                                        <label className="block bg-[#f7f9ff] border-2 border-dashed border-[#c1c6d6] rounded-lg p-6 text-center cursor-pointer hover:border-[#005bbf] hover:bg-[#005bbf]/5 transition-all">
                                            <span className="material-symbols-outlined text-4xl text-[#005bbf] block mb-2">image</span>
                                            <span className="text-sm text-[#414754] font-semibold">Click to upload or drag and drop</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}
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
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-[#005bbf] text-white font-bold rounded-lg hover:bg-[#004a96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {uploadingImage ? 'Uploading...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">send</span>
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Info Cards */}
                        <div className="mt-6 space-y-3">
                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#f1f4fa] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#005bbf]">schedule</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#181c20]">Average Response Time</p>
                                    <p className="text-xs text-[#414754]">Technician assigned within 2-4 hours</p>
                                </div>
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
