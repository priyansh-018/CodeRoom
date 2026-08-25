export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'java' 
  | 'cpp' 
  | 'c'
  | 'csharp' 
  | 'go' 
  | 'rust'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'scala'
  | 'r'
  | 'perl'
  | 'haskell'
  | 'lua'
  | 'dart'
  | 'elixir'
  | 'clojure'
  | 'bash'
  | 'sql';

export type UserRole = 'HOST' | 'CANDIDATE';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  monacoLanguage: string;
  judge0Id: number;
  icon: string;
  defaultCode: string;
}

export interface UserPresence {
  socketId: string;
  userId?: string;
  name: string;
  role?: UserRole;
  avatarUrl?: string;
  color: string;
  cursor?: {
    lineNumber: number;
    column: number;
  };
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  isTyping?: boolean;
}

export interface MonacoDelta {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
  rangeLength?: number;
  rangeOffset?: number;
}

export interface CodeDeltaEvent {
  roomId: string;
  changes: MonacoDelta[];
  fullCode: string;
  version: number;
  senderSocketId: string;
}

export interface RoomState {
  roomId: string;
  title: string;
  language: SupportedLanguage;
  code: string;
  version: number;
  users: UserPresence[];
  createdAt: string;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
}

export interface AIQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Partial<Record<SupportedLanguage, string>>;
}

export interface AIFeedback {
  correctness: string;
  timeComplexity: string;
  spaceComplexity: string;
  hints: string[];
  codeReview: string;
  score?: number;
}

export interface ProctorAlert {
  id: string;
  roomId: string;
  candidateName: string;
  candidateId?: string;
  eventType: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT' | 'DEVTOOLS_ATTEMPT';
  timestamp: string;
  violationCount: number;
  message: string;
}
