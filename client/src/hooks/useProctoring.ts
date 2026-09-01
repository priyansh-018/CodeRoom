import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';
import type { UserRole } from '../types';

export type ProctorViolationType = 
  | 'TAB_SWITCH' 
  | 'WINDOW_BLUR' 
  | 'FULLSCREEN_EXIT';

interface UseProctoringOptions {
  roomId?: string;
  candidateName: string;
  candidateId?: string;
  role?: UserRole;
  enabled?: boolean;
  onViolation?: (eventType: ProctorViolationType, count: number, details?: string) => void;
}

export function useProctoring({
  roomId,
  candidateName,
  candidateId,
  role = 'CANDIDATE',
  enabled = true,
  onViolation
}: UseProctoringOptions) {
  const [violationCount, setViolationCount] = useState<number>(0);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(Boolean(document.fullscreenElement));
  const warningTimerRef = useRef<any>(null);

  const socket = getSocket();
  const isArmedRef = useRef<boolean>(false);
  const hasEnteredFullscreenOnce = useRef<boolean>(false);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        hasEnteredFullscreenOnce.current = true;
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request notice:', err);
    }
  }, []);

  const reportViolation = (eventType: ProctorViolationType, details?: string) => {
    if (!roomId || role !== 'CANDIDATE' || !enabled || !isArmedRef.current) return;

    setViolationCount((prev) => {
      const newCount = prev + 1;
      let warningText = `⚠️ Anti-Cheat Warning: Strike #${newCount}! `;
      if (eventType === 'FULLSCREEN_EXIT') {
        warningText += 'Exiting full-screen is prohibited during proctored tests.';
      } else if (eventType === 'WINDOW_BLUR') {
        warningText += 'Focus loss detected (clicked external window, split-screen, or sidepanel).';
      } else {
        warningText += 'Tab switch or window minimize detected.';
      }
      
      setActiveWarning(warningText);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(() => setActiveWarning(null), 6000);

      // Emit to backend socket for Host
      socket.emit('proctoring-violation', {
        roomId,
        candidateName,
        candidateId,
        eventType,
        details: details || warningText,
        timestamp: new Date().toISOString(),
        violationCount: newCount
      });

      if (onViolation) {
        onViolation(eventType, newCount, details || warningText);
      }

      return newCount;
    });
  };

  useEffect(() => {
    if (!roomId || role !== 'CANDIDATE' || !enabled) return;

    // 3.5-second arming delay so initial window focus / navigation doesn't trigger false positives
    const armTimer = setTimeout(() => {
      isArmedRef.current = true;
    }, 3500);

    const handleVisibilityChange = () => {
      if (document.hidden && isArmedRef.current) {
        reportViolation('TAB_SWITCH', 'Switched browser tabs or minimized the window');
      }
    };

    const handleWindowBlur = () => {
      // Triggers if candidate clicks Gemini sidepanel, split screen, external chat, or other apps
      if (!document.hasFocus() && isArmedRef.current) {
        reportViolation('WINDOW_BLUR', 'Clicked outside main window or opened an external sidepanel/app (e.g. Gemini, ChatGPT, Split Screen)');
      }
    };

    const handleFullscreenChange = () => {
      const currentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(currentlyFullscreen);

      if (!currentlyFullscreen && hasEnteredFullscreenOnce.current && isArmedRef.current) {
        reportViolation('FULLSCREEN_EXIT', 'Exited required full-screen assessment view');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearTimeout(armTimer);
      isArmedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [roomId, role, enabled, candidateName, candidateId]);

  return {
    violationCount,
    activeWarning,
    isFullscreen,
    enterFullscreen,
    dismissWarning: () => setActiveWarning(null)
  };
}
