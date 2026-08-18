import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import API from '../utils/axios';
import { triggerDataRefresh } from '../utils/dataRefresh';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await API.get('/api/auth/profile');
            const userProfile = response.data.profile || {};
            setProfile(userProfile);
            setFormData({
                full_name: userProfile.full_name || '',
                email: userProfile.email || '',
                phone_number: userProfile.phone_number || ''
            });
            if (refreshUser) {
                refreshUser({
                    ...user,
                    full_name: userProfile.full_name,
                    email: userProfile.email,
                    phone_number: userProfile.phone_number,
                    role: userProfile.role,
                    isEmailVerified: userProfile.isEmailVerified
                }, localStorage.getItem('token'));
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
            setError(err.response?.data?.message || 'Unable to load your profile.');
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await API.put('/api/auth/profile', {
                full_name: formData.full_name,
                phone_number: formData.phone_number
            });

            const updatedProfile = response.data.profile || {};
            setProfile((prev) => ({ ...prev, ...updatedProfile }));
            setSuccess('Profile updated successfully!');
            if (refreshUser) {
                refreshUser({
                    ...user,
                    full_name: updatedProfile.full_name || user?.full_name,
                    phone_number: updatedProfile.phone_number || user?.phone_number,
                    email: updatedProfile.email || user?.email,
                    role: updatedProfile.role || user?.role,
                    isEmailVerified: updatedProfile.isEmailVerified ?? user?.isEmailVerified
                }, localStorage.getItem('token'));
            }
            // Trigger appropriate refresh based on user role
            if (user?.role) {
                triggerDataRefresh(user.role);
            }
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.message || 'Unable to update your profile.');
        } finally {
            setSaving(false);
        }
    };

    const getSidebarPath = () => {
        if (user?.role === 'tenant') return '/tenant/dashboard';
        if (user?.role === 'landlord') return '/landlord/dashboard';
        if (user?.role === 'technician') return '/technician/dashboard';
        return '/login';
    };

    return (
        <div className="min-h-screen bg-[#f7f9ff] p-6">
            <div className="max-w-5xl mx-auto">
                <button
                    className="flex items-center gap-2 text-[#005bbf] font-semibold mb-6 hover:underline"
                    onClick={() => navigate(getSidebarPath())}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Dashboard
                </button>

                {loading ? (
                    <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-12 text-center text-[#414754]">
                        Loading profile...
                    </div>
                ) : error && !profile ? (
                    <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-12 text-center text-red-600">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-6">
                        <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                            <div className="bg-[#005bbf] p-6 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#005bbf] font-bold text-2xl">
                                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h2 className="text-white text-xl font-bold">{profile?.full_name || 'Not provided'}</h2>
                                    <p className="text-white/80 text-sm capitalize">{profile?.role || 'user'}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 text-sm text-[#414754]">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[#727785] mb-1">Email</p>
                                    <p>{profile?.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[#727785] mb-1">Phone</p>
                                    <p>{profile?.phone_number || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[#727785] mb-1">Role</p>
                                    <p className="capitalize">{profile?.role || 'Tenant'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[#727785] mb-1">Email Verification</p>
                                    <p>{profile?.isEmailVerified ? 'Verified' : 'Not verified'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[#727785] mb-1">Member Since</p>
                                    <p>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-6">
                            <h3 className="text-xl font-bold text-[#181c20] mb-6">Tenant Profile</h3>

                            {error && (
                                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                            )}
                            {success && (
                                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Full Name</label>
                                    <input
                                        className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                        name="full_name"
                                        type="text"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Email Address</label>
                                    <input
                                        className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm bg-[#f1f4fa] outline-none"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                    />
                                    <p className="text-xs text-[#727785] mt-1">Email is read-only.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Phone Number</label>
                                    <input
                                        className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                        name="phone_number"
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Role</label>
                                    <input
                                        className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm bg-[#f1f4fa] outline-none capitalize"
                                        type="text"
                                        value={profile?.role || 'Tenant'}
                                        disabled
                                    />
                                    <p className="text-xs text-[#727785] mt-1">Role cannot be edited.</p>
                                </div>

                                <div className="rounded-xl bg-[#f7f9ff] border border-[#c1c6d6] p-4 space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wide text-[#414754]">Resident Information</h4>
                                    {Array.isArray(profile?.properties) && profile.properties.length > 0 ? (
                                        <div className="space-y-6">
                                            {profile.properties.map((property, index) => (
                                                <div key={property.id || index} className="border-t border-[#c1c6d6] pt-4 first:border-t-0 first:pt-0 space-y-3 text-sm">
                                                    {/* Property Details */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Property Name</p>
                                                            <p className="text-[#414754]">{property.name || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Property Type</p>
                                                            <p className="text-[#414754] capitalize">{property.propertyType || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Address</p>
                                                            <p className="text-[#414754]">{property.address || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Location</p>
                                                            <p className="text-[#414754]">{property.city || 'Not provided'}{property.state ? `, ${property.state}` : ''}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Property Code</p>
                                                            <p className="text-[#414754] font-mono">{property.propertyCode || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Bedrooms / Bathrooms</p>
                                                            <p className="text-[#414754]">{property.bedrooms || 0} bed / {property.bathrooms || 0} bath</p>
                                                        </div>
                                                    </div>

                                                    {/* Residency & Landlord Info */}
                                                    <div className="border-t border-[#c1c6d6] pt-3 mt-3 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Approval Date</p>
                                                            <p className="text-[#414754]">{property.approvedAt ? new Date(property.approvedAt).toLocaleDateString() : 'Not available'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Status</p>
                                                            <p className="text-[#414754] capitalize">{property.residenceStatus || 'Unknown'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Landlord</p>
                                                            <p className="text-[#414754]">{property.landlordName || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#727785] uppercase mb-1">Landlord Email</p>
                                                            <p className="text-[#414754] text-xs break-all">{property.landlordEmail || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[#414754]">No approved properties assigned yet.</p>
                                    )}
                                </div>

                                <div className="pt-2 flex gap-4">
                                    <button
                                        className="flex-1 bg-[#005bbf] text-white py-3 rounded-lg font-bold hover:bg-[#004493] transition-all disabled:opacity-60"
                                        type="submit"
                                        disabled={saving || loading}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        className="flex-1 border border-[#c1c6d6] text-[#414754] py-3 rounded-lg font-bold hover:bg-[#f1f4fa] transition-all"
                                        type="button"
                                        onClick={() => navigate(getSidebarPath())}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;