import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import API from '../utils/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/auth/login', {
                email,
                password,
            });
            const { token, user } = response.data;

            login(user, token);

            // Redirect based on role
            if (user.role === 'tenant') {
                navigate('/tenant/dashboard');
            } else if (user.role === 'landlord') {
                navigate('/landlord/dashboard');
            } else if (user.role === 'technician') {
                navigate('/technician/dashboard');
            } else if (user.role === 'admin') {
                navigate('/landlord/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f7f9ff] min-h-screen flex items-center justify-center">
            <main className="w-full max-w-[1440px] min-h-screen md:min-h-[800px] flex overflow-hidden lg:shadow-2xl lg:rounded-xl bg-white">

                {/* Left Section: Form */}
                <section className="flex-1 flex flex-col justify-center px-8 lg:px-[100px] py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#005bbf] text-4xl">apartment</span>
                            <h1 className="text-2xl font-bold text-[#005bbf]">PropMaintain</h1>
                        </div>
                    </div>

                    <div className="w-full max-w-[420px]">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-[#181c20] mb-2">Welcome Back</h2>
                            <p className="text-[#414754]">Please enter your credentials to access your account.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                    Email Address
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none transition-all"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#414754] uppercase tracking-wide">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg text-sm focus:ring-2 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none transition-all"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414754]"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input className="w-4 h-4 rounded border-[#c1c6d6] text-[#005bbf]" type="checkbox" />
                                    <span className="text-xs font-semibold text-[#414754]">Remember Me</span>
                                </label>
                                <a className="text-xs font-semibold text-[#005bbf] hover:underline" href="#">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                className="w-full bg-[#005bbf] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#004493] transition-all active:scale-[0.98] disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-[#414754]">
                                Don't have an account?{' '}
                                <Link className="text-[#005bbf] font-bold hover:underline" to="/register">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <footer className="mt-auto pt-8">
                        <p className="text-xs text-[#727785]">© 2026 PropMaintain. All rights reserved.</p>
                    </footer>
                </section>

                {/* Right Section */}
                <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#005bbf] to-[#1a73e8] items-center justify-center">
                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                            <p className="text-white font-medium leading-relaxed text-sm">
                                "PropMaintain has completely streamlined our facility management workflow."
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">DG</div>
                                <div>
                                    <p className="text-white text-xs font-semibold">Digitletters</p>
                                    <p className="text-white/70 text-xs">Chief Operations Officer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-white/20" style={{ fontSize: '300px' }}>apartment</span>
                </section>
            </main>
        </div>
    );
};

export default Login;