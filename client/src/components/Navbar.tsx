import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  Users, 
  RotateCcw, 
  Settings2,
  Square,
  Pencil,
  FileText,
  Database
} from 'lucide-react';
import type { SupportedLanguage, UserPresence, UserRole } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface NavbarProps {
  roomId: string;
  roomTitle?: string;
  onTitleChange?: (newTitle: string) => void;
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
  onShowToast?: (msg: string) => void;
  onOpenProfile?: () => void;
  onEndRoom?: () => void;
  onOpenSqlSchema?: () => void;
  onStopAiInterview?: () => void;
  isAiSession?: boolean;
  userRole?: UserRole;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomId,
  roomTitle = 'Technical Coding Interview',
  onTitleChange,
  language,
  onLanguageChange,
  onRunCode,
  isRunning,
  onToggleAiPanel,
  isAiPanelOpen,
  onResetCode,
  users,
  currentUserSocketId,
  isConnected,
  onShowToast,
  onOpenProfile,
  onEndRoom,
  onOpenSqlSchema,
  onStopAiInterview,
  isAiSession,
  userRole
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(roomTitle);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback', err);
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  };

  const handleCopyCode = async () => {
    await copyToClipboard(roomId);
    setCopiedCode(true);
    onShowToast?.(`📋 Room code "${roomId}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    await copyToClipboard(inviteUrl);
    setCopiedLink(true);
    onShowToast?.(`📋 Invite link copied to clipboard! Share with collaborators.`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editTitleValue.trim();
    if (trimmed && trimmed !== roomTitle && onTitleChange) {
      onTitleChange(trimmed);
      onShowToast?.(`✏️ Room renamed to: "${trimmed}"`);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0d121f]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col hidden xs:flex">
            <span className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
              CodeRoom
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider">LIVE SYNC</span>
          </div>
        </a>

        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* Room Name Banner (Editable for Host, Synchronized for Candidate) */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle && userRole === 'HOST' ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                onBlur={() => handleTitleSubmit()}
                placeholder="Name this interview..."
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-indigo-500 text-xs font-bold text-white focus:outline-none w-44 sm:w-60 shadow-lg"
              />
              <button
                type="submit"
                className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                title="Save room name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => {
                if (userRole === 'HOST') {
                  setEditTitleValue(roomTitle || 'Technical Coding Interview');
                  setIsEditingTitle(true);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-all ${
                userRole === 'HOST'
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-200 cursor-pointer group'
                  : 'bg-white/5 border-white/10 text-slate-200 cursor-default'
              }`}
              title={userRole === 'HOST' ? 'Click to rename interview room' : 'Live Interview Session'}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[210px] font-medium">{roomTitle || 'Technical Coding Interview'}</span>
              {userRole === 'HOST' && (
                <Pencil className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100 ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Room ID Badge & 1-Click Copy */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-xs font-mono text-slate-300 transition-all cursor-pointer group/room"
            title={`Click to copy room code: ${roomId}`}
          >
            <span className="text-slate-500 select-none">room:</span>
            <span className="text-indigo-300 font-semibold select-text group-hover/room:text-indigo-200">{roomId}</span>
            {copiedCode ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500 group-hover/room:text-indigo-300 shrink-0 transition-colors" />
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
            title="Copy Full Invite Link (URL)"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Invite'}</span>
          </button>
        </div>

        {/* Connection Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[11px]">
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

      {/* Right: Presence, AI, Run & Profile Avatar */}
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
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* AI Interviewer Toggle (Candidate Practice only, not for Host) */}
        {userRole !== 'HOST' && (
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
        )}

        {/* SQL Schema & Tables Button (Visible when SQL mode is active) */}
        {language === 'sql' && onOpenSqlSchema && (
          <button
            onClick={onOpenSqlSchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/10 transition-all cursor-pointer"
            title="Manage SQL Database Schema & Mock Tables"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQL Tables</span>
          </button>
        )}

        {/* Run Code Button */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
        </button>

        {/* Stop / Finish Solo AI Interview Button */}
        {isAiSession && onStopAiInterview && (
          <button
            onClick={onStopAiInterview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            title="Stop and Submit AI Assessment for Evaluation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop AI Interview</span>
          </button>
        )}

        {/* End Interview Room Button (HOST ONLY) */}
        {userRole === 'HOST' && onEndRoom && (
          <button
            onClick={onEndRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer"
            title="End Interview & Submit Scorecard"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>End Interview</span>
          </button>
        )}

        {/* Profile Details & Photo Edit Button at Top Right Corner */}
        {onOpenProfile && (
          <>
            <div className="h-5 w-px bg-white/10" />
            <button
              onClick={onOpenProfile}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
              title="View & Edit Profile / Photo"
            >
              <div className="w-7 h-7 rounded-md overflow-hidden bg-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                <Users className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
