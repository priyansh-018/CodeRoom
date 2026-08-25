import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../services/socket';
import type { UserRole } from '../types';

interface UseProctoringOptions {
  roomId?: string;
  candidateName: string;
  candidateId?: string;
  role?: UserRole;
  enabled?: boolean;
  onViolation?: (eventType: 'TAB_SWITCH' | 'WINDOW_BLUR', count: number) => void;
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
  const warningTimerRef = useRef<any>(null);

  const socket = getSocket();

  const reportViolation = (eventType: 'TAB_SWITCH' | 'WINDOW_BLUR') => {
    if (!roomId || role !== 'CANDIDATE' || !enabled) return;

    setViolationCount((prev) => {
      const newCount = prev + 1;
      const warningText = `⚠️ Warning: Tab switch / app change detected! Strike #${newCount}. Your interviewer has been alerted.`;
      
      setActiveWarning(warningText);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(() => setActiveWarning(null), 6000);

      // Emit to backend socket
      socket.emit('proctoring-violation', {
        roomId,
        candidateName,
        candidateId,
        eventType,
        timestamp: new Date().toISOString(),
        violationCount: newCount
      });

      if (onViolation) {
        onViolation(eventType, newCount);
      }

      return newCount;
    });
  };

  useEffect(() => {
    if (!roomId || role !== 'CANDIDATE' || !enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      // Avoid false positive when clicking inside iframe or editor dropdown
      if (!document.hasFocus()) {
        reportViolation('WINDOW_BLUR');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [roomId, role, enabled, candidateName, candidateId]);

  return {
    violationCount,
    activeWarning,
    dismissWarning: () => setActiveWarning(null)
  };
}
