import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  Plus, 
  Play,
  Calendar, 
  Clock, 
  LogOut, 
  ArrowRight, 
  History,
  Zap,
  Settings,
  ShieldAlert,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { ProfileModal } from '../components/Profile/ProfileModal';

interface PastSession {
  id: string;
  roomId: string;
  language: string;
  problemName?: string;
  summary?: string;
  score?: number;
  violationCount?: number;
  guest?: { name: string; avatarUrl?: string };
  host?: { name: string; avatarUrl?: string };
  startedAt: string;
  endedAt?: string;
}

export const HostDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [joinCode, setJoinCode] = useState<string>('');
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/sessions')
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        setSessions(data.sessions || []);
      })
      .catch((err) => console.error('Failed to load sessions', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRoom = () => {
    const randomId = 'room-' + Math.random().toString(36).substring(2, 8);
    navigate(`/room/${randomId}`);
  };

  const handleJoinExistingRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/room/${joinCode.trim()}`);
    }
  };

  const copyInviteLink = (roomId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopiedRoom(roomId);
    setTimeout(() => setCopiedRoom(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Profile Edit Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#0d121f]/90 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CodeRoom
            </span>
          </a>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold">
            <Briefcase className="w-3 h-3" />
            <span>INTERVIEWER HOST PORTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateRoom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Interview Room</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          {/* Top Right User Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
            title="Edit Profile & Photo"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.name || 'Host').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                {user?.name || 'Interviewer'}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono leading-none">
                Host / Interviewer
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors ml-1" />
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
        {/* Host Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#0d121f] to-[#0d121f] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interviewer Management Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-indigo-400">{user?.name || 'Interviewer'}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Conduct technical mock interviews, collaborate with co-interviewers in real-time, view live candidate video streams, and monitor anti-cheating proctoring alerts.
            </p>
          </div>

          {/* Quick Room Actions Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 z-10 w-full sm:w-80">
            <button
              onClick={handleCreateRoom}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch New Interview Room</span>
            </button>

            {/* Join Room as Co-Host */}
            <form onSubmit={handleJoinExistingRoom} className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter Room Code (e.g. room-abc)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Conducted Sessions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Conducted Interview Sessions & Proctoring Logs</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">{sessions.length} records</span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500 gap-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No interview sessions recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create an interview room, share the invite link with candidate and co-interviewers, and start proctored live coding.
              </p>
              <button
                onClick={handleCreateRoom}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md transition-all hover:bg-indigo-500 cursor-pointer"
              >
                Create First Interview Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 rounded-2xl glass-panel hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {s.problemName || 'Technical Coding Interview'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[10px] font-mono text-cyan-300 uppercase">
                        {s.language}
                      </span>
                      {s.score && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
                          {s.score}/100
                        </span>
                      )}
                      {(s.violationCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span>{s.violationCount} Proctor Alerts</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {s.summary || 'Real-time collaborative session with Monaco editor and video sync.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      {s.guest?.name && (
                        <div className="text-cyan-300 font-semibold">
                          Candidate: {s.guest.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>Room: {s.roomId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyInviteLink(s.roomId)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                      title="Copy Room Link"
                    >
                      {copiedRoom === s.roomId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => navigate(`/replay/${s.id}`)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Review Replay</span>
                    </button>

                    <button
                      onClick={() => navigate(`/room/${s.roomId}`)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Enter Room</span>
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
