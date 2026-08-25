import React from 'react';
import { 
  Bot, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Cpu, 
  Lightbulb, 
  FileText, 
  ArrowRight
} from 'lucide-react';
import type { AIFeedback, AIQuestion } from '../../types';

interface AiResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: AIQuestion | null;
  feedback: AIFeedback | null;
  isDisqualified?: boolean;
  disqualificationReason?: string;
  onReturnDashboard: () => void;
}

export const AiResultModal: React.FC<AiResultModalProps> = ({
  isOpen,
  question,
  feedback,
  isDisqualified = false,
  onReturnDashboard
}) => {
  if (!isOpen || !feedback) return null;

  const score = feedback.score ?? (isDisqualified ? 30 : 85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in select-text">
      <div className={`w-full max-w-2xl bg-[#0d121f] border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col ${
        isDisqualified ? 'border-rose-500/50 shadow-rose-500/10' : 'border-purple-500/40 shadow-purple-500/10'
      }`}>
        {/* Header & Status Banner */}
        <div className="space-y-3 border-b border-white/10 pb-5">
          {isDisqualified ? (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-rose-300 block">
                  Assessment Terminated & Disqualified
                </span>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  Anti-cheat proctoring detected a tab-switch or window minimize event. The assessment was stopped and your partial solution evaluated.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Technical Assessment Evaluation</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono block">
                {question?.topic || 'Algorithmic Problem'} • {question?.difficulty || 'Medium'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {question?.title || 'Coding Assessment Challenge'}
              </h2>
            </div>

            {/* Score Badge */}
            <div className={`px-5 py-3 rounded-2xl border text-center flex-shrink-0 ${
              score >= 80 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : score >= 50 
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                AI Assessment Score
              </span>
              <span className="text-2xl font-extrabold font-mono">
                {score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 text-xs">
          {/* Complexity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Complexity</span>
              </div>
              <p className="font-mono text-slate-300 text-[11px]">
                {feedback.timeComplexity}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Space Complexity</span>
              </div>
              <p className="font-mono text-slate-300 text-[11px]">
                {feedback.spaceComplexity}
              </p>
            </div>
          </div>

          {/* Correctness & Logic */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              {score >= 70 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <span>Solution Correctness & Logic Analysis</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {feedback.correctness}
            </p>
          </div>

          {/* Code Review & Recommendations */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <FileText className="w-4 h-4" />
              <span>AI Code Review Feedback</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {feedback.codeReview}
            </p>
          </div>

          {/* Hints & Optimization */}
          {feedback.hints && feedback.hints.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Key Insights & Optimization Hints</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-300 text-[11px]">
                {feedback.hints.map((hint, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <button
            onClick={onReturnDashboard}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
