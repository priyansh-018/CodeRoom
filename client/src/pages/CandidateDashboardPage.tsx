import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  Play, 
  Calendar, 
  Clock, 
  LogOut, 
  ArrowRight, 
  History,
  Settings,
  GraduationCap,
  Bot,
  DoorOpen
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { ProfileModal } from '../components/Profile/ProfileModal';
import { AiSetupModal } from '../components/AI/AiSetupModal';
import type { SupportedLanguage } from '../types';

interface PastSession {
  id: string;
  roomId: string;
  language: string;
  code: string;
  score?: number;
  summary?: string;
  problemName?: string;
  violationCount?: number;
  createdAt: string;
  endedAt?: string;
  candidateName?: string;
  interviewerName?: string;
}

export const CandidateDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAiSetupOpen, setIsAiSetupOpen] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');

  useEffect(() => {
    apiFetch('/api/sessions')
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        setSessions(data.sessions || []);
      })
      .catch((err) => console.error('Failed to load candidate sessions', err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  const handleLaunchAi = (config: {
    language: SupportedLanguage;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
  }) => {
    const practiceId = 'ai-mock-' + Math.random().toString(36).substring(2, 8);
    navigate(
      `/room/${practiceId}?isAi=true&difficulty=${config.difficulty}&topic=${encodeURIComponent(config.topic)}&lang=${config.language}`
    );
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Profile Edit Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* AI Assessment Setup Modal */}
      <AiSetupModal
        isOpen={isAiSetupOpen}
        onClose={() => setIsAiSetupOpen(false)}
        onLaunch={handleLaunchAi}
      />

      {/* Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#0d121f]/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CodeRoom
            </span>
          </a>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">
            <GraduationCap className="w-3 h-3" />
            <span>CANDIDATE PORTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiSetupOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Practice with AI</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          {/* Top Right User Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
            title="Edit Profile & Photo"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.name || 'User').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                {user?.name || 'Candidate'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono leading-none">
                Candidate / Student
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-1" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-8 flex-1">
        {/* Candidate Welcome Banner & Join Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome & Info */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-[#0d121f] to-[#0d121f] border border-cyan-500/20 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student / Candidate Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, <span className="text-cyan-400">{user?.name || 'Candidate'}</span>
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ready for your technical interview? Join a live interview room using the code provided by your interviewer, or practice coding problems solo with the AI interviewer assistant.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAiSetupOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Start Solo AI Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Enter Room Card */}
          <div className="p-6 rounded-3xl bg-[#0d121f] border border-white/10 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <DoorOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Join Live Interview Room</h3>
              <p className="text-[11px] text-slate-400">
                Paste the Room ID or invite code given by your interviewer.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. room-9xuxfn"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Practice & Interview History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Past Interview Records & Keystroke Replays</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">{sessions.length} records</span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500 gap-2">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading records...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No interview records yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Join a live room with an interviewer or launch a self-paced AI practice session to test your data structures and algorithms skills.
              </p>
              <button
                onClick={() => setIsAiSetupOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-semibold text-xs shadow-md transition-all hover:bg-cyan-500 cursor-pointer"
              >
                Start AI Practice Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 rounded-2xl glass-panel hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {s.problemName || 'Technical Coding Interview'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[10px] font-mono text-cyan-300 uppercase">
                        {s.language}
                      </span>
                      {s.score !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
                          {s.score}/100
                        </span>
                      )}
                      {(s.violationCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono font-bold">
                          {s.violationCount} Strikes
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {s.summary || 'Real-time collaborative session with Monaco editor.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      {s.interviewerName && (
                        <div className="text-indigo-300 font-semibold">
                          Interviewer: {s.interviewerName}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>Room: {s.roomId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/replay/${s.id}`)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch Replay</span>
                    </button>

                    <button
                      onClick={() => navigate(`/room/${s.roomId}`)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Re-enter Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
