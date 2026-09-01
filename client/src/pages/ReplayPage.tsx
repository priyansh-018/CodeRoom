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
  Bot,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import type { SupportedLanguage } from '../types';
import { apiFetch } from '../services/api';
import { getRecording, type InterviewRecording } from '../services/recordingStore';

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

  // Video Recording Playback State
  const [recording, setRecording] = useState<InterviewRecording | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playbackTimerRef = useRef<any>(null);

  // Load session data from API
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

  // Load video recording from IndexedDB
  useEffect(() => {
    if (!sessionId) return;

    const loadRecording = async () => {
      try {
        const rec = await getRecording(sessionId);
        if (rec && rec.blob && rec.blob.size > 0) {
          setRecording(rec);
          const url = URL.createObjectURL(rec.blob);
          setVideoUrl(url);
          setHasVideo(true);
          console.log(`🎬 Loaded interview recording: ${(rec.blob.size / 1024 / 1024).toFixed(1)} MB`);
        }
      } catch (err) {
        console.warn('No video recording found for this session:', err);
      }
    };

    loadRecording();
  }, [sessionId]);

  const updateToStep = (stepIndex: number) => {
    if (!session || !session.events || session.events.length === 0) return;
    const clamped = Math.max(0, Math.min(stepIndex, session.events.length - 1));
    setCurrentStep(clamped);

    const event = session.events[clamped];
    if (event && event.payload && event.payload.fullCode) {
      setCode(event.payload.fullCode);
    }
  };

  useEffect(() => {
    if (isPlaying && session && session.events && session.events.length > 0) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= session.events.length - 1) {
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

  // Video control handlers
  const toggleVideoPlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(!isVideoMuted);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0A0A] text-white overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Replay Header */}
      <header className="h-14 border-b border-white/10 bg-[#0E0E0E] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          <div>
            <span className="text-xs font-black text-white">
              Session Replay: {session?.problemName || 'Technical Coding Interview'}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono block">
              Room: {session?.roomId} • {session?.language}
            </span>
          </div>
        </div>

        {/* Score & Timing */}
        <div className="flex items-center gap-3">
          {hasVideo && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/15 text-[#72F000] text-xs font-mono font-bold border border-[#72F000]/30">
              <Video className="w-3.5 h-3.5" />
              <span>Video Available</span>
            </div>
          )}

          {session?.score !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000] text-black text-xs font-mono font-black">
              <Award className="w-3.5 h-3.5" />
              <span>Score: {session.score}/100</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{session?.startedAt ? new Date(session.startedAt).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </header>

      {/* Main Replay Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0E0E0E]">
          {/* Video Player Panel (shown above editor when recording exists) */}
          {hasVideo && videoUrl && (
            <div
              className={`relative border-b border-white/10 bg-[#000000] transition-all duration-300 ${
                isVideoExpanded ? 'h-[55%]' : 'h-52'
              }`}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
                controls={false}
                playsInline
                muted={isVideoMuted}
              />

              {/* Video Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-end justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={toggleVideoPlayPause}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
                    title="Play/Pause video"
                  >
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </button>

                  {/* Mute Toggle */}
                  <button
                    onClick={toggleVideoMute}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
                    title={isVideoMuted ? 'Unmute' : 'Mute'}
                  >
                    {isVideoMuted
                      ? <VolumeX className="w-3.5 h-3.5 text-neutral-300" />
                      : <Volume2 className="w-3.5 h-3.5 text-white" />
                    }
                  </button>

                  {/* Duration Badge */}
                  {recording?.durationMs && (
                    <span className="text-[10px] font-mono text-neutral-300 bg-black/40 px-2.5 py-0.5 rounded-full">
                      {formatDuration(recording.durationMs / 1000)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Recording Info */}
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {recording?.mimeType}
                  </span>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
                    title={isVideoExpanded ? 'Collapse video' : 'Expand video'}
                  >
                    {isVideoExpanded
                      ? <Minimize2 className="w-3.5 h-3.5 text-white" />
                      : <Maximize2 className="w-3.5 h-3.5 text-white" />
                    }
                  </button>
                </div>
              </div>

              {/* Recording Label */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Interview Recording</span>
              </div>
            </div>
          )}

          {/* No recording placeholder */}
          {!hasVideo && (
            <div className="h-16 border-b border-white/5 bg-[#121212] flex items-center justify-center gap-2 text-neutral-500">
              <VideoOff className="w-4 h-4" />
              <span className="text-xs font-mono">No video recording available for this session</span>
            </div>
          )}

          {/* Code Editor */}
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
        <div className="w-80 border-l border-white/10 bg-[#0E0E0E] flex flex-col p-4 space-y-4 overflow-y-auto">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">Timeline Events</h3>

          {loading ? (
            <div className="text-xs text-neutral-500 font-bold">Loading timeline...</div>
          ) : totalEvents === 0 ? (
            <div className="text-xs text-neutral-500 italic">No delta history recorded for this session.</div>
          ) : (
            <div className="space-y-2">
              {session?.events.map((ev, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div
                    key={ev.id || idx}
                    onClick={() => updateToStep(idx)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#181818] border-[#72F000] ring-1 ring-[#72F000] text-white shadow-md'
                        : 'bg-[#141414] border-white/5 text-neutral-400 hover:bg-[#1C1C1C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-black text-[#72F000]">Step {idx + 1}</span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ev.type === 'DELTA' && <span className="text-[11px] font-medium text-neutral-200">Keystroke Delta</span>}
                      {ev.type === 'RUN' && (
                        <div className="flex items-center gap-1 text-[#72F000]">
                          <Terminal className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Code Executed</span>
                        </div>
                      )}
                      {ev.type === 'AI_FEEDBACK' && (
                        <div className="flex items-center gap-1 text-[#72F000]">
                          <Bot className="w-3 h-3" />
                          <span className="text-[11px] font-bold">AI Feedback Generated</span>
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
      <div className="h-16 border-t border-white/10 bg-[#0E0E0E] px-6 flex items-center justify-between gap-6 z-20">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToStep(0)}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black flex items-center justify-center shadow-lg shadow-[#72F000]/25 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-full border border-white/5 text-xs">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-0.5 rounded-full font-mono font-black transition-colors cursor-pointer ${
                  speed === s ? 'bg-[#72F000] text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-400 shrink-0">
            Step {currentStep + 1} / {Math.max(1, totalEvents)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalEvents - 1)}
            value={currentStep}
            onChange={(e) => updateToStep(Number(e.target.value))}
            className="flex-1 h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#72F000]"
          />
        </div>
      </div>
    </div>
  );
};
