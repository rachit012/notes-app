import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import windowsBg from '../assets/windows-bg.jpg'; 

// Use the environment variable for the base API URL
const BASE_URL = process.env.REACT_APP_API_URL;
const API_URL = `${BASE_URL}/api/auth/`;

const SignIn = () => {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(API_URL + 'send-login-otp', { email });
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(API_URL + 'verify-login', { email, otp });
            localStorage.setItem('userToken', data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = () => {
        // Construct the Google login URL dynamically
        window.location.href = `${BASE_URL}/api/auth/google`;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative flex flex-col m-6 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                 <div className="flex flex-col justify-center p-8 md:p-12">
                    <span className="mb-3 text-4xl font-bold">Sign in</span>
                    <span className="font-light text-gray-400 mb-4">
                      {step === 'email' ? 'Please login to continue to your account' : `Enter the OTP sent to ${email}`}
                    </span>
                    
                    {error && <div className="w-full bg-red-100 text-red-600 p-2 rounded-lg text-sm mb-4">{error}</div>}

                     {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit}>
                            <div className="py-2">
                                <span className="mb-2 text-md">Email</span>
                                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-lg mt-4 mb-6 hover:bg-blue-700 disabled:bg-blue-300">
                                {loading ? 'Sending...' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit}>
                           <div className="py-2">
                                <span className="mb-2 text-md">OTP</span>
                                <input type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-lg mt-4 mb-6 hover:bg-blue-700 disabled:bg-blue-300">
                               {loading ? 'Verifying...' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    <button onClick={handleGoogleLogin} className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-gray-100">
                        Sign in with Google
                    </button>

                    <div className="text-center text-gray-400">
                        Need an account?
                        <Link to="/signup" className="font-bold text-blue-600"> Create one</Link>
                    </div>
                </div>
                <div className="relative">
                    <img src={windowsBg} alt="background" className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"/>
                </div>
            </div>
        </div>
    );
};
export default SignIn;