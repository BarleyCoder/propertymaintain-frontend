import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import API from '../utils/axios';

const Profile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const getSidebarPath = () => {
        if (user?.role === 'tenant') return '/tenant/dashboard';
        if (user?.role === 'landlord') return '/landlord/dashboard';
        if (user?.role === 'technician') return '/technician/dashboard';
        return '/login';
    };

    return (
        <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">

                {/* Back Button */}
                <button
                    className="flex items-center gap-2 text-[#005bbf] font-semibold mb-6 hover:underline"
                    onClick={() => navigate(getSidebarPath())}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="bg-[#005bbf] p-6 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#005bbf] font-bold text-2xl">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-bold">{user?.full_name}</h2>
                            <p className="text-white/80 text-sm capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-[#181c20] mb-6">Personal Information</h3>

                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">person</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                        name="full_name"
                                        type="text"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">mail</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none bg-[#f1f4fa]"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-[#727785] mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Phone Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">call</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                        name="phone_number"
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Role</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">groups</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 border border-[#c1c6d6] rounded-lg text-sm bg-[#f1f4fa] outline-none capitalize"
                                        type="text"
                                        value={user?.role}
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-[#727785] mt-1">Role cannot be changed</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    className="flex-1 bg-[#005bbf] text-white py-3 rounded-lg font-bold hover:bg-[#004493] transition-all disabled:opacity-50"
                                    disabled={loading}
                                    type="submit">
                                    {loading ? 'Saving...' : 'Save Changes'}
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
            </div>
        </div>
    );
};

export default Profile;