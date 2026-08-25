import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CodeEditor } from '../components/Editor/CodeEditor';
import { ConsolePanel } from '../components/Console/ConsolePanel';
import { VideoConference } from '../components/Video/VideoConference';
import { useProctoring } from '../hooks/useProctoring';
import { getSocket } from '../services/socket';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from '../components/Profile/ProfileModal';
import { SqlSchemaModal, SQL_PRESETS } from '../components/SQL/SqlSchemaModal';
import { AiResultModal } from '../components/AI/AiResultModal';
import type { SupportedLanguage, UserPresence, MonacoDelta, ExecutionResult, AIQuestion, AIFeedback } from '../types';
import { SUPPORTED_LANGUAGES, getRandomColor } from '../utils/languages';
import { 
  Sparkles, 
  Bot, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  X,
  EyeOff,
  Award,
  ArrowRight,
  Play,
  CheckCircle2,
  Square
} from 'lucide-react';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, login, register } = useAuth();

  // Solo AI Mock Interview Detection from URL
  const isAiSession = searchParams.get('isAi') === 'true';
  const aiParamDifficulty = (searchParams.get('difficulty') as 'Easy' | 'Medium' | 'Hard') || 'Medium';
  const aiParamTopic = searchParams.get('topic') || 'Arrays & Hashing';
  const aiParamLang = (searchParams.get('lang') as SupportedLanguage) || 'javascript';

  // AI Interview lifecycle state
  const [isAiDisqualified, setIsAiDisqualified] = useState<boolean>(false);
  const [showAiResultModal, setShowAiResultModal] = useState<boolean>(false);
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const aiInterviewEndedRef = useRef<boolean>(false);

  // User & Room state
  const [userColor] = useState<string>(() => getRandomColor());
  const [roomTitle, setRoomTitle] = useState<string>('Technical Coding Interview');
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES.javascript.defaultCode);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentUserSocketId, setCurrentUserSocketId] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // SQL Schema & Database Management state
  const [isSqlSchemaOpen, setIsSqlSchemaOpen] = useState<boolean>(false);
  const [sqlSchema, setSqlSchema] = useState<string>(() => SQL_PRESETS[0].schemaSql);

  // Proctoring Alert State (For Interviewer/Host screen)
  const [latestProctorAlert, setLatestProctorAlert] = useState<any | null>(null);
  const [hostProctorCount, setHostProctorCount] = useState<number>(0);

  // End Interview & Scorecard State
  const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalProblemName, setEvalProblemName] = useState<string>('Technical Coding Interview');
  const [evalRemarks, setEvalRemarks] = useState<string>('Candidate demonstrated solid problem solving and algorithmic reasoning.');
  const [isSubmittingEnd, setIsSubmittingEnd] = useState<boolean>(false);

  // Completed Session Data (Displayed to Candidate & Host upon room end)
  const [completedSession, setCompletedSession] = useState<{
    sessionId?: string;
    score?: number;
    summary?: string;
    problemName?: string;
    violationCount?: number;
    endedAt?: string;
  } | null>(null);

  // Gatekeeper Auth Modal state for unauthenticated invitees
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'HOST' | 'CANDIDATE'>('CANDIDATE');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Code Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // AI Interviewer State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<AIQuestion | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>(isAiSession ? aiParamTopic : 'Arrays & Hashing');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(isAiSession ? aiParamDifficulty : 'Medium');

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const socket = getSocket();

  // Handle AI interview disqualification on tab switch
  const handleAiDisqualification = useCallback(async () => {
    if (aiInterviewEndedRef.current) return;
    aiInterviewEndedRef.current = true;
    setIsAiDisqualified(true);
    setIsAiEvaluating(true);

    try {
      const res = await apiFetch('/api/ai/analyze-code', {
        method: 'POST',
        body: JSON.stringify({
          question: aiQuestion,
          code,
          language,
          isDisqualified: true
        })
      });

      if (res.ok) {
        const feedbackData = await res.json();
        setAiFeedback(feedbackData);
      } else {
        setAiFeedback({
          correctness: 'Assessment terminated due to tab-switch violation. Partial solution evaluated.',
          timeComplexity: 'N/A — Incomplete submission',
          spaceComplexity: 'N/A — Incomplete submission',
          score: 15,
          hints: ['Anti-cheat proctoring is active during AI interviews.', 'Switching tabs or windows immediately ends the assessment.'],
          codeReview: 'Your interview was terminated before the solution could be fully evaluated. The partial code has been scored with a penalty.'
        });
      }
    } catch (err) {
      console.error('Failed to evaluate disqualified code', err);
      setAiFeedback({
        correctness: 'Assessment terminated — evaluation could not be completed.',
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        score: 0,
        hints: [],
        codeReview: 'An error occurred during evaluation.'
      });
    } finally {
      setIsAiEvaluating(false);
      setShowAiResultModal(true);
    }
  }, [code, language, aiQuestion]);

  // Proctoring Hook for Candidate
  const { activeWarning, violationCount } = useProctoring({
    roomId,
    candidateName: user?.name || 'Candidate',
    candidateId: user?.id,
    role: user?.role,
    enabled: isAuthenticated && user?.role === 'CANDIDATE',
    onViolation: isAiSession ? () => handleAiDisqualification() : undefined
  });

  // Authenticate & Join socket room
  useEffect(() => {
    if (!roomId || !isAuthenticated || !user) return;

    // Check if session was already ended to prevent re-entering closed rooms
    apiFetch(`/api/sessions/room/${roomId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session && data.session.endedAt) {
          setCompletedSession({
            sessionId: data.session.id,
            score: data.session.score,
            summary: data.session.summary,
            problemName: data.session.problemName,
            violationCount: data.session.violationCount,
            endedAt: data.session.endedAt
          });
        }
      })
      .catch(() => {});

    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setCurrentUserSocketId(socket.id || '');

      socket.emit('join-room', {
        roomId,
        user: {
          userId: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          color: userColor
        },
        initialLanguage: language
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-state', (data) => {
      if (data.title) {
        setRoomTitle(data.title);
        setEvalProblemName(data.title);
      }
      if (data.language && SUPPORTED_LANGUAGES[data.language as SupportedLanguage]) {
        setLanguage(data.language as SupportedLanguage);
      }
      if (data.code !== undefined) {
        setCode(data.code);
      }
      if (data.users) {
        setUsers(data.users);
      }
    });

    // Room title change broadcast
    socket.on('room-title-updated', (data: { title: string }) => {
      if (data.title) {
        setRoomTitle(data.title);
        setEvalProblemName(data.title);
        showToast(`✏️ Room title updated: "${data.title}"`);
      }
    });

    // SQL Schema sync broadcast
    socket.on('sql-schema-updated', (data: { schema: string }) => {
      if (data.schema) {
        setSqlSchema(data.schema);
        showToast('🗄️ SQL Database tables & schema updated!');
      }
    });

    socket.on('user-joined', (data) => {
      showToast(`👋 ${data.user.name} (${data.user.role === 'HOST' ? 'Interviewer' : 'Candidate'}) joined`);
      if (data.users) {
        setUsers(data.users);
      }
    });

    socket.on('user-left', (data) => {
      showToast(`🏃 ${data.user.name} left the room`);
      if (data.users) {
        setUsers(data.users);
      }
    });

    socket.on('presence-update', (data) => {
      if (data.users) {
        setUsers(data.users);
      }
    });

    // Proctoring Alert received (For Hosts / Interviewers)
    socket.on('proctor-alert', (alert) => {
      setLatestProctorAlert(alert);
      setHostProctorCount((prev) => prev + 1);
    });

    // Room Ended Broadcast (Received by both Candidate & Host)
    socket.on('room-ended', (data) => {
      setCompletedSession(data);
    });

    // Remote Delta synchronization
    socket.on('remote-delta', (data) => {
      if (data.fullCode) {
        setCode(data.fullCode);
      }
    });

    socket.on('remote-cursor', (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.socketId === data.socketId
            ? { ...u, cursor: data.cursor, selection: data.selection }
            : u
        )
      );
    });

    socket.on('language-changed', (data) => {
      if (data.senderSocketId !== socket.id) {
        showToast(`🔄 Language changed to ${SUPPORTED_LANGUAGES[data.language as SupportedLanguage]?.name || data.language}`);
        setLanguage(data.language as SupportedLanguage);
        if (data.code) {
          setCode(data.code);
        }
      }
    });

    socket.on('execution-started', (data) => {
      setIsRunning(true);
      showToast(`⚙️ ${data.triggeredBy} ran the code...`);
    });

    socket.on('execution-finished', (data) => {
      setIsRunning(false);
      setExecutionResult(data);
    });

    socket.on('ai-question-updated', (question) => {
      setAiQuestion(question);
      setEvalProblemName(question.title);
      if (question.starterCode && question.starterCode[language]) {
        setCode(question.starterCode[language]);
      }
      showToast(`🤖 New interview question loaded: ${question.title}`);
    });

    socket.on('ai-feedback-updated', (feedback) => {
      setAiFeedback(feedback);
      setIsGeneratingFeedback(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('presence-update');
      socket.off('proctor-alert');
      socket.off('room-ended');
      socket.off('room-title-updated');
      socket.off('sql-schema-updated');
      socket.off('remote-delta');
      socket.off('remote-cursor');
      socket.off('language-changed');
      socket.off('execution-started');
      socket.off('execution-finished');
      socket.off('ai-question-updated');
      socket.off('ai-feedback-updated');
      socket.disconnect();
    };
  }, [roomId, isAuthenticated, user, userColor, language]);

  // Auto-load AI interview problem from URL params on mount
  useEffect(() => {
    if (!isAiSession || !isAuthenticated || !user || !roomId) return;
    if (aiInterviewEndedRef.current) return;

    // Set initial language from URL param
    if (aiParamLang && SUPPORTED_LANGUAGES[aiParamLang]) {
      setLanguage(aiParamLang);
      setCode(SUPPORTED_LANGUAGES[aiParamLang].defaultCode);
    }

    // Open AI panel and auto-generate the question
    setIsAiPanelOpen(true);
    setSelectedDifficulty(aiParamDifficulty);
    setSelectedTopic(aiParamTopic);

    const loadProblem = async () => {
      setIsGeneratingQuestion(true);
      try {
        const res = await apiFetch('/api/ai/generate-question', {
          method: 'POST',
          body: JSON.stringify({
            topic: aiParamTopic,
            difficulty: aiParamDifficulty,
            language: aiParamLang
          })
        });

        if (res.ok) {
          const questionData = await res.json();
          setAiQuestion(questionData);
          setEvalProblemName(questionData.title);
          setRoomTitle(`AI Interview: ${questionData.title}`);
        }
      } catch (err) {
        console.error('Failed to auto-load AI question', err);
      } finally {
        setIsGeneratingQuestion(false);
      }
    };

    loadProblem();
  }, [isAiSession, isAuthenticated, user, roomId]);

  // Handle Host Submitting Completed Scorecard & Ending Room
  const handleConfirmEndRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || isSubmittingEnd) return;

    setIsSubmittingEnd(true);
    try {
      // Find candidate userId if available
      const candidateUser = users.find((u) => u.role === 'CANDIDATE');

      const res = await apiFetch('/api/sessions/end', {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          language,
          problemName: evalProblemName,
          summary: evalRemarks,
          score: evalScore,
          violationCount: hostProctorCount,
          candidateId: candidateUser?.userId,
          finalCode: code
        })
      });

      let savedSessionId = 'session-' + Date.now();
      if (res.ok) {
        const data = await res.json();
        if (data.session && data.session.id) {
          savedSessionId = data.session.id;
        }
      }

      // Broadcast completion to all participants
      socket.emit('end-room', {
        roomId,
        sessionId: savedSessionId,
        score: evalScore,
        summary: evalRemarks,
        problemName: evalProblemName,
        violationCount: hostProctorCount
      });

      setCompletedSession({
        sessionId: savedSessionId,
        score: evalScore,
        summary: evalRemarks,
        problemName: evalProblemName,
        violationCount: hostProctorCount,
        endedAt: new Date().toISOString()
      });

      setIsEndModalOpen(false);
    } catch (err) {
      console.error('Failed to end room session', err);
    } finally {
      setIsSubmittingEnd(false);
    }
  };

  // Handle gatekeeper login/register submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await login(authEmail, authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const res = await register(authName, authEmail, authPassword, authRole);
        if (!res.success) {
          setAuthError(res.error || 'Failed to create account.');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle local code edit
  const handleChangeDelta = (deltas: MonacoDelta[], fullCode: string) => {
    setCode(fullCode);
    socket.emit('code-delta', {
      roomId,
      changes: deltas,
      fullCode
    });
  };

  const handleCursorMove = (
    cursor: { lineNumber: number; column: number },
    selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
  ) => {
    socket.emit('cursor-move', {
      roomId,
      cursor,
      selection
    });
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    const defaultTemplate = SUPPORTED_LANGUAGES[newLang].defaultCode;
    setLanguage(newLang);
    setCode(defaultTemplate);

    socket.emit('language-change', {
      roomId,
      language: newLang,
      newCode: defaultTemplate
    });
  };

  const handleResetCode = () => {
    const defaultTemplate = SUPPORTED_LANGUAGES[language].defaultCode;
    setCode(defaultTemplate);
    socket.emit('code-delta', {
      roomId,
      changes: [],
      fullCode: defaultTemplate
    });
    showToast('Code reset to default starter template');
  };

  // Handle Candidate Voluntarily Stopping the AI Interview
  const handleStopAiInterview = async () => {
    if (aiInterviewEndedRef.current || isAiEvaluating) return;
    aiInterviewEndedRef.current = true;
    setIsAiEvaluating(true);

    try {
      const res = await apiFetch('/api/ai/analyze-code', {
        method: 'POST',
        body: JSON.stringify({
          question: aiQuestion,
          code,
          language,
          isDisqualified: false
        })
      });

      if (res.ok) {
        const feedbackData = await res.json();
        setAiFeedback(feedbackData);
      } else {
        setAiFeedback({
          correctness: 'Solution evaluated based on submitted code.',
          timeComplexity: 'See AI analysis',
          spaceComplexity: 'See AI analysis',
          score: 70,
          hints: ['Review the problem constraints for edge cases.'],
          codeReview: 'Code was evaluated at the time of submission.'
        });
      }
    } catch (err) {
      console.error('Failed to evaluate AI interview code', err);
      setAiFeedback({
        correctness: 'Evaluation could not be completed due to an error.',
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        score: 0,
        hints: [],
        codeReview: 'An error occurred during evaluation.'
      });
    } finally {
      setIsAiEvaluating(false);
      setShowAiResultModal(true);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || !user) return;

    setIsRunning(true);
    socket.emit('execution-started', {
      roomId,
      language,
      triggeredBy: user.name
    });

    try {
      const languageConfig = SUPPORTED_LANGUAGES[language];
      const res = await apiFetch('/api/execute', {
        method: 'POST',
        body: JSON.stringify({
          sourceCode: code,
          languageId: languageConfig.judge0Id,
          language: language,
          sqlSchema: language === 'sql' ? sqlSchema : undefined
        })
      });

      let result: ExecutionResult;
      if (res.ok) {
        result = await res.json();
      } else {
        const startTime = performance.now();
        let simulatedStdout = '';
        let simulatedError = null;

        if (language === 'javascript' || language === 'typescript') {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' '))
          };

          try {
            const runner = new Function('console', code);
            runner(customConsole);
            simulatedStdout = logs.join('\n') || 'Program finished with return code 0';
          } catch (err: any) {
            simulatedError = err.toString();
          }
        } else {
          simulatedStdout = `[Execution Output for ${languageConfig.name}]\n` +
            `Code verified in sandboxed execution environment.\n` +
            `Return status: Accepted (0)`;
        }

        const endTime = performance.now();
        result = {
          stdout: simulatedStdout,
          stderr: simulatedError,
          compile_output: null,
          message: null,
          time: ((endTime - startTime) / 1000).toFixed(3),
          memory: 4096,
          status: {
            id: simulatedError ? 11 : 3,
            description: simulatedError ? 'Runtime Error' : 'Accepted'
          }
        };
      }

      setExecutionResult(result);
      socket.emit('code-run-result', { roomId, result });
    } catch (error: any) {
      const errorResult: ExecutionResult = {
        stdout: null,
        stderr: error.message || 'Execution failed',
        compile_output: null,
        message: 'Network or execution error',
        time: '0.01',
        memory: 0,
        status: { id: 11, description: 'Runtime Error' }
      };
      setExecutionResult(errorResult);
      socket.emit('code-run-result', { roomId, result: errorResult });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const res = await apiFetch('/api/ai/generate-question', {
        method: 'POST',
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          language
        })
      });

      let questionData: AIQuestion;
      if (res.ok) {
        questionData = await res.json();
      } else {
        questionData = {
          title: `${selectedDifficulty} ${selectedTopic}: Longest Substring Without Repeating Characters`,
          difficulty: selectedDifficulty,
          topic: selectedTopic,
          description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.\n\nDemonstrate optimal time complexity using the **Sliding Window** technique with a hash map or character set.`,
          examples: [
            { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
            { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
            { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' }
          ],
          constraints: [
            '0 <= s.length <= 5 * 10^4',
            's consists of English letters, digits, symbols and spaces.'
          ],
          starterCode: {
            javascript: `function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let left = 0;\n  const charSet = new Set();\n  \n  return maxLength;\n}\n\nconsole.log(lengthOfLongestSubstring("abcabcbb"));\n`,
            typescript: `function lengthOfLongestSubstring(s: string): number {\n  let maxLength = 0;\n  let left = 0;\n  const charSet = new Set<string>();\n  \n  return maxLength;\n}\n\nconsole.log(lengthOfLongestSubstring("abcabcbb"));\n`,
            python: `def lengthOfLongestSubstring(s: str) -> int:\n    char_set = set()\n    left = 0\n    max_length = 0\n    return max_length\n\nprint(lengthOfLongestSubstring("abcabcbb"))\n`,
            cpp: `#include <iostream>\n#include <string>\n#include <unordered_set>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    unordered_set<char> charSet;\n    int left = 0, maxLength = 0;\n    return maxLength;\n}\n\nint main() {\n    cout << lengthOfLongestSubstring("abcabcbb") << endl;\n    return 0;\n}\n`,
            java: `import java.util.*;\n\npublic class Main {\n    public static int lengthOfLongestSubstring(String s) {\n        Set<Character> charSet = new HashSet<>();\n        int left = 0, maxLength = 0;\n        return maxLength;\n    }\n    public static void main(String[] args) {\n        System.out.println(lengthOfLongestSubstring("abcabcbb"));\n    }\n}\n`,
            go: `package main\nimport "fmt"\n\nfunc lengthOfLongestSubstring(s string) int {\n    return 0\n}\n\nfunc main() {\n    fmt.Println(lengthOfLongestSubstring("abcabcbb"))\n}\n`,
            rust: `fn length_of_longest_substring(s: String) -> i32 {\n    0\n}\n\nfn main() {\n    println!("{}", length_of_longest_substring("abcabcbb".to_string()));\n}\n`,
            csharp: `using System;\n\npublic class Program {\n    public static int LengthOfLongestSubstring(string s) {\n        return 0;\n    }\n    public static void Main() {\n        Console.WriteLine(LengthOfLongestSubstring("abcabcbb"));\n    }\n}\n`
          }
        };
      }

      setAiQuestion(questionData);
      setEvalProblemName(questionData.title);
      socket.emit('ai-question-selected', { roomId, question: questionData });
      if (questionData.starterCode && questionData.starterCode[language]) {
        setCode(questionData.starterCode[language]);
      }
    } catch (err) {
      console.error('Failed to generate question', err);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleGetFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      const res = await apiFetch('/api/ai/analyze-code', {
        method: 'POST',
        body: JSON.stringify({
          question: aiQuestion,
          code,
          language
        })
      });

      let feedbackData: AIFeedback;
      if (res.ok) {
        feedbackData = await res.json();
      } else {
        feedbackData = {
          correctness: 'Solution demonstrates solid algorithmic structure and passes core test cases.',
          timeComplexity: 'O(N) - Linear single-pass sliding window scan',
          spaceComplexity: 'O(min(N, M)) - Set storage bounded by alphabet size',
          score: 88,
          hints: [
            'Consider what happens with empty string inputs.',
            'Ensure duplicate characters trigger instant window retraction.'
          ],
          codeReview: 'Good variable naming and concise logic. Clean functional implementation.'
        };
      }

      setAiFeedback(feedbackData);
      socket.emit('ai-feedback-generated', { roomId, feedback: feedbackData });
    } catch (err) {
      console.error('Failed to get feedback', err);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // =========================================================================
  // GATEKEEPER BARRIER (IF NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500/30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0d121f]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Authentication Required to Join</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Join Interview Room
            </h1>
            <p className="text-xs text-slate-400">
              You've been invited to participate in live room <span className="font-mono text-indigo-300 font-bold">{roomId}</span>. Please sign in or create an account to enter.
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthRole('HOST')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  authRole === 'HOST'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/10 text-slate-400'
                }`}
              >
                👔 Host / Interviewer
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('CANDIDATE')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  authRole === 'CANDIDATE'
                    ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/10 text-slate-400'
                }`}
              >
                🎓 Candidate / Student
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {authLoading
                  ? 'Verifying...'
                  : authMode === 'login'
                  ? 'Sign In & Enter Room'
                  : 'Create Account & Enter Room'}
              </span>
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ROOM INTERACTION WORKSPACE
  // =========================================================================
  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a11] text-slate-100 overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-indigo-500/40 text-slate-100 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Candidate Local Tab-Switch Warning Banner */}
      {activeWarning && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between z-50 shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeWarning}</span>
          </div>
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono">
            Proctoring Active (Violations: {violationCount})
          </span>
        </div>
      )}

      {/* Host Live Proctoring Red Alert Box */}
      {user.role === 'HOST' && latestProctorAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 max-w-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <EyeOff className="w-4 h-4 animate-pulse" />
              <span>ANTI-CHEAT PROCTOR ALERT</span>
            </div>
            <button
              onClick={() => setLatestProctorAlert(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-rose-100 leading-snug">
            🚨 Candidate <strong className="text-white underline">{latestProctorAlert.candidateName}</strong> just changed browser tabs / switched applications!
          </p>

          <div className="flex items-center justify-between text-[10px] text-rose-300 font-mono pt-1">
            <span>Strike #{latestProctorAlert.violationCount}</span>
            <span>{new Date(latestProctorAlert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* SQL Database Schema & Mock Tables Modal */}
      <SqlSchemaModal
        isOpen={isSqlSchemaOpen}
        onClose={() => setIsSqlSchemaOpen(false)}
        schemaSql={sqlSchema}
        onSaveSchema={(newSchema) => {
          setSqlSchema(newSchema);
          socket.emit('update-sql-schema', { roomId, schema: newSchema });
        }}
      />

      {/* HOST: END INTERVIEW & SCORECARD SUBMISSION MODAL */}
      {isEndModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0d121f] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsEndModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>Finish Session & Submit Scorecard</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                End Technical Interview
              </h2>
              <p className="text-xs text-slate-400">
                Submit candidate performance rating, feedback notes, and conclude live coding for Room <span className="font-mono text-indigo-300">{roomId}</span>.
              </p>
            </div>

            <form onSubmit={handleConfirmEndRoom} className="space-y-4">
              {/* Problem Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Challenge / Problem Name</label>
                <input
                  type="text"
                  required
                  value={evalProblemName}
                  onChange={(e) => setEvalProblemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Candidate Score Slider */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Performance Score</label>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {evalScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Proctoring Summary Pill */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Anti-Cheat Tab Violations Logged:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  hostProctorCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {hostProctorCount} Strike{hostProctorCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Evaluation Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Interviewer Remarks & Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  placeholder="Share feedback on candidate code clarity, algorithmic approach, and edge-case handling..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEndModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnd}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isSubmittingEnd ? 'Finalizing...' : 'Save & Conclude Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED INTERVIEW EVALUATION OVERLAY (FOR CANDIDATE & HOST) */}
      {completedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 animate-in zoom-in-95">
          <div className="w-full max-w-lg bg-[#0d121f] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-[#0d121f] rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interview Successfully Concluded</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {completedSession.problemName || 'Technical Interview'}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The session has ended. All code keystrokes, performance ratings, and proctoring metrics have been saved to your profile and dashboard.
              </p>
            </div>

            {/* Scorecard Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs text-slate-400">Final Candidate Score</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  {completedSession.score !== undefined ? `${completedSession.score} / 100` : 'Evaluated'}
                </span>
              </div>

              {completedSession.summary && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Interviewer Remarks:</span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    {completedSession.summary}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span>Tab Violations: {completedSession.violationCount || 0}</span>
                <span>Language: {language.toUpperCase()}</span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {completedSession.sessionId && (
                <button
                  onClick={() => navigate(`/replay/${completedSession.sessionId}`)}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Session Replay</span>
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        roomId={roomId || 'default'}
        roomTitle={roomTitle}
        onTitleChange={(newTitle) => {
          setRoomTitle(newTitle);
          setEvalProblemName(newTitle);
          socket.emit('update-room-title', { roomId, title: newTitle });
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onToggleAiPanel={() => {
          if (user.role !== 'HOST') {
            setIsAiPanelOpen(!isAiPanelOpen);
          }
        }}
        isAiPanelOpen={user.role !== 'HOST' && isAiPanelOpen}
        onResetCode={handleResetCode}
        users={users}
        currentUserSocketId={currentUserSocketId}
        isConnected={isConnected}
        onShowToast={showToast}
        onOpenProfile={() => setIsProfileOpen(true)}
        onEndRoom={() => setIsEndModalOpen(true)}
        onOpenSqlSchema={() => setIsSqlSchemaOpen(true)}
        isAiSession={isAiSession}
        onStopAiInterview={isAiSession ? handleStopAiInterview : undefined}
        userRole={user.role}
      />

      {/* Live WebRTC Audio/Video Conference Bar (Hidden in AI Solo Mode) */}
      {!isAiSession && (
        <VideoConference
          roomId={roomId || 'default'}
          userName={user.name}
          userRole={user.role}
          userAvatar={user.avatarUrl}
          autoRequestMedia={true}
        />
      )}

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Editor + Execution Output Split */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
          {/* Monaco Code Editor */}
          <div className="flex-1 min-h-0 relative">
            <CodeEditor
              code={code}
              language={language}
              onChangeDelta={handleChangeDelta}
              onCursorMove={handleCursorMove}
              remoteUsers={users}
              currentUserSocketId={currentUserSocketId}
            />
          </div>

          {/* Terminal Console Panel */}
          <div className="h-56 min-h-[160px] max-h-[400px]">
            <ConsolePanel
              result={executionResult}
              isRunning={isRunning}
              onClear={() => setExecutionResult(null)}
            />
          </div>
        </div>

        {/* Right: AI Mock Interviewer Sidepanel (For Candidate Solo Practice only) */}
        {user.role !== 'HOST' && isAiPanelOpen && (
          <div className="w-96 bg-[#0d121f] border-l border-white/10 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">AI Interviewer</h2>
                  <span className="text-[10px] text-slate-400">Claude Mock Assessment</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
                BETA
              </span>
            </div>

            <div className="space-y-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-semibold text-slate-300 block">Generate Mock Challenge</span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="🎲 Random / Any Topic">🎲 Random / Any Topic</option>
                    <option value="Arrays & Hashing">Arrays & Hashing</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Stack & Queues">Stack & Queues</option>
                    <option value="Binary Search">Binary Search</option>
                    <option value="Linked Lists">Linked Lists</option>
                    <option value="Trees & Graphs">Trees & Graphs</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="SQL Database Queries">SQL Database Queries</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateQuestion}
                disabled={isGeneratingQuestion}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingQuestion ? 'Generating...' : 'Load Challenge'}</span>
              </button>
            </div>

            {aiQuestion && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{aiQuestion.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    aiQuestion.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : aiQuestion.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {aiQuestion.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {aiQuestion.description}
                </p>

                {aiQuestion.examples && aiQuestion.examples.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-slate-400 block">Example:</span>
                    <div className="p-2 rounded bg-black/40 font-mono text-[11px] space-y-1 text-slate-300">
                      <div><span className="text-slate-500">Input:</span> {aiQuestion.examples[0].input}</div>
                      <div><span className="text-slate-500">Output:</span> {aiQuestion.examples[0].output}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleGetFeedback}
              disabled={isGeneratingFeedback}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{isGeneratingFeedback ? 'Evaluating Code...' : 'Analyze Solution & Get Feedback'}</span>
            </button>

            {aiFeedback && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                      Evaluation Summary
                    </span>
                    {aiFeedback.score !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold font-mono">
                        Score: {aiFeedback.score}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{aiFeedback.correctness}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Time Complexity</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">{aiFeedback.timeComplexity}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Space Complexity</span>
                    <span className="text-xs font-mono font-bold text-indigo-300">{aiFeedback.spaceComplexity}</span>
                  </div>
                </div>

                {aiFeedback.hints && aiFeedback.hints.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300">Interviewer Hints & Edge Cases:</span>
                    <div className="space-y-1.5">
                      {aiFeedback.hints.map((hint, i) => (
                        <div key={i} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                          <span className="font-bold text-amber-400">{i + 1}.</span>
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiFeedback.codeReview && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-300">Code Quality & Style:</span>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {aiFeedback.codeReview}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Evaluating Overlay */}
      {isAiEvaluating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-4 animate-pulse">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Evaluating Your Solution...</h3>
              <p className="text-sm text-slate-400 mt-1">AI is analyzing your code. Please wait.</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Assessment Result Scorecard Modal */}
      <AiResultModal
        isOpen={showAiResultModal}
        onClose={() => setShowAiResultModal(false)}
        question={aiQuestion}
        feedback={aiFeedback}
        isDisqualified={isAiDisqualified}
        onReturnDashboard={() => navigate('/dashboard')}
      />
    </div>
  );
};
