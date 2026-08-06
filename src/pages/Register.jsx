import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        role: 'tenant',
        password: '',
        confirm_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordHint, setPasswordHint] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.name === 'password') {
            if (e.target.value.length > 0 && e.target.value.length < 8) {
                setPasswordHint('weak');
            } else if (e.target.value.length >= 8) {
                setPasswordHint('strong');
            } else {
                setPasswordHint('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match!');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters!');
            return;
        }

        setLoading(true);

        try {
            await API.post('/auth/register', {
                full_name: formData.full_name,
                email: formData.email,
                phone_number: formData.phone_number,
                role: formData.role,
                password: formData.password
            });

            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f7f9ff] min-h-screen flex flex-col items-center">

            {/* Top Navigation */}
            <header className="bg-white border-b border-[#c1c6d6] fixed top-0 w-full z-50">
                <div className="flex justify-between items-center px-6 py-4 max-w-[1280px] mx-auto h-16">
                    <div className="text-xl font-bold text-[#005bbf]">PropMaintain</div>
                    <div className="flex items-center gap-4">
                        <Link className="text-[#005bbf] font-bold px-4 py-2 hover:opacity-80" to="/login">Login</Link>
                        <button className="bg-[#1a73e8] text-white font-bold px-6 py-2 rounded-lg hover:opacity-90">
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Section */}
            <main className="flex-grow w-full flex items-center justify-center pt-24 pb-16 px-4">
                <div className="w-full max-w-[1100px] bg-white flex flex-col md:flex-row shadow-lg rounded-xl overflow-hidden border border-[#c1c6d6]">

                    {/* Side Panel */}
                    <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#005bbf] to-[#1a73e8] flex-col justify-end p-10">
                        <h2 className="text-white text-3xl font-bold mb-4">
                            Simplify Your Property Management
                        </h2>
                        <p className="text-white/90 text-base">
                            Join thousands of facility managers and tenants optimizing infrastructure across Nigeria.
                        </p>
                    </div>

                    {/* Registration Form */}
                    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-[#181c20] mb-2">Create Your Account</h1>
                                <p className="text-[#414754]">Access Nigeria's leading facility management tool.</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">person</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none"
                                            name="full_name"
                                            placeholder="John Oladele"
                                            required
                                            type="text"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">mail</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none"
                                            name="email"
                                            placeholder="name@example.com"
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone Number */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">call</span>
                                            <input
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none"
                                                name="phone_number"
                                                placeholder="+234..."
                                                required
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                            Role
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">groups</span>
                                            <select
                                                className="w-full pl-10 pr-8 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none appearance-none"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}>
                                                <option value="tenant">Tenant</option>
                                                <option value="landlord">Landlord</option>
                                                <option value="technician">Technician</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#727785] pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">lock</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none"
                                            name="password"
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {passwordHint === 'weak' && (
                                        <p className="text-xs text-red-500 px-1">Password is too short!</p>
                                    )}
                                    {passwordHint === 'strong' && (
                                        <p className="text-xs text-green-600 px-1">Password is strong!</p>
                                    )}
                                    {passwordHint === '' && (
                                        <p className="text-xs text-[#727785] px-1">Password must be at least 8 characters</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]">shield</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] focus:ring-1 focus:ring-[#005bbf] outline-none"
                                            name="confirm_password"
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-2 px-1">
                                    <input className="mt-1 rounded text-[#005bbf]" id="terms" required type="checkbox"/>
                                    <label className="text-sm text-[#414754]" htmlFor="terms">
                                        I agree to the{' '}
                                        <a className="text-[#005bbf] font-semibold hover:underline" href="#">Terms of Service</a>
                                        {' '}and{' '}
                                        <a className="text-[#005bbf] font-semibold hover:underline" href="#">Privacy Policy</a>.
                                    </label>
                                </div>

                                {/* Register Button */}
                                <button
                                    className="w-full bg-[#005bbf] py-4 rounded-lg text-white font-bold text-lg hover:bg-[#004493] transition-all active:scale-[0.98] disabled:opacity-50"
                                    disabled={loading}
                                    type="submit">
                                    {loading ? 'Creating account...' : 'Register'}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-sm text-[#414754]">
                                        Already have an account?{' '}
                                        <Link className="text-[#005bbf] font-bold hover:underline" to="/login">
                                            Login
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-[#f1f4fa] border-t border-[#c1c6d6]">
                <div className="flex justify-between items-center px-6 py-6 max-w-[1280px] mx-auto">
                    <span className="font-bold text-[#181c20]">PropMaintain</span>
                    <p className="text-xs text-[#414754]">© 2024 PropMaintain. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Register;