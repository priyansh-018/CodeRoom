import { useRef, useCallback } from 'react';
import { saveRecording } from '../services/recordingStore';

interface UseRecorderOptions {
  roomId: string;
  sessionId?: string;
  candidateName?: string;
  interviewerName?: string;
  problemName?: string;
}

interface UseRecorderReturn {
  /** Start recording the combined local + remote streams */
  startRecording: (localStream: MediaStream, remoteStream?: MediaStream | null) => void;
  /** Stop recording and persist to IndexedDB. Returns the saved Blob or null. */
  stopRecording: (finalSessionId?: string) => Promise<Blob | null>;
  /** Whether recording is currently active */
  isRecordingRef: React.MutableRefObject<boolean>;
}

/**
 * useRecorder — records a combined video+audio stream (local camera + both
 * sides' audio) using MediaRecorder and persists to IndexedDB on stop.
 */
export function useRecorder(opts: UseRecorderOptions): UseRecorderReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const roomIdRef = useRef(opts.roomId);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  roomIdRef.current = opts.roomId;

  const startRecording = useCallback(
    (localStream: MediaStream, remoteStream?: MediaStream | null) => {
      if (isRecordingRef.current) return;

      try {
        // Build a combined MediaStream with:
        // - video track from local (candidate camera)
        // - mixed audio from both local mic and remote audio
        const combinedStream = new MediaStream();

        // Add video tracks from local stream (candidate's camera)
        localStream.getVideoTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });

        // Mix audio from local and remote using AudioContext
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const dest = audioCtx.createMediaStreamDestination();

          // Local microphone audio
          const localAudioTracks = localStream.getAudioTracks();
          if (localAudioTracks.length > 0) {
            const localAudioStream = new MediaStream(localAudioTracks);
            const localSource = audioCtx.createMediaStreamSource(localAudioStream);
            localSource.connect(dest);
          }

          // Remote participant audio
          if (remoteStream) {
            const remoteAudioTracks = remoteStream.getAudioTracks();
            if (remoteAudioTracks.length > 0) {
              const remoteAudioStream = new MediaStream(remoteAudioTracks);
              const remoteSource = audioCtx.createMediaStreamSource(remoteAudioStream);
              remoteSource.connect(dest);
            }
          }

          // Add the mixed audio track to the combined stream
          dest.stream.getAudioTracks().forEach((track) => {
            combinedStream.addTrack(track);
          });
        } else {
          // Fallback: just use local audio
          localStream.getAudioTracks().forEach((track) => {
            combinedStream.addTrack(track);
          });
        }

        // Determine best supported mime type
        const mimeType = getSupportedMimeType();

        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 1_000_000, // 1 Mbps for reasonable quality
          audioBitsPerSecond: 128_000,
        });

        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onerror = (e) => {
          console.error('MediaRecorder error:', e);
        };

        // Collect data every 2 seconds to avoid data loss
        recorder.start(2000);
        mediaRecorderRef.current = recorder;
        isRecordingRef.current = true;
        startTimeRef.current = Date.now();

        console.log(`🎬 Interview recording started (${mimeType})`);
      } catch (err) {
        console.error('Failed to start MediaRecorder:', err);
      }
    },
    []
  );

  const stopRecording = useCallback(
    async (finalSessionId?: string): Promise<Blob | null> => {
      if (!isRecordingRef.current || !mediaRecorderRef.current) {
        return null;
      }

      return new Promise<Blob | null>((resolve) => {
        const recorder = mediaRecorderRef.current!;
        const durationMs = Date.now() - startTimeRef.current;

        recorder.onstop = async () => {
          isRecordingRef.current = false;

          if (chunksRef.current.length === 0) {
            console.warn('No recording data captured');
            resolve(null);
            return;
          }

          const mimeType = recorder.mimeType || 'video/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];

          const sessionId = finalSessionId || optsRef.current.sessionId || `session-${Date.now()}`;

          try {
            await saveRecording({
              sessionId,
              roomId: roomIdRef.current,
              blob,
              mimeType,
              durationMs,
              recordedAt: new Date().toISOString(),
              candidateName: optsRef.current.candidateName,
              interviewerName: optsRef.current.interviewerName,
              problemName: optsRef.current.problemName,
            });
            console.log(`✅ Interview recording saved (${(blob.size / 1024 / 1024).toFixed(1)} MB, ${Math.round(durationMs / 1000)}s)`);
          } catch (err) {
            console.error('Failed to persist recording to IndexedDB:', err);
          }

          resolve(blob);
        };

        // Stop the recorder — this triggers `onstop` event
        if (recorder.state !== 'inactive') {
          recorder.stop();
        } else {
          isRecordingRef.current = false;
          resolve(null);
        }
      });
    },
    []
  );

  return { startRecording, stopRecording, isRecordingRef };
}

/** Determine best available MediaRecorder mime type */
function getSupportedMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4',
  ];

  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return 'video/webm';
}
