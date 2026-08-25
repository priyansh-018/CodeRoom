import type { LanguageConfig, SupportedLanguage } from '../types';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    monacoLanguage: 'javascript',
    judge0Id: 63,
    icon: '⚡',
    defaultCode: ''
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    monacoLanguage: 'typescript',
    judge0Id: 74,
    icon: '🔷',
    defaultCode: ''
  },
  python: {
    id: 'python',
    name: 'Python 3',
    monacoLanguage: 'python',
    judge0Id: 71,
    icon: '🐍',
    defaultCode: ''
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC)',
    monacoLanguage: 'cpp',
    judge0Id: 54,
    icon: '⚙️',
    defaultCode: ''
  },
  c: {
    id: 'c',
    name: 'C (GCC)',
    monacoLanguage: 'c',
    judge0Id: 50,
    icon: '🔧',
    defaultCode: ''
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK)',
    monacoLanguage: 'java',
    judge0Id: 62,
    icon: '☕',
    defaultCode: ''
  },
  csharp: {
    id: 'csharp',
    name: 'C# (Mono)',
    monacoLanguage: 'csharp',
    judge0Id: 51,
    icon: '🟣',
    defaultCode: ''
  },
  go: {
    id: 'go',
    name: 'Go',
    monacoLanguage: 'go',
    judge0Id: 60,
    icon: '🐹',
    defaultCode: ''
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    monacoLanguage: 'rust',
    judge0Id: 73,
    icon: '🦀',
    defaultCode: ''
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    monacoLanguage: 'ruby',
    judge0Id: 72,
    icon: '💎',
    defaultCode: ''
  },
  php: {
    id: 'php',
    name: 'PHP',
    monacoLanguage: 'php',
    judge0Id: 68,
    icon: '🐘',
    defaultCode: ''
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    monacoLanguage: 'swift',
    judge0Id: 83,
    icon: '🍎',
    defaultCode: ''
  },
  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    monacoLanguage: 'kotlin',
    judge0Id: 78,
    icon: '🟠',
    defaultCode: ''
  },
  scala: {
    id: 'scala',
    name: 'Scala',
    monacoLanguage: 'scala',
    judge0Id: 81,
    icon: '🔴',
    defaultCode: ''
  },
  r: {
    id: 'r',
    name: 'R',
    monacoLanguage: 'r',
    judge0Id: 80,
    icon: '📊',
    defaultCode: ''
  },
  perl: {
    id: 'perl',
    name: 'Perl',
    monacoLanguage: 'perl',
    judge0Id: 85,
    icon: '🐪',
    defaultCode: ''
  },
  haskell: {
    id: 'haskell',
    name: 'Haskell (GHC)',
    monacoLanguage: 'haskell',
    judge0Id: 61,
    icon: 'λ',
    defaultCode: ''
  },
  lua: {
    id: 'lua',
    name: 'Lua',
    monacoLanguage: 'lua',
    judge0Id: 64,
    icon: '🌙',
    defaultCode: ''
  },
  dart: {
    id: 'dart',
    name: 'Dart',
    monacoLanguage: 'dart',
    judge0Id: 90,
    icon: '🎯',
    defaultCode: ''
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    monacoLanguage: 'elixir',
    judge0Id: 57,
    icon: '💧',
    defaultCode: ''
  },
  clojure: {
    id: 'clojure',
    name: 'Clojure',
    monacoLanguage: 'clojure',
    judge0Id: 86,
    icon: '🟢',
    defaultCode: ''
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    monacoLanguage: 'shell',
    judge0Id: 46,
    icon: '🖥️',
    defaultCode: ''
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    monacoLanguage: 'sql',
    judge0Id: 82,
    icon: '🗄️',
    defaultCode: ''
  }
};

export const USER_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}
