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
  },
  html: {
    id: 'html',
    name: 'HTML5',
    monacoLanguage: 'html',
    judge0Id: 0,
    icon: '🌐',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Development Preview</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      text-align: center;
      max-width: 480px;
    }
    h1 { color: #38bdf8; margin-top: 0; }
    p { color: #94a3b8; line-height: 1.6; }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CodeRoom Web Component</h1>
    <p>Build, style, and inspect responsive HTML5 & CSS3 interfaces live.</p>
    <button onclick="alert('Hello from CodeRoom Web Sandbox!')">Test Action</button>
  </div>
</body>
</html>`
  },
  css: {
    id: 'css',
    name: 'CSS3',
    monacoLanguage: 'css',
    judge0Id: 0,
    icon: '🎨',
    defaultCode: `/* Modern Responsive CSS3 Stylesheet */
:root {
  --primary-color: #6366f1;
  --bg-dark: #070a11;
  --text-light: #f8fafc;
  --card-bg: #0d121f;
}

body {
  font-family: system-ui, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-light);
  margin: 0;
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.3);
}`
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
