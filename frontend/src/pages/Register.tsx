import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${config.apiUrl}/auth/register`, { email, password, name });
            login(response.data.token, response.data.user);
            navigate('/roadmap'); // New users go to roadmap to see welcome page
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 sm:p-6">
            <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 text-left bg-[#0A0A0A] border border-white/10 shadow-lg rounded-xl">
                <h3 className="text-3xl sm:text-4xl font-bold text-center text-white mb-6 sm:mb-8">Sign Up</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block font-medium text-slate-300 mb-2 text-sm sm:text-base" htmlFor="name">Full Name</label>
                            <input type="text" placeholder="John Doe"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base text-slate-200 placeholder-slate-500"
                                value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block font-medium text-slate-300 mb-2 text-sm sm:text-base" htmlFor="email">Email</label>
                            <input type="email" placeholder="your@email.com"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base text-slate-200 placeholder-slate-500"
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block font-medium text-slate-300 mb-2 text-sm sm:text-base">Password</label>
                            <input type="password" placeholder="••••••••"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base text-slate-200 placeholder-slate-500"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-red-400 text-xs sm:text-sm font-medium bg-red-950/20 border border-red-500/20 p-2.5 sm:p-3 rounded-lg break-words">{error}</p>}
                        <div className="pt-2 sm:pt-4">
                            <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 mt-2 text-white font-medium bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all text-base sm:text-lg border border-indigo-500/50">Create Account</button>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-sm sm:text-base">Already have an account? <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link></p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
