import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../utils/axios';
import StatusMessage from '../components/StatusMessage';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Your verification link is invalid or has expired.');
                return;
            }

            try {
                const response = await API.get(`/api/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully. You can now sign in.');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Your verification link is invalid or has expired.');
            }
        };

        verify();
    }, [searchParams]);

    const handleResend = async () => {
        const email = window.prompt('Enter your email address to resend the verification email');
        if (!email) return;

        setLoading(true);
        try {
            await API.post('/api/auth/resend-verification', { email });
            setStatus('success');
            setMessage('Verification email sent. Please check your inbox.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Unable to resend verification email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#c1c6d6] bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-[#181c20]">Email Verification</h1>
                <p className="mt-2 text-sm text-[#414754]">Confirm your email address to activate your account.</p>

                <div className="mt-6">
                    {status === 'loading' ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Verifying your email...</div>
                    ) : (
                        <StatusMessage type={status === 'success' ? 'success' : 'error'} message={message} />
                    )}
                </div>

                {status === 'success' ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/login" className="rounded-lg bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004493]">
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="rounded-lg border border-[#c1c6d6] px-4 py-2 text-sm font-semibold text-[#414754] hover:bg-[#f1f4fa] disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Request a new verification email'}
                        </button>
                        <Link to="/login" className="rounded-lg bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004493]">
                            Go to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
