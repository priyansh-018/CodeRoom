import React, { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import type { SupportedLanguage, UserPresence, MonacoDelta } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChangeDelta: (deltas: MonacoDelta[], fullCode: string) => void;
  onCursorMove: (cursor: { lineNumber: number; column: number }, selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }) => void;
  remoteUsers: UserPresence[];
  currentUserSocketId?: string;
  theme?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChangeDelta,
  onCursorMove,
  remoteUsers,
  currentUserSocketId
}) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const isApplyingRemoteDeltaRef = useRef<boolean>(false);
  const decorationsCollectionRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define sleek custom dark theme
    monaco.editor.defineTheme('coderoom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'function', foreground: 'a78bfa' },
        { token: 'variable', foreground: 'f1f5f9' },
        { token: 'operator', foreground: 'cbd5e1' },
      ],
      colors: {
        'editor.background': '#0b0f19',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#161e31',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818cf8',
        'editorCursor.foreground': '#6366f1',
        'editor.selectionBackground': '#312e8166',
        'editor.inactiveSelectionBackground': '#1e1b4b44',
      }
    });

    monaco.editor.setTheme('coderoom-dark');

    // Create decorations collection for remote cursor rendering
    decorationsCollectionRef.current = editor.createDecorationsCollection();

    // Listen to local content changes and emit delta events
    editor.onDidChangeModelContent((event) => {
      // Prevent loopback if this change originated from a remote socket delta
      if (isApplyingRemoteDeltaRef.current) {
        return;
      }

      const fullCode = editor.getValue();
      const deltas: MonacoDelta[] = event.changes.map((change) => ({
        range: {
          startLineNumber: change.range.startLineNumber,
          startColumn: change.range.startColumn,
          endLineNumber: change.range.endLineNumber,
          endColumn: change.range.endColumn
        },
        text: change.text,
        rangeLength: change.rangeLength,
        rangeOffset: change.rangeOffset
      }));

      onChangeDelta(deltas, fullCode);
    });

    // Listen to local cursor and selection changes
    let cursorThrottleTimer: any = null;
    editor.onDidChangeCursorPosition((e) => {
      if (cursorThrottleTimer) clearTimeout(cursorThrottleTimer);
      cursorThrottleTimer = setTimeout(() => {
        const selection = editor.getSelection();
        onCursorMove(
          { lineNumber: e.position.lineNumber, column: e.position.column },
          selection
            ? {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
              }
            : undefined
        );
      }, 50);
    });
  };

  // Sync incoming code changes from remote if needed (when full replacement or initial load occurs)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (editor.getValue() !== code) {
      isApplyingRemoteDeltaRef.current = true;
      const position = editor.getPosition();
      editor.setValue(code);
      if (position) {
        editor.setPosition(position);
      }
      isApplyingRemoteDeltaRef.current = false;
    }
  }, [code]);

  // Render remote cursors and selections
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !decorationsCollectionRef.current) return;

    const decorations: Monaco.editor.IModelDeltaDecoration[] = [];

    // Inject dynamic CSS rules for remote cursor colors if needed
    remoteUsers
      .filter((u) => u.socketId !== currentUserSocketId)
      .forEach((user) => {
        const safeId = user.socketId.replace(/[^a-zA-Z0-9]/g, '_');
        const styleId = `cursor-style-${safeId}`;

        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = `
            .remote-cursor-${safeId} {
              position: absolute;
              width: 2px !important;
              background-color: ${user.color} !important;
              pointer-events: none;
            }
            .remote-cursor-label-${safeId} {
              position: absolute;
              top: -18px;
              left: 0;
              font-size: 10px;
              font-weight: 600;
              padding: 1px 4px;
              border-radius: 3px;
              color: #ffffff;
              background-color: ${user.color};
              white-space: nowrap;
              pointer-events: none;
              box-shadow: 0 2px 4px rgba(0,0,0,0.4);
              z-index: 20;
            }
            .remote-selection-${safeId} {
              background-color: ${user.color}33 !important;
            }
          `;
          document.head.appendChild(style);
        }

        if (user.cursor) {
          decorations.push({
            range: new monaco.Range(
              user.cursor.lineNumber,
              user.cursor.column,
              user.cursor.lineNumber,
              user.cursor.column
            ),
            options: {
              className: `remote-cursor-${safeId}`,
              before: {
                content: ` ${user.name} `,
                inlineClassName: `remote-cursor-label-${safeId}`
              }
            }
          });
        }

        if (user.selection) {
          decorations.push({
            range: new monaco.Range(
              user.selection.startLineNumber,
              user.selection.startColumn,
              user.selection.endLineNumber,
              user.selection.endColumn
            ),
            options: {
              className: `remote-selection-${safeId}`
            }
          });
        }
      });

    decorationsCollectionRef.current.set(decorations);
  }, [remoteUsers, currentUserSocketId]);

  const monacoLanguage = SUPPORTED_LANGUAGES[language]?.monacoLanguage || 'javascript';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0b0f19]">
      <Editor
        height="100%"
        language={monacoLanguage}
        defaultValue={code}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          tabSize: 2,
          minimap: { enabled: true, side: 'right', maxColumn: 80, scale: 0.85 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          automaticLayout: true,
          lineNumbers: 'on',
          padding: { top: 16, bottom: 16 },
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
};
