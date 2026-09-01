import React from 'react';
import { 
  Bot, 
  ShieldAlert, 
  CheckCircle2, 
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
  if (!isOpen) return null;

  const safeFeedback: AIFeedback = feedback || {
    correctness: isDisqualified
      ? 'Assessment terminated due to tab-switch violation. Anti-cheat proctoring recorded a breach.'
      : 'Assessment completed and code evaluated.',
    timeComplexity: 'N/A — Evaluation Complete',
    spaceComplexity: 'N/A — Evaluation Complete',
    score: isDisqualified ? 0 : 70,
    hints: ['Anti-cheat proctoring is active during AI interviews.', 'Switching tabs or windows immediately ends the assessment.'],
    codeReview: isDisqualified
      ? 'Your interview was terminated before the solution could be fully evaluated. The partial code has been scored with a penalty.'
      : 'Solution submitted and evaluated.'
  };

  const score = safeFeedback.score ?? (isDisqualified ? 0 : 70);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-text font-['Plus_Jakarta_Sans',sans-serif]">
      <div className={`w-full max-w-2xl bg-[#0E0E0E] text-white border rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col ${
        isDisqualified ? 'border-rose-500/50' : 'border-white/10'
      }`}>
        {/* Header & Status Banner */}
        <div className="space-y-3 border-b border-white/10 pb-5">
          {isDisqualified ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3">
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/15 border border-[#72F000]/30 text-[#72F000] text-xs font-mono font-bold">
                <Bot className="w-3.5 h-3.5 text-[#72F000]" />
                <span>AI TECHNICAL ASSESSMENT EVALUATION</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <span className="text-xs font-bold text-neutral-400 font-mono block">
                {question?.topic || 'Algorithmic Problem'} • {question?.difficulty || 'Medium'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {question?.title || 'Coding Assessment Challenge'}
              </h2>
            </div>

            {/* Score Badge */}
            <div className={`px-5 py-3 rounded-2xl border text-center flex-shrink-0 ${
              score >= 70 
                ? 'bg-[#72F000] text-black border-[#72F000]' 
                : score >= 40 
                ? 'bg-amber-100 border-amber-300 text-amber-900' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <span className="text-[10px] uppercase font-black tracking-wider block opacity-85">
                AI Score
              </span>
              <span className="text-2xl font-black font-mono">
                {score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Complexity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#72F000]" />
                <span>Time Complexity</span>
              </div>
              <span className="text-sm font-mono font-bold text-white block">
                {safeFeedback.timeComplexity}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#72F000]" />
                <span>Space Complexity</span>
              </div>
              <span className="text-sm font-mono font-bold text-white block">
                {safeFeedback.spaceComplexity}
              </span>
            </div>
          </div>

          {/* Correctness & Review */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#72F000]" />
              <span>Algorithmic Correctness</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-[#161616] p-3.5 rounded-2xl border border-white/5">
              {safeFeedback.correctness}
            </p>
          </div>

          {/* Code Review */}
          {safeFeedback.codeReview && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-[#72F000]" />
                <span>Code Quality Review</span>
              </div>
              <div className="text-xs text-neutral-300 leading-relaxed bg-[#161616] p-3.5 rounded-2xl border border-white/5 font-mono whitespace-pre-line">
                {safeFeedback.codeReview}
              </div>
            </div>
          )}

          {/* Hints & Suggestions */}
          {safeFeedback.hints && safeFeedback.hints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Lightbulb className="w-4 h-4 text-[#72F000]" />
                <span>Optimization Recommendations & Edge Cases</span>
              </div>
              <div className="space-y-2">
                {safeFeedback.hints.map((hint, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#161616] border border-white/5 text-xs text-neutral-300 flex items-start gap-2.5">
                    <span className="font-mono font-bold text-[#72F000]">{idx + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-end">
          <button
            onClick={onReturnDashboard}
            className="px-6 py-3 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-md shadow-[#72F000]/20 transition-all flex items-center gap-2 cursor-pointer tracking-tight"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};