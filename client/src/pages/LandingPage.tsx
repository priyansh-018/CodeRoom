import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Terminal
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = () => {
    const randomId = 'room-' + Math.random().toString(36).substring(2, 8);
    navigate(`/room/${randomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient background glows */}
      <div className="glow-ambient w-[600px] h-[600px] bg-indigo-600 top-[-200px] left-[-100px]" />
      <div className="glow-ambient w-[500px] h-[500px] bg-cyan-600 top-[20%] right-[-150px]" />
      <div className="glow-ambient w-[600px] h-[600px] bg-purple-600 bottom-[-200px] left-[30%]" />

      {/* Navigation */}
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

        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateRoom}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Start Instant Session
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 flex-1 flex flex-col items-center justify-center text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-Time Collaborative Coding & AI Mock Interviewer</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Practice Technical Interviews with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            Real-Time Live Sync
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          Share a live-synced Monaco editor with keystroke deltas and remote cursor presence. Run code across 8+ languages in sandboxed Judge0 containers with instant Claude AI feedback.
        </p>

        {/* Action Card */}
        <div className="w-full max-w-xl p-2 rounded-2xl glass-panel-elevated mb-16">
          <div className="p-4 sm:p-6 rounded-xl bg-[#0d121f]/90 space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.01]"
            >
              <span>Create New Interview Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Or join room</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleJoinRoom} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. room-abc123)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={!joinRoomId.trim()}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Delta-Based Real-Time Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keystroke-level updates via Monaco Editor deltas. Colored remote cursors, selections, and presence indicators for seamless mock interviews.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Judge0 Sandboxed Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compile and run Python, JavaScript, Java, C++, TypeScript, Go, and Rust in secure isolated containers with execution time and memory metrics.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-purple-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Claude AI Interviewer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate level-appropriate coding questions on demand and receive structured critique, time/space complexity estimates, and hints.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CodeRoom. Built for real-time collaborative mock technical interviews.</p>
      </footer>
    </div>
  );
};
