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
  DoorOpen,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { ProfileModal } from '../components/Profile/ProfileModal';
import { AiSetupModal } from '../components/AI/AiSetupModal';
import { SupportModal } from '../components/Support/SupportModal';
import { LifeBuoy } from 'lucide-react';
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
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'live' | 'ai'>('live');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isCheckingRoom, setIsCheckingRoom] = useState<boolean>(false);

  useEffect(() => {
    apiFetch('/api/sessions')
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        setSessions(data.sessions || []);
      })
      .catch((err) => console.error('Failed to load candidate sessions', err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim();
    if (!cleanCode) return;

    setIsCheckingRoom(true);
    setJoinError(null);

    try {
      const res = await apiFetch(`/api/sessions/check-room/${cleanCode}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.exists) {
          setJoinError(`Room "${cleanCode}" does not exist. Please check your room code with your interviewer.`);
          setIsCheckingRoom(false);
          return;
        }
        if (data.isEnded) {
          setJoinError(`Interview room "${cleanCode}" has already ended.`);
          setIsCheckingRoom(false);
          return;
        }
        navigate(`/room/${cleanCode}`);
      } else {
        setJoinError('Could not verify room status. Please try again.');
      }
    } catch {
      setJoinError('Failed to connect to server.');
    } finally {
      setIsCheckingRoom(false);
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

  const liveSessions = sessions.filter((s) => !s.roomId?.startsWith('ai-mock'));
  const aiSessions = sessions.filter((s) => {
    if (!s.roomId?.startsWith('ai-mock')) return false;
    const isDisqualified = 
      s.score === 0 || 
      (s.summary && s.summary.toLowerCase().includes('disqualified')) ||
      (s.summary && s.summary.toLowerCase().includes('violation')) ||
      (s.summary && s.summary.toLowerCase().includes('terminated'));
    return !isDisqualified;
  });
  const displayedSessions = activeTab === 'live' ? liveSessions : aiSessions;

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#0A0A0A] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Profile Edit Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* AI Assessment Setup Modal */}
      <AiSetupModal
        isOpen={isAiSetupOpen}
        onClose={() => setIsAiSetupOpen(false)}
        onLaunch={handleLaunchAi}
      />

      {/* Help & Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Navbar */}
      <header className="h-18 border-b border-black/5 bg-[#F4F4F0]/90 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-[#0A0A0A]">
            Coderoom
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#72F000] text-[11px] font-mono font-bold">
            <GraduationCap className="w-3 h-3" />
            <span>CANDIDATE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EBEBE6] hover:bg-[#E2E2DC] text-neutral-800 font-bold text-xs transition-all cursor-pointer"
            title="Help & Support"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden sm:inline">Help & Support</span>
          </button>

          <button
            onClick={() => setIsAiSetupOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Practice with AI</span>
          </button>

          <div className="h-5 w-px bg-black/10" />

          {/* Top Right User Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EBEBE6] hover:bg-[#E2E2DC] border border-black/5 transition-all cursor-pointer group"
            title="Edit Profile & Photo"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-black flex items-center justify-center font-bold text-[#72F000] text-[11px]">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.name || 'User').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-black leading-tight">
                {user?.name || 'Candidate'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono leading-none">
                Candidate / Student
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors ml-0.5" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2 rounded-full bg-[#EBEBE6] hover:bg-rose-100 border border-black/5 text-neutral-600 hover:text-rose-600 transition-all cursor-pointer"
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
          {/* Welcome & Info (Matte Black Card) */}
          <div className="md:col-span-2 p-7 sm:p-9 rounded-[28px] bg-[#0E0E0E] text-white shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#72F000]/15 text-[#72F000] text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#72F000]" />
                <span>CANDIDATE WORKSPACE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Welcome back, <span className="text-[#72F000]">{user?.name || 'Candidate'}</span>
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                Ready for your technical interview? Join a live interview room using the code provided by your interviewer, or practice coding problems solo with the AI interviewer.
              </p>
            </div>

            <div>
              <button
                onClick={() => setIsAiSetupOpen(true)}
                className="px-6 py-3 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer tracking-tight"
              >
                <Bot className="w-4 h-4" />
                <span>Start Solo AI Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Enter Room Card (Light Gray Card) */}
          <div className="p-7 rounded-[28px] bg-[#EBEBE6] border border-black/5 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-black text-[#72F000] flex items-center justify-center">
                <DoorOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-black tracking-tight">Join Live Room</h3>
              <p className="text-xs text-neutral-600 leading-normal">
                Paste the Room ID or invite code given by your interviewer.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setJoinError(null);
                }}
                placeholder="e.g. room-9xuxfn"
                className="w-full px-4 py-2.5 rounded-full bg-white border border-black/15 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono shadow-inner"
              />

              {joinError && (
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold leading-snug">
                  {joinError}
                </div>
              )}

              <button
                type="submit"
                disabled={isCheckingRoom}
                className="w-full py-3 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isCheckingRoom ? 'Verifying Room...' : 'Enter Room'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#72F000]" />
              </button>
            </form>
          </div>
        </div>

        {/* Separated Practice & Interview History */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-black" />
              <h2 className="text-xl font-black text-black tracking-tight">
                Past Interview Records
              </h2>
            </div>

            {/* Segmented Tab Controls */}
            <div className="flex items-center p-1 rounded-full bg-[#EBEBE6] border border-black/5 text-xs font-bold">
              <button
                onClick={() => setActiveTab('live')}
                className={`px-5 py-1.5 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>Live Interview Rooms</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#72F000] text-black text-[10px] font-mono font-black">
                  {liveSessions.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-5 py-1.5 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>AI Mock Practice</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#72F000] text-black text-[10px] font-mono font-black">
                  {aiSessions.length}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-neutral-500 gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Loading records...</span>
            </div>
          ) : displayedSessions.length === 0 ? (
            <div className="p-12 text-center rounded-[28px] bg-[#EBEBE6] border border-black/5 space-y-3">
              <Code2 className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-extrabold text-black">
                {activeTab === 'live' ? 'No live interview records yet' : 'No AI mock practice records yet'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {activeTab === 'live'
                  ? 'When you participate in technical interviews with an interviewer, your completed sessions and replays will appear here.'
                  : 'Practice coding problems with Claude AI to test your algorithmic problem solving.'}
              </p>
              {activeTab === 'ai' && (
                <button
                  onClick={() => setIsAiSetupOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-black text-white font-extrabold text-xs shadow-md transition-all hover:bg-neutral-800 cursor-pointer"
                >
                  Start Solo AI Mock Interview
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {displayedSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white border border-black/5 hover:border-black/20 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-extrabold text-black group-hover:text-neutral-700 transition-colors">
                        {s.problemName || (activeTab === 'ai' ? 'LeetCode Challenge' : 'Technical Coding Interview')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EBEBE6] text-[10px] font-mono text-black font-bold uppercase">
                        {s.language}
                      </span>
                      {s.score !== undefined && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          s.score === 0 || (s.summary && s.summary.toLowerCase().includes('disqualified'))
                            ? 'bg-rose-100 text-rose-700'
                            : s.score >= 70
                            ? 'bg-[#72F000] text-black'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          Score: {s.score}/100
                        </span>
                      )}
                      {/* Completed badge */}
                      {(s.score !== undefined && s.score >= 70) || (s.summary && s.summary.toLowerCase().includes('completed')) ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#72F000] text-black text-[10px] font-mono font-black flex items-center gap-1">
                          <span>Completed</span>
                          <span>✓</span>
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-1 max-w-2xl font-medium">
                      {s.summary || 'Completed technical interview session.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Room: {s.roomId}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/replay/${s.id}`)}
                      className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3 h-3 text-[#72F000]" />
                      <span>Replay Session</span>
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