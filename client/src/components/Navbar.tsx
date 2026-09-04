import React, { useState } from 'react';
import { 
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
  onOpenCandidateDossier?: () => void;
  hasCandidateInRoom?: boolean;
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
  userRole,
  onOpenCandidateDossier,
  hasCandidateInRoom
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
    <header className="h-14 border-b border-white/10 bg-[#0E0E0E] text-white px-4 flex items-center justify-between select-none z-30 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left: Brand & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-base font-black tracking-tight text-white group-hover:text-[#72F000] transition-colors">
            Coderoom
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#72F000] text-black font-mono font-black uppercase">
            LIVE
          </span>
        </a>

        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* Room Name Banner */}
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
                className="px-3 py-1 rounded-full bg-[#181818] border border-[#72F000] text-xs font-bold text-white focus:outline-none w-44 sm:w-60 shadow-lg"
              />
              <button
                type="submit"
                className="p-1.5 rounded-full bg-[#72F000] text-black cursor-pointer"
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                userRole === 'HOST'
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white cursor-pointer group'
                  : 'bg-white/5 border-white/5 text-neutral-300 cursor-default'
              }`}
              title={userRole === 'HOST' ? 'Click to rename interview room' : 'Live Interview Session'}
            >
              <FileText className="w-3.5 h-3.5 text-[#72F000] shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[210px]">{roomTitle || 'Technical Coding Interview'}</span>
              {userRole === 'HOST' && (
                <Pencil className="w-3 h-3 text-[#72F000] opacity-70 group-hover:opacity-100 ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Room ID Badge & 1-Click Copy */}
        {!isAiSession ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] hover:bg-[#222222] border border-white/10 hover:border-[#72F000]/50 text-xs font-mono text-neutral-300 transition-all cursor-pointer group/room"
              title={`Click to copy room code: ${roomId}`}
            >
              <span className="text-neutral-500 select-none">room:</span>
              <span className="text-[#72F000] font-bold select-text">{roomId}</span>
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-[#72F000] shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-500 group-hover/room:text-[#72F000] shrink-0 transition-colors" />
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
              title="Copy Full Invite Link (URL)"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#72F000]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/15 border border-[#72F000]/30 text-[#72F000] text-[11px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#72F000] animate-pulse" />
            <span>AI Mock Assessment</span>
          </div>
        )}

        {/* Connection Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#72F000] animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-neutral-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Center: Language Selector */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="appearance-none bg-[#181818] border border-white/10 rounded-full px-4 py-1.5 pr-8 text-xs font-bold text-white focus:outline-none focus:border-[#72F000] cursor-pointer hover:bg-[#202020] transition-colors"
          >
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[#181818] text-white">
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-400">
            <Settings2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <button
          onClick={onResetCode}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Reset to starter template"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Presence, AI, Run & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Presence Avatars */}
        {!isAiSession && (
          <>
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
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black shadow-md ring-2 ring-[#0E0E0E]"
                      style={{ backgroundColor: u.color || '#72F000' }}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-5 w-px bg-white/10" />
          </>
        )}

        {/* AI Interviewer Toggle */}
        {userRole !== 'HOST' && (
          <button
            onClick={onToggleAiPanel}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
              isAiPanelOpen
                ? 'bg-[#72F000] text-black border-[#72F000] shadow-sm'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interviewer</span>
          </button>
        )}

        {/* SQL Schema Button */}
        {language === 'sql' && onOpenSqlSchema && (
          <button
            onClick={onOpenSqlSchema}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#72F000]/15 hover:bg-[#72F000]/25 border border-[#72F000]/40 text-[#72F000] transition-all cursor-pointer"
            title="Manage SQL Database Schema & Mock Tables"
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Tables</span>
          </button>
        )}

        {/* Run Code Button (Electric Neon Green Pill) */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black bg-[#72F000] hover:bg-[#65D600] text-black shadow-md shadow-[#72F000]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer tracking-tight"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
        </button>

        {/* Stop / Finish Solo AI Interview Button */}
        {isAiSession && onStopAiInterview && (
          <button
            onClick={onStopAiInterview}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
            title="Stop and Submit AI Assessment for Evaluation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop AI Interview</span>
          </button>
        )}

        {/* Candidate Resume & Profile Button (HOST ONLY) */}
        {userRole === 'HOST' && onOpenCandidateDossier && (
          <button
            onClick={onOpenCandidateDossier}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#7CFC00]/15 hover:bg-[#7CFC00]/25 border border-[#7CFC00]/40 text-[#7CFC00] shadow-sm transition-all cursor-pointer"
            title="Inspect Candidate Details, Skills & Resume"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Candidate Dossier</span>
            {hasCandidateInRoom && (
              <span className="w-2 h-2 rounded-full bg-[#7CFC00] animate-ping" />
            )}
          </button>
        )}

        {/* End Interview Room Button (HOST ONLY) */}
        {userRole === 'HOST' && onEndRoom && (
          <button
            onClick={onEndRoom}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
            title="End Interview & Submit Scorecard"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>End Interview</span>
          </button>
        )}

        {/* Profile Details Button */}
        {onOpenProfile && (
          <>
            <div className="h-5 w-px bg-white/10" />
            <button
              onClick={onOpenProfile}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
              title="View & Edit Profile / Photo"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#72F000] text-black flex items-center justify-center font-bold text-[11px]">
                <Users className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </>
        )}
      </div>
    </header>
  );
};