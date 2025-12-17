import React, { useState } from 'react';

const RecruiterLanding: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'worker' | 'recruiter' | null>(null);
    const [loading, setLoading] = useState(false);

    const getRedirectUrl = (role: 'worker' | 'recruiter') => {
        const workerLoginUrl = import.meta.env.VITE_WORKER_LOGIN_URL || 'http://localhost:5173/login';
        const recruiterLoginUrl = import.meta.env.VITE_RECRUITER_LOGIN_URL || 'http://localhost:5174/login';
        
        return role === 'worker' ? workerLoginUrl : recruiterLoginUrl;
    };

    const handleRoleSelection = (role: 'worker' | 'recruiter') => {
        setSelectedRole(role);
        setLoading(true);
        
        // Small delay for smooth UX
        setTimeout(() => {
            const redirectUrl = getRedirectUrl(role);
            window.location.href = redirectUrl;
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
                                📊
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                CareerPath AI
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
                            <a href="#how-it-works" className="text-slate-300 hover:text-white transition">How It Works</a>
                            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        Navigate Your <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Career Path</span> with AI
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
                        Whether you're looking to advance your career or find the perfect talent, CareerPath AI connects opportunities with expertise through intelligent analysis.
                    </p>

                    {/* Role Selection Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
                        {/* Worker Card */}
                        <div
                            onClick={() => handleRoleSelection('worker')}
                            className={`relative p-8 rounded-2xl border-2 transition-all cursor-pointer group ${
                                selectedRole === 'worker'
                                    ? 'border-purple-400 bg-purple-500/10'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-purple-400 hover:bg-slate-800'
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 rounded-2xl transition"></div>
                            
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl">
                                    📈
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-4">For Job Seekers</h3>
                                
                                <ul className="text-left space-y-3 mb-6 text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">⚡</span>
                                        <span>Upload your resume</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">⚡</span>
                                        <span>Get personalized career roadmap</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">⚡</span>
                                        <span>Discover skill gaps & opportunities</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">⚡</span>
                                        <span>AI-powered recommendations</span>
                                    </li>
                                </ul>

                                <button
                                    disabled={loading && selectedRole === 'worker'}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                                >
                                    Get Started {selectedRole === 'worker' && loading ? '...' : '→'}
                                </button>
                            </div>
                        </div>

                        {/* Recruiter Card */}
                        <div
                            onClick={() => handleRoleSelection('recruiter')}
                            className={`relative p-8 rounded-2xl border-2 transition-all cursor-pointer group ${
                                selectedRole === 'recruiter'
                                    ? 'border-blue-400 bg-blue-500/10'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-blue-400 hover:bg-slate-800'
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 rounded-2xl transition"></div>
                            
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl">
                                    👥
                                </div>
                                
                                <h3 className="text-2xl font-bold mb-4">For Recruiters</h3>
                                
                                <ul className="text-left space-y-3 mb-6 text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span>
                                        <span>Bulk resume upload & parsing</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span>
                                        <span>Define job requirements easily</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span>
                                        <span>AI-powered candidate matching</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span>
                                        <span>Comprehensive talent analytics</span>
                                    </li>
                                </ul>

                                <button
                                    disabled={loading && selectedRole === 'recruiter'}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                                >
                                    Get Started {selectedRole === 'recruiter' && loading ? '...' : '→'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        Powerful Features for Everyone
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '💼',
                                title: 'Smart Analysis',
                                description: 'AI-powered analysis of resumes and job requirements for accurate matching'
                            },
                            {
                                icon: '📈',
                                title: 'Career Roadmap',
                                description: 'Personalized career development plans with actionable insights'
                            },
                            {
                                icon: '⚡',
                                title: 'Real-time Insights',
                                description: 'Instant analysis and feedback on skill gaps and opportunities'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-6 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-slate-500 transition">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-slate-300">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Features</a></li>
                                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Connect</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-8 flex justify-between items-center text-slate-400 text-sm">
                        <p>&copy; 2025 CareerPath AI. All rights reserved.</p>
                        <p>Connecting careers with opportunities</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default RecruiterLanding;
