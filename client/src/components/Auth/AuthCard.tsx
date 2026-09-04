import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { 
  Lock, 
  Mail, 
  User, 
  X, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  Terminal,
  CheckCircle2,
  Phone,
  BookOpen,
  Award,
  Plus,
  FileText,
  Upload,
  Globe,
  Link2,
  Building2,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onSuccess?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'TypeScript', 'Java', 'C++', 'DSA', 'SQL', 'Docker', 'AWS'];

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'login',
  initialRole = 'CANDIDATE',
  onSuccess,
  isModal = false,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Step in Sign Up: 1 = Basic Info & Role, 2 = Role Details, 3 = OTP Verification
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Step 2: Candidate Fields
  const [qualificationStatus, setQualificationStatus] = useState('Pursuing');
  const [degree, setDegree] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'DSA']);
  const [skillInput, setSkillInput] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Interviewer Fields
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');

  // Step 3: OTP Verification Fields
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const { login, sendSignupOtp, verifyOtpAndRegister } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt calculations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-250, 250], [5, -5]), {
    stiffness: 220,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-250, 250], [-5, 5]), {
    stiffness: 220,
    damping: 24,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (signUpStep === 3 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [signUpStep, otpTimer]);

  // Button ripple click effect
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  };

  // Technical skills management
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || skillInput).trim();
    if (!s) return;
    if (!skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Resume upload handling
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Resume file size must be less than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeUrl(reader.result);
        setResumeFileName(file.name);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation & Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid, legitimate email address');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSignUpStep(2);
  };

  // Step 2 Validation & Request Email OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'CANDIDATE') {
      if (!degree.trim()) {
        setError('Please enter your degree or field of study');
        return;
      }
      if (skills.length === 0) {
        setError('Please add at least one technical skill');
        return;
      }
    } else {
      if (!organization.trim()) {
        setError('Please enter your organization or company name');
        return;
      }
      if (!position.trim()) {
        setError('Please enter your position or job title');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await sendSignupOtp(email.trim().toLowerCase());
      if (res.success) {
        setSignUpStep(3);
        setOtpTimer(60);
        setCanResendOtp(false);
        setSuccessMsg(`Verification code sent to ${email.trim()}`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res.error || 'Failed to dispatch verification email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendSignupOtp(email.trim().toLowerCase());
      if (res.success) {
        setOtpTimer(60);
        setCanResendOtp(false);
        setSuccessMsg('A fresh verification code has been dispatched to your email.');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(res.error || 'Failed to resend verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3 OTP Verification & Account Creation
  const handleVerifyOtpAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        otp: otp.trim(),
        ...(role === 'CANDIDATE' ? {
          qualificationStatus,
          degree: degree.trim(),
          skills,
          resumeUrl,
          resumeFileName,
          github: github.trim(),
          linkedin: linkedin.trim(),
        } : {
          organization: organization.trim(),
          position: position.trim(),
        })
      };

      const res = await verifyOtpAndRegister(payload);
      if (res.success) {
        setSuccessMsg('Email verified! Account created successfully. Launching workspace...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else navigate('/dashboard');
        }, 800);
      } else {
        setError(res.error || 'Verification failed. Please check your OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Welcome back! Launching your workspace...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else navigate('/dashboard');
        }, 700);
      } else {
        setError(res.error || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative z-10 w-full max-w-[500px] mx-auto select-none"
      style={{ perspective: 1200 }}
    >
      {/* 3D Tilt Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#0E0E0E]/95 backdrop-blur-2xl border border-white/10 rounded-[30px] p-6 sm:p-8 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_-10px_rgba(124,252,0,0.18)] font-['Plus_Jakarta_Sans',sans-serif] text-white"
      >
        {/* Neon Corner Accents */}
        <div className="absolute -top-[1px] -left-[1px] w-20 h-20 bg-gradient-to-br from-[#7CFC00]/30 to-transparent rounded-tl-[30px] pointer-events-none blur-sm" />
        <div className="absolute -bottom-[1px] -right-[1px] w-20 h-20 bg-gradient-to-tl from-[#7CFC00]/20 to-transparent rounded-br-[30px] pointer-events-none blur-sm" />

        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Logo Badge */}
        <div className="flex flex-col items-center text-center mb-5">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative mb-3 group cursor-pointer"
          >
            <div className="absolute -inset-1.5 rounded-2xl bg-[#7CFC00] opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
            <div className="relative w-12 h-12 rounded-2xl bg-[#7CFC00] text-black flex items-center justify-center shadow-[0_0_20px_rgba(124,252,0,0.6)]">
              <Terminal className="w-6 h-6 stroke-[2.5]" />
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7CFC00]/10 border border-[#7CFC00]/30 text-[#7CFC00] text-[11px] font-mono font-bold tracking-widest uppercase mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7CFC00] animate-ping" />
            <span>CodeRoom Access</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back' : (
              signUpStep === 1 ? 'Create Your Account' : (signUpStep === 2 ? 'Profile & Experience' : 'Verify Your Email')
            )}
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
            {mode === 'login' && 'Enter your developer credentials to enter the workspace.'}
            {mode === 'register' && signUpStep === 1 && 'Step 1 of 3: Basic details & role selection.'}
            {mode === 'register' && signUpStep === 2 && (role === 'CANDIDATE' ? 'Step 2 of 3: Qualification, skills & resume.' : 'Step 2 of 3: Organization & position.')}
            {mode === 'register' && signUpStep === 3 && `Step 3 of 3: Enter the 6-digit OTP code sent to ${email}.`}
          </p>
        </div>

        {/* Mode Switcher (Sign In vs Sign Up) */}
        {mode === 'login' && (
          <div className="relative grid grid-cols-2 p-1.5 mb-5 rounded-full bg-[#141414] border border-white/10 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="relative z-10 py-2.5 rounded-full transition-colors duration-200 cursor-pointer text-center text-black font-black"
            >
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-full bg-[#7CFC00] shadow-[0_0_20px_rgba(124,252,0,0.55)]"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
              <span className="relative z-10">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setSignUpStep(1);
                setError(null);
              }}
              className="relative z-10 py-2.5 rounded-full transition-colors duration-200 cursor-pointer text-center text-neutral-400 hover:text-white font-bold"
            >
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>
        )}

        {/* Step Indicator when in Sign Up */}
        {mode === 'register' && (
          <div className="flex items-center justify-between px-3 py-2 mb-5 rounded-2xl bg-[#141414] border border-white/5 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                signUpStep === 1 ? 'bg-[#7CFC00] text-black shadow-md shadow-[#7CFC00]/30' : 'bg-white/10 text-neutral-400'
              }`}>1</span>
              <span className={signUpStep === 1 ? 'text-white font-extrabold' : 'text-neutral-500'}>Basic Info</span>
            </div>
            <div className="w-6 h-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                signUpStep === 2 ? 'bg-[#7CFC00] text-black shadow-md shadow-[#7CFC00]/30' : 'bg-white/10 text-neutral-400'
              }`}>2</span>
              <span className={signUpStep === 2 ? 'text-white font-extrabold' : 'text-neutral-500'}>Details</span>
            </div>
            <div className="w-6 h-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-black ${
                signUpStep === 3 ? 'bg-[#7CFC00] text-black shadow-md shadow-[#7CFC00]/30' : 'bg-white/10 text-neutral-400'
              }`}>3</span>
              <span className={signUpStep === 3 ? 'text-white font-extrabold' : 'text-neutral-500'}>OTP</span>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="leading-snug">{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 rounded-2xl bg-[#7CFC00]/15 border border-[#7CFC00]/40 text-[#7CFC00] text-xs font-bold flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#7CFC00] shrink-0" />
              <span className="leading-snug">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── 1. SIGN IN FORM ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all duration-200"
                />
                <Mail className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setError('Contact support at priyansh191882@gmail.com for instant password reset.')}
                  className="text-[11px] text-neutral-400 hover:text-[#7CFC00] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all duration-200"
                />
                <Lock className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              onClick={handleButtonClick}
              animate={{
                boxShadow: [
                  '0 0 16px rgba(124, 252, 0, 0.35), 0 4px 14px rgba(0,0,0,0.5)',
                  '0 0 32px rgba(124, 252, 0, 0.65), 0 6px 20px rgba(124, 252, 0, 0.35)',
                  '0 0 16px rgba(124, 252, 0, 0.35), 0 4px 14px rgba(0,0,0,0.5)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 mt-2 rounded-full bg-[#7CFC00] hover:bg-[#72F000] text-black font-extrabold text-sm tracking-tight flex items-center justify-center gap-2 overflow-hidden cursor-pointer disabled:opacity-50 transition-colors"
            >
              {ripples.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="absolute pointer-events-none rounded-full bg-white/40 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: ripple.x, top: ripple.y, width: 80, height: 80 }}
                />
              ))}

              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In to CodeRoom</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </motion.button>
          </form>
        )}

        {/* ─── 2. SIGN UP: STEP 1 (BASIC DETAILS & ROLE) ─── */}
        {mode === 'register' && signUpStep === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all"
                />
                <User className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all"
                />
                <Mail className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all"
                />
                <Phone className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_20px_rgba(124,252,0,0.22)] transition-all"
                />
                <Lock className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3 pointer-events-none transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Picker */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('CANDIDATE')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    role === 'CANDIDATE'
                      ? 'bg-[#181818] border-[#7CFC00] ring-1 ring-[#7CFC00] shadow-[0_0_15px_rgba(124,252,0,0.2)]'
                      : 'bg-[#141414] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${role === 'CANDIDATE' ? 'bg-[#7CFC00] text-black' : 'bg-white/5 text-neutral-400'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-white">Candidate</span>
                    <span className="text-[10px] text-neutral-400 block">Take Mock Interviews</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('HOST')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    role === 'HOST'
                      ? 'bg-[#181818] border-[#7CFC00] ring-1 ring-[#7CFC00] shadow-[0_0_15px_rgba(124,252,0,0.2)]'
                      : 'bg-[#141414] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${role === 'HOST' ? 'bg-[#7CFC00] text-black' : 'bg-white/5 text-neutral-400'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block text-white">Interviewer</span>
                    <span className="text-[10px] text-neutral-400 block">Host & Evaluate</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Next Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 mt-3 rounded-full bg-[#7CFC00] hover:bg-[#72F000] text-black font-extrabold text-sm tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(124,252,0,0.3)] transition-all"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </form>
        )}

        {/* ─── 3. SIGN UP: STEP 2 (ROLE-SPECIFIC DETAILS) ─── */}
        {mode === 'register' && signUpStep === 2 && (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            {role === 'CANDIDATE' ? (
              <>
                {/* Current Qualification Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Current Qualification Status
                  </label>
                  <div className="relative">
                    <select
                      value={qualificationStatus}
                      onChange={(e) => setQualificationStatus(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#7CFC00] transition-colors cursor-pointer"
                    >
                      <option value="Pursuing Degree / Student">Pursuing Degree / Student</option>
                      <option value="Recent Graduate (0-1 YOE)">Recent Graduate (0-1 YOE)</option>
                      <option value="Working Professional (1-3 YOE)">Working Professional (1-3 YOE)</option>
                      <option value="Senior Engineer (3+ YOE)">Senior Engineer (3+ YOE)</option>
                      <option value="Post-Graduation / Master's / PhD">Post-Graduation / Master's / PhD</option>
                    </select>
                  </div>
                </div>

                {/* Degree / Branch */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Degree & Specialization
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 transition-all"
                    />
                    <BookOpen className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3 pointer-events-none transition-colors" />
                  </div>
                </div>

                {/* Technical Skills Tag Manager with + option */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                      Technical Skills
                    </label>
                    <span className="text-[10px] text-neutral-400">Press Enter or click +</span>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[#141414] border border-white/10 min-h-[46px]">
                    {skills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7CFC00]/15 border border-[#7CFC00]/30 text-[#7CFC00] text-[11px] font-bold"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="hover:text-white p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Add skill..."
                        className="w-full bg-transparent px-2 py-0.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="p-1 rounded-lg bg-[#7CFC00] text-black hover:bg-[#65D600] transition-colors cursor-pointer"
                        title="Add Skill"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Quick skill suggestions */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-neutral-500 font-bold self-center mr-1">Suggestions:</span>
                    {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 5).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 cursor-pointer transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Professional Links */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                      LinkedIn Link
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/..."
                        className="w-full pl-8 pr-2 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] transition-all"
                      />
                      <Link2 className="w-3.5 h-3.5 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                      GitHub Link
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/..."
                        className="w-full pl-8 pr-2 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] transition-all"
                      />
                      <Globe className="w-3.5 h-3.5 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Resume Upload Option */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Upload Resume (PDF / DOC)
                  </label>
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <div 
                    onClick={() => resumeInputRef.current?.click()}
                    className="p-3 rounded-2xl border border-dashed border-white/20 hover:border-[#7CFC00]/60 bg-[#141414] flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-[#7CFC00]/10 text-[#7CFC00] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate">
                          {resumeFileName || 'Select Resume (PDF or DOC)'}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          {resumeFileName ? 'Resume ready for interviewer review' : 'Click to browse file (max 8MB)'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full bg-[#7CFC00] group-hover:bg-[#65D600] text-black text-xs font-extrabold shrink-0"
                    >
                      {resumeFileName ? 'Change' : 'Browse'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* INTERVIEWER STEP 2 (ONLY Organization & Position, no links) */
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Name of Organization / Company
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Google, Stripe, Microsoft, or Startup"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 transition-all"
                    />
                    <Building2 className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Your Position / Role in Company
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Senior Tech Lead / Staff Engineer"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#141414] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 transition-all"
                    />
                    <Award className="w-4 h-4 text-neutral-500 group-focus-within:text-[#7CFC00] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                  </div>
                </div>
              </>
            )}

            {/* Actions: Back & Proceed to OTP */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSignUpStep(1)}
                className="px-4 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 rounded-full bg-[#7CFC00] hover:bg-[#72F000] text-black font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(124,252,0,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}

        {/* ─── 4. SIGN UP: STEP 3 (EMAIL OTP VERIFICATION) ─── */}
        {mode === 'register' && signUpStep === 3 && (
          <form onSubmit={handleVerifyOtpAndFinish} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#7CFC00]/15 border border-[#7CFC00]/30 text-[#7CFC00] flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Enter 6-Digit Code</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Code sent to <span className="text-[#7CFC00] font-bold">{email}</span> from <span className="font-mono text-neutral-300">priyansh191882@gmail.com</span>
                </p>
              </div>
            </div>

            {/* 6-digit OTP Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block text-center">
                Verification OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full py-3.5 text-center text-2xl font-mono font-black tracking-[10px] rounded-2xl bg-[#141414] border border-white/15 text-[#7CFC00] focus:outline-none focus:border-[#7CFC00] focus:ring-2 focus:ring-[#7CFC00]/30 focus:shadow-[0_0_25px_rgba(124,252,0,0.3)] transition-all"
              />
            </div>

            {/* Timer & Resend Button */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-neutral-400">
                {otpTimer > 0 ? (
                  <span>Resend in <strong className="text-[#7CFC00] font-mono">{otpTimer}s</strong></span>
                ) : (
                  <span className="text-amber-400 font-bold">Code expired?</span>
                )}
              </span>

              <button
                type="button"
                disabled={!canResendOtp || loading}
                onClick={handleResendOtp}
                className={`flex items-center gap-1 font-extrabold transition-colors cursor-pointer ${
                  canResendOtp ? 'text-[#7CFC00] hover:underline' : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
            </div>

            {/* Actions: Back & Verify Finish */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSignUpStep(2)}
                className="px-4 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 rounded-full bg-[#7CFC00] hover:bg-[#72F000] text-black font-extrabold text-sm tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(124,252,0,0.35)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Launch Workspace</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}

        {/* Footer Toggle Mode Link */}
        <div className="text-center pt-4 text-xs text-neutral-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setSignUpStep(1);
                  setError(null);
                }}
                className="text-[#7CFC00] font-bold hover:underline cursor-pointer transition-colors"
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
                  setSignUpStep(1);
                  setError(null);
                }}
                className="text-[#7CFC00] font-bold hover:underline cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
