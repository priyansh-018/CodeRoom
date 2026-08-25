import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Award, 
  Terminal,
  Bot
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import type { SupportedLanguage } from '../types';
import { apiFetch } from '../services/api';

interface ReplayEvent {
  id: string;
  type: 'DELTA' | 'RUN' | 'AI_FEEDBACK' | 'CHAT' | 'CURSOR';
  payload: any;
  timestamp: string;
}

interface SessionData {
  id: string;
  roomId: string;
  language: string;
  problemName?: string;
  summary?: string;
  score?: number;
  startedAt: string;
  endedAt?: string;
  events: ReplayEvent[];
}

export const ReplayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [code, setCode] = useState<string>('');

  const playbackTimerRef = useRef<any>(null);

  useEffect(() => {
    apiFetch(`/api/sessions/${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session);
          if (data.session.events && data.session.events.length > 0) {
            setCode(data.session.events[0].payload.fullCode || '// Initializing session replay...');
          }
        }
      })
      .catch((err) => console.error('Failed to load replay', err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Step updater
  const updateToStep = (targetStep: number) => {
    if (!session || !session.events || session.events.length === 0) return;
    const clamped = Math.max(0, Math.min(targetStep, session.events.length - 1));
    setCurrentStep(clamped);

    const event = session.events[clamped];
    if (event && event.payload && event.payload.fullCode) {
      setCode(event.payload.fullCode);
    }
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (!session || !session.events || prev >= session.events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const event = session.events[next];
          if (event && event.payload && event.payload.fullCode) {
            setCode(event.payload.fullCode);
          }
          return next;
        });
      }, 1500 / speed);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, speed, session]);

  const monacoLanguage =
    session && SUPPORTED_LANGUAGES[session.language as SupportedLanguage]?.monacoLanguage
      ? SUPPORTED_LANGUAGES[session.language as SupportedLanguage].monacoLanguage
      : 'javascript';

  const totalEvents = session?.events?.length || 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0d14] text-slate-100 overflow-hidden select-none">
      {/* Replay Header */}
      <header className="h-14 border-b border-white/10 bg-[#0d121f]/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          <div>
            <span className="text-xs font-bold text-white">
              Session Replay: {session?.problemName || 'Technical Mock Interview'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">
              Room: {session?.roomId} • {session?.language}
            </span>
          </div>
        </div>

        {/* Score & Timing */}
        <div className="flex items-center gap-3">
          {session?.score && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Score: {session.score}/100</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{session?.startedAt ? new Date(session.startedAt).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </header>

      {/* Main Replay Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f19]">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: true },
                lineNumbers: 'on',
                domReadOnly: true,
              }}
            />
          </div>
        </div>

        {/* Right: Event Timeline Sidebar */}
        <div className="w-80 border-l border-white/10 bg-[#0d121f] flex flex-col p-4 space-y-4 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline Events</h3>

          {loading ? (
            <div className="text-xs text-slate-500">Loading timeline...</div>
          ) : totalEvents === 0 ? (
            <div className="text-xs text-slate-500 italic">No delta history recorded for this session.</div>
          ) : (
            <div className="space-y-2">
              {session?.events.map((ev, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div
                    key={ev.id || idx}
                    onClick={() => updateToStep(idx)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-indigo-400">Step {idx + 1}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ev.type === 'DELTA' && <span className="text-[11px] font-medium text-slate-200">Keystroke Delta</span>}
                      {ev.type === 'RUN' && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Terminal className="w-3 h-3" />
                          <span className="text-[11px] font-medium">Code Executed</span>
                        </div>
                      )}
                      {ev.type === 'AI_FEEDBACK' && (
                        <div className="flex items-center gap-1 text-purple-400">
                          <Bot className="w-3 h-3" />
                          <span className="text-[11px] font-medium">AI Feedback Generated</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Scrubber & Playback Controls */}
      <div className="h-16 border-t border-white/10 bg-[#0d121f] px-6 flex items-center justify-between gap-6 z-20">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToStep(0)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-md font-mono font-bold transition-colors cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 shrink-0">
            Step {currentStep + 1} / {Math.max(1, totalEvents)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalEvents - 1)}
            value={currentStep}
            onChange={(e) => updateToStep(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
