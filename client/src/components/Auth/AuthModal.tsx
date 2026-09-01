import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Lock, Mail, User, X, AlertCircle, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'CANDIDATE'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to log in');
        }
      } else {
        const res = await register(name, email, password, role);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to register');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0E0E0E] text-white border border-white/10 rounded-[28px] p-7 sm:p-8 shadow-2xl relative space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/10 border border-[#72F000]/30 text-[#72F000] text-[11px] font-mono font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CODEROOM AUTH</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-xs text-neutral-400">
            {mode === 'login'
              ? 'Enter your credentials to access your workspaces.'
              : 'Join the next generation real-time coding platform.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#1A1A1A] border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-full transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-[#72F000] text-black shadow-sm font-extrabold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-full transition-all cursor-pointer ${
              mode === 'register' 
                ? 'bg-[#72F000] text-black shadow-sm font-extrabold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Picker (For Registration) */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
              I am joining as:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('HOST')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  role === 'HOST'
                    ? 'bg-[#181818] border-[#72F000] ring-1 ring-[#72F000] text-white shadow-md'
                    : 'bg-[#141414] border-white/5 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${role === 'HOST' ? 'bg-[#72F000] text-black' : 'bg-white/5 text-neutral-300'}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block">Interviewer</span>
                  <span className="text-[10px] text-neutral-400 leading-tight block mt-0.5">
                    Conduct mock interviews
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('CANDIDATE')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  role === 'CANDIDATE'
                    ? 'bg-[#181818] border-[#72F000] ring-1 ring-[#72F000] text-white shadow-md'
                    : 'bg-[#141414] border-white/5 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-xl ${role === 'CANDIDATE' ? 'bg-[#72F000] text-black' : 'bg-white/5 text-neutral-300'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block">Candidate</span>
                  <span className="text-[10px] text-neutral-400 leading-tight block mt-0.5">
                    Join rooms & AI practice
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Turing"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-sm shadow-lg shadow-[#72F000]/20 transition-all disabled:opacity-50 cursor-pointer tracking-tight"
          >
            {loading 
              ? 'Processing...' 
              : mode === 'login' 
              ? 'Sign In' 
              : `Create ${role === 'HOST' ? 'Interviewer' : 'Candidate'} Account`}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-1 text-xs text-neutral-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[#72F000] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#72F000] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
