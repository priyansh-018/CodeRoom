import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  Users, 
  RotateCcw, 
  Settings2
} from 'lucide-react';
import type { SupportedLanguage, UserPresence } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface NavbarProps {
  roomId: string;
  roomTitle?: string;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onRunCode: () => void;
  isRunning: boolean;
  onToggleAiPanel: () => void;
  isAiPanelOpen: boolean;
  onResetCode: () => void;
  users: UserPresence[];
  currentUserSocketId?: string;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomId,
  language,
  onLanguageChange,
  onRunCode,
  isRunning,
  onToggleAiPanel,
  isAiPanelOpen,
  onResetCode,
  users,
  currentUserSocketId,
  isConnected
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0d121f]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
              CodeRoom
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider">LIVE SYNC</span>
          </div>
        </a>

        <div className="h-5 w-px bg-white/10" />

        {/* Room ID Badge & Copy */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <span className="text-slate-500">room:</span>
            <span className="text-indigo-300 font-medium">{roomId}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
            title="Copy Invite Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Invite'}</span>
          </button>
        </div>

        {/* Connection Status Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Center: Language Selector */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="appearance-none bg-slate-900/90 border border-white/15 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-inner hover:bg-slate-800 transition-colors"
          >
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <Settings2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <button
          onClick={onResetCode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          title="Reset to starter template"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Presence & Actions */}
      <div className="flex items-center gap-3">
        {/* Presence Avatars */}
        <div className="flex items-center -space-x-2">
          {users.map((u) => {
            const isMe = u.socketId === currentUserSocketId;
            return (
              <div
                key={u.socketId}
                className="relative group cursor-pointer"
                title={`${u.name} ${isMe ? '(You)' : ''}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md ring-2 ring-[#0d121f]"
                  style={{ backgroundColor: u.color }}
                >
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                {/* Active Tooltip */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-xl border border-white/10 whitespace-nowrap z-50">
                  <span>{u.name} {isMe ? '(You)' : ''}</span>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Solo</span>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* AI Interviewer Toggle */}
        <button
          onClick={onToggleAiPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isAiPanelOpen
              ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/20'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Interviewer</span>
        </button>

        {/* Run Code Button */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
        </button>
      </div>
    </header>
  );
};
