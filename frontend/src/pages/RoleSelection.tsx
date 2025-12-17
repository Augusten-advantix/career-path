import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Brain,
  GraduationCap,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img src="/colorlogo.png" alt="CareerPath AI" className="w-10 h-10" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                CareerPath AI
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-16">
          <div className="mb-6 inline-block">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 font-semibold text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Choose Your Path
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight px-2">
            Welcome to CareerPath AI
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Are you looking to advance your career or find the perfect talent? Choose your path below to get started.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-2">
          {/* Career Development Card */}
          <div className="group">
            <button
              onClick={() => navigate('/login?type=user')}
              className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 text-left flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Career Development</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 flex-grow">
                Build your personalized career roadmap with AI coaching. Get skill assessments, learning paths, and track your progress.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Brain, text: 'AI Career Coach' },
                  { icon: Target, text: 'Personalized Roadmaps' },
                  { icon: BarChart3, text: 'Progress Tracking' },
                  { icon: Lightbulb, text: 'Learning Resources' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-emerald-300 transition-colors">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-emerald-400 font-semibold">New here? Sign up to get started →</p>
              </div>
            </button>
          </div>

          {/* Recruiter Card */}
          <div className="group">
            <button
              onClick={() => navigate('/login?type=recruiter')}
              className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border-2 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 text-left flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">Recruiter</h2>
              <p className="text-slate-400 text-sm mb-8 flex-grow">
                Find and match perfect candidates using AI. Upload resumes in bulk, get intelligent matching, and detailed analytics.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Zap, text: 'AI-Powered Matching' },
                  { icon: Users, text: 'Batch Upload' },
                  { icon: BarChart3, text: 'Match Analytics' },
                  { icon: TrendingUp, text: 'Candidate Insights' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-purple-300 transition-colors">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-purple-400 font-semibold">New here? Sign up to get started →</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Same Platform, Different Paths</h3>
            <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
              CareerPath AI powers both career development and recruitment on a single, unified platform.
              Whether you're advancing your career or building your dream team, we have the tools you need.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">One Account</p>
                  <p className="text-sm text-slate-400">Same login, different roles</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">AI-Powered</p>
                  <p className="text-sm text-slate-400">Advanced analysis for all</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">Secure & Private</p>
                  <p className="text-sm text-slate-400">Enterprise-grade security</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">Always Improving</p>
                  <p className="text-sm text-slate-400">Regular updates and features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 mt-16 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>&copy; 2025 CareerPath AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;
