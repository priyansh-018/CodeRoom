import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Clock, Cpu, Trash2, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import type { ExecutionResult } from '../../types';

interface ConsolePanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onClear: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  result,
  isRunning,
  onClear
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = (result?.stdout || '') + (result?.stderr || '') + (result?.compile_output || '');
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuccess = result?.status?.id === 3;

  return (
    <div className={`border-t border-white/10 bg-[#0d121f] flex flex-col transition-all duration-200 ${isCollapsed ? 'h-9' : 'h-64'}`}>
      {/* Console Header Bar */}
      <div className="h-9 px-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Execution Console</span>
          </div>

          {/* Status Badge */}
          {isRunning && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Executing...</span>
            </div>
          )}

          {!isRunning && result && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-rose-400" />
              )}
              <span>{result.status?.description || (isSuccess ? 'Success' : 'Error')}</span>
            </div>
          )}

          {/* Stats Badges */}
          {!isRunning && result && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              {result.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{result.time}s</span>
                </div>
              )}
              {result.memory && (
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  <span>{Math.round(result.memory / 1024)} KB</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Console Action Buttons */}
        <div className="flex items-center gap-1">
          {result && (
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Copy Output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Output Content Area */}
      {!isCollapsed && (
        <div className="flex-1 p-3 font-mono text-xs overflow-y-auto bg-[#080b12] text-slate-300 select-text">
          {isRunning ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Running code in sandboxed container...</span>
            </div>
          ) : result ? (
            <div className="space-y-2">
              {result.compile_output && (
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-amber-400 mb-1">
                    Compilation Output:
                  </div>
                  <pre className="whitespace-pre-wrap">{result.compile_output}</pre>
                </div>
              )}

              {result.stderr && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-rose-400 mb-1">
                    Standard Error:
                  </div>
                  <pre className="whitespace-pre-wrap">{result.stderr}</pre>
                </div>
              )}

              {result.stdout && (
                <div>
                  <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed">{result.stdout}</pre>
                </div>
              )}

              {!result.stdout && !result.stderr && !result.compile_output && (
                <div className="text-slate-500 italic">Code executed successfully with no output.</div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-1 select-none">
              <Terminal className="w-5 h-5 text-slate-600" />
              <span>Click "Run Code" to execute in a secure Judge0 sandbox environment.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
