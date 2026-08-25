import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/Auth/AuthModal';
import { ProfileModal } from '../components/Profile/ProfileModal';
import type { UserRole } from '../types';
import { 
  Code2, 
  Sparkles, 
  ArrowRight, 
  Terminal,
  LayoutDashboard,
  Settings,
  Briefcase,
  GraduationCap,
  Video,
  ShieldAlert,
  Bot,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('CANDIDATE');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const openAuth = (mode: 'login' | 'register', role: UserRole) => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Ambient background glows */}
      <div className="glow-ambient w-[600px] h-[600px] bg-indigo-600 top-[-200px] left-[-100px]" />
      <div className="glow-ambient w-[500px] h-[500px] bg-cyan-600 top-[20%] right-[-150px]" />
      <div className="glow-ambient w-[600px] h-[600px] bg-purple-600 bottom-[-200px] left-[30%]" />

      {/* Navigation Bar */}
      <nav className="relative z-20 max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CodeRoom
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Live Mock Interview Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard ({user?.role === 'HOST' ? 'Interviewer' : 'Candidate'})</span>
              </button>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
                title="View & Edit Profile / Photo"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.name || 'Dev').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors hidden sm:inline">
                  {user?.name}
                </span>
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth('login', 'CANDIDATE')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => openAuth('register', 'HOST')}
                className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/30 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                Interviewer Portal
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-12">
        {/* Hero Title & Pill */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner text-xs font-mono text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Dual Portals: Interviewers & Candidates with Live Video & Proctoring</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Real-Time Mock Interviews with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Live Video & Anti-Cheat Proctoring
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Collaborative Monaco code editor, sub-50ms delta sync, sandboxed code execution, WebRTC video/audio streaming, and instant tab-switch proctoring alerts.
          </p>
        </div>

        {/* 2 Portal Cards: Host (Interviewer) vs Candidate (Student) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
          {/* 1. Host / Interviewer Portal Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#111625] to-[#0d121f] border border-indigo-500/30 hover:border-indigo-500/60 transition-all shadow-2xl space-y-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                  FOR COMPANIES & HOSTS
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Interviewer Portal
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Designed for hiring managers, technical interviewers, and team leads conducting live coding sessions.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Create Interview Rooms with custom code & tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Interviewer live collaborative rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live Candidate Video & Audio via WebRTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold text-white">Live Tab-Switch Anti-Cheating Alerts</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4">
              <button
                onClick={() => openAuth('register', 'HOST')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign Up as Interviewer</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openAuth('login', 'HOST')}
                className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Already registered? <span className="text-indigo-400 font-semibold underline">Interviewer Sign In</span>
              </button>
            </div>
          </div>

          {/* 2. Candidate / Student Portal Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0e1726] to-[#0d121f] border border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-2xl space-y-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                  FOR STUDENTS & CANDIDATES
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Candidate Portal
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  For students, job seekers, and engineers preparing for technical interviews and giving live interviews.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Join Live Interview Rooms using Room Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-on-1 Solo AI Interview Practice (Claude AI)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live Video & Audio communication with Host</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Comprehensive Big-O Evaluation & Scorecards</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4">
              <button
                onClick={() => openAuth('register', 'CANDIDATE')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign Up as Candidate</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openAuth('login', 'CANDIDATE')}
                className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Already registered? <span className="text-cyan-400 font-semibold underline">Candidate Sign In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">WebRTC Video</span>
              <span className="text-[10px] text-slate-400">P2P low-latency streams</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Anti-Cheat Alert</span>
              <span className="text-[10px] text-slate-400">Live tab-switch detection</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">AI Interviewer</span>
              <span className="text-[10px] text-slate-400">Claude algorithmic analysis</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Judge0 Sandbox</span>
              <span className="text-[10px] text-slate-400">Multi-language execution</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
