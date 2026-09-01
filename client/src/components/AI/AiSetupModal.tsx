import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Code2, 
  Layers,
  Globe,
  Container,
  Database,
  Cpu,
  Check
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

export interface DomainTrack {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ReactNode;
  defaultLang: SupportedLanguage;
  allowedLangs: SupportedLanguage[];
  badge: string;
  topics: string[];
}

export const ASSESSMENT_TRACKS: DomainTrack[] = [
  {
    id: 'dsa',
    name: 'DSA & Algorithms',
    shortDesc: 'LeetCode, Data Structures, Algorithmic Optimization & Problem Solving',
    icon: <Cpu className="w-4 h-4 text-[#72F000]" />,
    defaultLang: 'javascript',
    allowedLangs: [
      'javascript',
      'typescript',
      'python',
      'cpp',
      'c',
      'java',
      'csharp',
      'go',
      'rust',
      'kotlin',
      'swift',
      'ruby',
      'scala',
      'haskell',
      'dart'
    ],
    badge: '4,000+ Problems',
    topics: [
      '🎲 Random / Any DSA Topic',
      'Arrays & Hashing',
      'Two Pointers',
      'Sliding Window',
      'Stack & Queues',
      'Binary Search',
      'Linked Lists',
      'Trees & Graphs',
      'Dynamic Programming',
      'Bit Manipulation',
      'Greedy Algorithms'
    ]
  },
  {
    id: 'webdev',
    name: 'Web Development',
    shortDesc: 'HTML5, CSS3, React, Node.js, Next.js, Django, Laravel, Spring Boot & REST APIs',
    icon: <Globe className="w-4 h-4 text-[#72F000]" />,
    defaultLang: 'html',
    allowedLangs: [
      'html',
      'css',
      'typescript',
      'javascript',
      'python',
      'php',
      'ruby',
      'go',
      'csharp',
      'java',
      'rust',
      'dart',
      'elixir',
      'sql'
    ],
    badge: 'Full-Stack & Frontend',
    topics: [
      '🎲 Random Web Challenge',
      'HTML5 Semantic Markup & Accessibility',
      'CSS3 Flexbox, Grid & Responsive Layouts',
      'JavaScript ES6+ & Async Programming',
      'TypeScript Interfaces & Generics',
      'React Hooks, State & Component Architecture',
      'Node.js, Express & RESTful APIs',
      'Web Performance & Optimizations'
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Docker',
    shortDesc: 'Dockerfiles, Compose, Kubernetes, Linux Scripting & CI/CD Pipelines',
    icon: <Container className="w-4 h-4 text-[#72F000]" />,
    defaultLang: 'bash',
    allowedLangs: [
      'bash',
      'python',
      'go',
      'ruby',
      'rust',
      'javascript',
      'typescript'
    ],
    badge: 'Cloud & Containers',
    topics: [
      '🎲 Random DevOps Challenge',
      'Dockerfile Optimization & Multi-Stage Builds',
      'Docker Compose & Multi-Service Networking',
      'Kubernetes Deployments, Pods & Services',
      'Linux Shell Scripting & Automation',
      'CI/CD GitHub Actions & GitLab Pipelines',
      'Nginx Reverse Proxy & Load Balancing',
      'Infrastructure as Code (Terraform / Ansible)'
    ]
  },
  {
    id: 'database',
    name: 'Database & SQL',
    shortDesc: 'Complex SQL Queries, Schema Modeling, Window Functions & Optimization',
    icon: <Database className="w-4 h-4 text-[#72F000]" />,
    defaultLang: 'sql',
    allowedLangs: [
      'sql',
      'postgresql',
      'mysql',
      'sqlite',
      'python',
      'typescript',
      'javascript',
      'go',
      'java',
      'csharp'
    ],
    badge: 'Relational & NoSQL',
    topics: [
      '🎲 Random SQL Challenge',
      'Complex Joins & Aggregations',
      'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
      'Subqueries & Common Table Expressions (CTEs)',
      'Database Schema Modeling & Normalization',
      'Indexing, Query Optimization & EXPLAIN Plans',
      'Transactions, ACID Properties & Locking',
      'Stored Procedures & Triggers'
    ]
  },
  {
    id: 'system_design',
    name: 'System Design',
    shortDesc: 'Distributed Systems, High-Availability, Caching, Rate Limiters & Sharding',
    icon: <Layers className="w-4 h-4 text-[#72F000]" />,
    defaultLang: 'typescript',
    allowedLangs: [
      'typescript',
      'javascript',
      'python',
      'go',
      'java',
      'cpp',
      'rust',
      'csharp'
    ],
    badge: 'Architecture',
    topics: [
      '🎲 Random System Design Challenge',
      'Distributed Rate Limiter & Token Bucket',
      'URL Shortener & Consistent Hashing Ring',
      'In-Memory Cache (LRU/LFU) with TTL',
      'Distributed Message Queue / Pub-Sub Engine',
      'API Gateway with Circuit Breakers & Auth',
      'Distributed Key-Value Store with Raft Consensus',
      'Web-Scale Notification & Chat System'
    ]
  }
];

export const AiSetupModal: React.FC<AiSetupModalProps> = ({
  isOpen,
  onClose,
  onLaunch
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('dsa');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const currentTrack = ASSESSMENT_TRACKS.find((t) => t.id === selectedTrackId) || ASSESSMENT_TRACKS[0];
  const [selectedTopic, setSelectedTopic] = useState<string>(currentTrack.topics[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentTrack.defaultLang);

  if (!isOpen) return null;

  const handleTrackChange = (track: DomainTrack) => {
    setSelectedTrackId(track.id);
    setSelectedTopic(track.topics[0]);
    setSelectedLanguage(track.defaultLang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch({
      language: selectedLanguage,
      difficulty: selectedDifficulty,
      topic: selectedTopic
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0E0E0E] text-white border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/15 border border-[#72F000]/30 text-[#72F000] text-xs font-mono font-bold">
            <Bot className="w-3.5 h-3.5 text-[#72F000]" />
            <span>SOLO AI MOCK INTERVIEW</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Configure Your Technical Interview
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Choose your technical assessment domain (DSA, Web Development, DevOps, SQL, or System Design) and personalize your challenge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Assessment Domain Tracks */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#72F000]" />
                <span>Assessment Track / Domain</span>
              </span>
              <span className="text-[10px] text-[#72F000] font-mono font-bold">Select 1 Track</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ASSESSMENT_TRACKS.map((track) => {
                const isSelected = selectedTrackId === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleTrackChange(track)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#72F000] bg-[#181818] ring-1 ring-[#72F000] shadow-md'
                        : 'border-white/5 bg-[#141414] hover:bg-[#1C1C1C] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-[#72F000] text-black' : 'bg-white/5 text-neutral-300'}`}>
                          {track.icon}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                            <span>{track.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono font-semibold">{track.badge}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#72F000] flex items-center justify-center text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {track.shortDesc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sub-Topic Selection (Dynamic based on selected Track) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#72F000]" />
              <span>Sub-Topic & Specialization Area</span>
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white focus:outline-none focus:border-[#72F000] cursor-pointer font-medium transition-colors"
            >
              {currentTrack.topics.map((t) => (
                <option key={t} value={t} className="bg-[#161616] text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Difficulty Level & Programming Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#72F000]" />
                <span>Programming Language</span>
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white focus:outline-none focus:border-[#72F000] cursor-pointer font-medium transition-colors"
              >
                {currentTrack.allowedLangs.map((langId) => {
                  const lang = SUPPORTED_LANGUAGES[langId];
                  if (!lang) return null;
                  return (
                    <option key={lang.id} value={lang.id} className="bg-[#161616] text-white">
                      {lang.icon} {lang.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Difficulty Tier */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#72F000]" />
                <span>Difficulty Tier</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#72F000] text-black border-[#72F000] shadow-sm font-black'
                          : 'border-white/5 bg-[#161616] text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {diff === 'Easy' ? '🟢 Easy' : diff === 'Medium' ? '🟡 Med' : '🔴 Hard'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Strict Anti-Cheat Notice */}
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Strict Anti-Cheat Proctoring Enabled</span>
            </div>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              Full-screen mode is required. Clicking external windows, opening AI sidepanels, or switching tabs will <strong>instantly terminate</strong> the assessment with a score of 0.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 font-extrabold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-lg shadow-[#72F000]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer tracking-tight"
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
