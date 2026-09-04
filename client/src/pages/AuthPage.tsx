import { motion } from 'framer-motion';
import { AuthCard } from '../components/Auth/AuthCard';
import { Code2, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Animated floating blurred green particles configuration
const PARTICLES = [
  { id: 1, size: 280, x: ['10%', '25%', '15%'], y: ['15%', '35%', '20%'], duration: 18, delay: 0 },
  { id: 2, size: 340, x: ['75%', '60%', '80%'], y: ['60%', '40%', '65%'], duration: 22, delay: 2 },
  { id: 3, size: 200, x: ['80%', '65%', '85%'], y: ['10%', '25%', '15%'], duration: 16, delay: 1 },
  { id: 4, size: 240, x: ['20%', '35%', '15%'], y: ['70%', '85%', '75%'], duration: 20, delay: 3 },
  { id: 5, size: 160, x: ['50%', '45%', '55%'], y: ['80%', '65%', '75%'], duration: 15, delay: 1.5 },
];

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const roleParam = searchParams.get('role') === 'HOST' ? 'HOST' : 'CANDIDATE';

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#7CFC00]/30 selection:text-[#7CFC00]">
      {/* Background Cyberpunk Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124,252,0,0.18) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* Floating Animated Blurred Neon Green Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              x: p.x,
              y: p.y,
              scale: [1, 1.15, 0.9, 1],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: p.delay,
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              background: 'radial-gradient(circle, rgba(124,252,0,0.22) 0%, rgba(124,252,0,0.06) 45%, transparent 75%)',
              filter: 'blur(50px)',
            }}
          />
        ))}

        {/* Ambient Center Glow Beam */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7CFC00]/5 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#7CFC00] text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(124,252,0,0.4)] group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              CodeRoom <span className="text-[#7CFC00] text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[#7CFC00]/10 border border-[#7CFC00]/30">v2.0</span>
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7CFC00]/40 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <AuthCard initialMode={modeParam} initialRole={roleParam} />
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 border-t border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7CFC00]" />
          <span>End-to-End Encrypted Live Collaborative Coding</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-neutral-400 transition-colors cursor-pointer">Security</span>
          <span className="hover:text-neutral-400 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-neutral-400 transition-colors cursor-pointer flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#7CFC00]" /> Powered by Neon DB & WebSockets
          </span>
        </div>
      </footer>
    </div>
  );
};
