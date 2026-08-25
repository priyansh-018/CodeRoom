import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Code2, 
  Layers
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';
import type { SupportedLanguage } from '../../types';

interface AiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (config: {
    language: SupportedLanguage;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
  }) => void;
}

const TOPICS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Dynamic Programming',
  'SQL'
];

export const AiSetupModal: React.FC<AiSetupModalProps> = ({
  isOpen,
  onClose,
  onLaunch
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedTopic, setSelectedTopic] = useState<string>('Arrays & Hashing');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch({
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      topic: selectedTopic
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0d121f] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Solo AI Mock Interview Assessment</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Configure Your AI Interview
          </h2>
          <p className="text-xs text-slate-400">
            Select your preferred programming language, difficulty tier, and algorithmic topic. Authentic LeetCode problems will be generated for your assessment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Programming Language</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Difficulty Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Difficulty Tier</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                const isSelected = selectedDifficulty === diff;
                const colors = {
                  Easy: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
                  Medium: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
                  Hard: 'text-rose-400 border-rose-500/40 bg-rose-950/30'
                };
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? colors[diff] + ' shadow-lg'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {diff === 'Easy' ? '🟢 Easy' : diff === 'Medium' ? '🟡 Medium' : '🔴 Hard'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Category / Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>LeetCode Topic Category</span>
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Strict Anti-Cheat Notice */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Strict Anti-Cheat Proctoring Enabled</span>
            </div>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              If you switch tabs or minimize the window during this assessment, the AI interview will <strong>instantly terminate</strong> and submit your current code for immediate evaluation.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Assessment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
