import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import windowsBg from '../assets/windows-bg.jpg'; // Make sure you have this image in src/assets

const API_URL = 'http://localhost:5001/api/auth/';

const SignUp = () => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [formData, setFormData] = useState({ name: '', dob: '', email: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(API_URL + 'signup', formData);
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Sign up failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(API_URL + 'verify-signup', { email: formData.email, otp });
            localStorage.setItem('userToken', data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative flex flex-col m-6 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                <div className="flex flex-col justify-center p-8 md:p-12">
                    <span className="mb-3 text-4xl font-bold">Sign up</span>
                    <span className="font-light text-gray-400 mb-4">
                      {step === 'details' ? 'Sign up to enjoy the feature of HD' : `Enter the OTP sent to ${formData.email}`}
                    </span>

                    {error && <div className="w-full bg-red-100 text-red-600 p-2 rounded-lg text-sm mb-4">{error}</div>}
                    
                    {step === 'details' ? (
                        <form onSubmit={handleDetailsSubmit}>
                            <div className="py-2">
                                <span className="mb-2 text-md">Your Name</span>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="py-2">
                                <span className="mb-2 text-md">Date of birth</span>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="py-2">
                                <span className="mb-2 text-md">Email</span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" />
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
                                {loading ? 'Verifying...' : 'Sign Up'}
                            </button>
                        </form>
                    )}
                     <div className="text-center text-gray-400">
                        Already have an account?
                        <Link to="/signin" className="font-bold text-blue-600"> Sign in</Link>
                    </div>
                </div>
                <div className="relative">
                    <img src={windowsBg} alt="background" className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover" />
                </div>
            </div>
        </div>
    );
};
export default SignUp;