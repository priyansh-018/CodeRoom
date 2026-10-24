import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../../services/socket';
import { apiFetch } from '../../services/api';
import type { UserRole, UserPresence } from '../../types';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  Camera,
  UserCheck,
  Volume2,
  VolumeX,
  EyeOff,
  Activity,
  GraduationCap,
  FileText,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ],
  iceCandidatePoolSize: 10
};

interface VideoConferenceProps {
  roomId: string;
  userName: string;
  userRole?: UserRole;
  userAvatar?: string;
  autoRequestMedia?: boolean;
  /** Fires whenever local or remote media streams change, so parent can record */
  onStreamsReady?: (local: MediaStream | null, remote: MediaStream | null) => void;
  candidateUser?: UserPresence;
  onOpenCandidateDossier?: () => void;
  hostProctorCount?: number;
  onToggleSidebar?: () => void;
}

const parseCandidateSkills = (rawSkills?: string | string[]): string[] => {
  if (!rawSkills) return [];
  if (Array.isArray(rawSkills)) return rawSkills;
  if (typeof rawSkills === 'string') {
    try {
      const parsed = JSON.parse(rawSkills);
      if (Array.isArray(parsed)) return parsed;
      return [rawSkills];
    } catch {
      return rawSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export const VideoConference: React.FC<VideoConferenceProps> = ({
  roomId,
  userName,
  userRole = 'CANDIDATE',
  autoRequestMedia = true,
  onStreamsReady,
  candidateUser,
  onOpenCandidateDossier,
  hostProctorCount = 0,
  onToggleSidebar
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteParticipantName, setRemoteParticipantName] = useState<string>('');

  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(userRole === 'CANDIDATE');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hasPermissionError, setHasPermissionError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Real-time audio activity detection (visual speaking meters)
  const [localIsSpeaking, setLocalIsSpeaking] = useState<boolean>(false);
  const [remoteIsSpeaking, setRemoteIsSpeaking] = useState<boolean>(false);

  // Peer's Media State (e.g. Host seeing Candidate's camera/mic toggles)
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState<boolean>(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState<boolean>(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isNegotiatingRef = useRef<boolean>(false);
  const remoteSocketIdRef = useRef<string | null>(null);

  const localAudioContextRef = useRef<AudioContext | null>(null);
  const remoteAudioContextRef = useRef<AudioContext | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>(RTC_CONFIG.iceServers || []);

  const socket = getSocket();

  // Dynamically load fresh STUN/TURN servers from backend
  useEffect(() => {
    apiFetch('/api/webrtc/ice-servers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.iceServers) && data.iceServers.length > 0) {
          iceServersRef.current = data.iceServers;
          console.log('🌐 Loaded dynamic WebRTC ICE servers:', data.iceServers.length);
        }
      })
      .catch((err) => console.warn('Could not fetch custom ICE servers, using defaults:', err));
  }, []);

  // Notify parent of stream availability for recording
  React.useEffect(() => {
    onStreamsReady?.(localStream, remoteStream);
  }, [localStream, remoteStream, onStreamsReady]);

  // Voice level analyzer setup for visual speaking indicator
  const setupAudioAnalyzer = (
    stream: MediaStream, 
    onSpeakingChange: (isSpeaking: boolean) => void,
    isRemote: boolean
  ) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      if (isRemote) remoteAudioContextRef.current = audioCtx;
      else localAudioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let isCancelled = false;

      const checkVolume = () => {
        if (isCancelled) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        onSpeakingChange(average > 15);
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return () => {
        isCancelled = true;
        audioCtx.close().catch(() => {});
      };
    } catch (e) {
      console.warn('Audio analyzer error:', e);
    }
  };

  // Reset PeerConnection helper
  const resetPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('Error closing peerConnection:', e);
      }
      peerConnectionRef.current = null;
    }
    isNegotiatingRef.current = false;
    pendingIceCandidatesRef.current = [];
  }, []);

  // Create PeerConnection
  const getOrCreatePeerConnection = useCallback(() => {
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
      return peerConnectionRef.current;
    }

    console.log('🔌 Initializing RTCPeerConnection with ICE servers:', iceServersRef.current.length);
    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      iceCandidatePoolSize: 10
    });
    peerConnectionRef.current = pc;

    // Attach local media tracks
    if (localStreamRef.current) {
      const senders = pc.getSenders();
      localStreamRef.current.getTracks().forEach((track) => {
        if (!senders.some((s) => s.track === track)) {
          try {
            pc.addTrack(track, localStreamRef.current!);
          } catch (e) {
            console.warn('Track already added to PC', e);
          }
        }
      });
    }

    // Remote Track Handler
    pc.ontrack = (event) => {
      console.log('📡 Remote track received:', event.track.kind, event.track.id);

      // Accumulate tracks in our consolidated MediaStream
      if (!remoteStreamRef.current.getTracks().some((t) => t.id === event.track.id)) {
        remoteStreamRef.current.addTrack(event.track);
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          if (!remoteStreamRef.current.getTracks().some((existing) => existing.id === t.id)) {
            remoteStreamRef.current.addTrack(t);
          }
        });
      }

      const stream = new MediaStream(remoteStreamRef.current.getTracks());
      setRemoteStream(stream);

      // Play through dedicated remote audio element
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch((e) => {
          console.warn('Remote audio autoplay blocked:', e);
          setAutoplayBlocked(true);
        });
      }

      // Play through remote video element (MUST be muted so browser does not block video decoding)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.play().catch((e) => console.warn('Remote video autoplay error:', e));
      }
    };

    // Forward ICE Candidates directly to remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          roomId,
          targetSocketId: remoteSocketIdRef.current || 'broadcast',
          signal: { type: 'candidate', candidate: event.candidate },
          senderName: userName,
          senderRole: userRole
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('📡 WebRTC connectionState:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setAutoplayBlocked(false);
      }
    };

    pc.onsignalingstatechange = () => {
      console.log('📡 WebRTC signalingState:', pc.signalingState);
      if (pc.signalingState === 'stable') {
        isNegotiatingRef.current = false;
      }
    };

    return pc;
  }, [roomId, userName, userRole, socket]);

  // Initiate WebRTC Offer (Clean state recovery on conflict)
  const sendOffer = useCallback(async (targetSocketId?: string) => {
    const target = targetSocketId || remoteSocketIdRef.current || 'broadcast';
    console.log('📤 [sendOffer] Candidate initiating offer for target:', target);

    try {
      // If PC exists but is not in stable state (e.g. hung have-local-offer), cleanly reset
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'stable') {
        console.log('🔄 Peer connection signalingState not stable (' + peerConnectionRef.current.signalingState + '), resetting before offer...');
        resetPeerConnection();
      }

      isNegotiatingRef.current = true;
      const pc = getOrCreatePeerConnection();

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      socket.emit('webrtc-signal', {
        roomId,
        targetSocketId: target,
        signal: offer,
        senderName: userName,
        senderRole: userRole
      });
    } catch (err) {
      console.error('WebRTC sendOffer error:', err);
      isNegotiatingRef.current = false;
    }
  }, [getOrCreatePeerConnection, resetPeerConnection, roomId, userName, userRole, socket]);

  // Initialize Media Stream on mount
  useEffect(() => {
    let isCancelled = false;

    const startMedia = async () => {
      try {
        setHasPermissionError(null);
        let stream: MediaStream;

        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        };

        try {
          const constraints: MediaStreamConstraints = userRole === 'CANDIDATE'
            ? {
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
                audio: audioConstraints
              }
            : {
                video: false,
                audio: audioConstraints
              };

          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (initialErr) {
          console.warn('Full media capture failed, falling back to audio-only:', initialErr);
          // Fallback to audio only
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: audioConstraints
          });
          setIsVideoEnabled(false);
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Start local audio level detection
        setupAudioAnalyzer(stream, setLocalIsSpeaking, false);

        // Attach Candidate's local camera stream
        if (userRole === 'CANDIDATE' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection and add local tracks
        const pc = getOrCreatePeerConnection();
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          if (!senders.some((s) => s.track === track)) {
            try {
              pc.addTrack(track, stream);
            } catch (e) {
              console.warn('Track addition notice:', e);
            }
          }
        });

        // Broadcast WebRTC readiness to room
        socket.emit('webrtc-ready', {
          roomId,
          role: userRole,
          name: userName
        });

        // If Host, prompt any already-present Candidate to send an offer
        if (userRole === 'HOST') {
          socket.emit('webrtc-signal', {
            roomId,
            targetSocketId: 'broadcast',
            signal: { type: 'request-offer' },
            senderName: userName,
            senderRole: userRole
          });
        }

      } catch (err: any) {
        if (isCancelled) return;
        console.warn('Camera/Mic permission failed:', err);
        setHasPermissionError(
          'Microphone or camera permission was not granted. Please allow microphone access in your browser to enable live voice communication.'
        );
      }
    };

    if (autoRequestMedia) {
      startMedia();
    }

    return () => {
      isCancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      resetPeerConnection();
      if (localAudioContextRef.current) {
        localAudioContextRef.current.close().catch(() => {});
      }
      if (remoteAudioContextRef.current) {
        remoteAudioContextRef.current.close().catch(() => {});
      }
    };
  }, [roomId, userRole, autoRequestMedia, getOrCreatePeerConnection, resetPeerConnection, userName, socket]);

  // Keep local stream connected to candidate preview
  useEffect(() => {
    if (localStream && localVideoRef.current && userRole === 'CANDIDATE') {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, userRole]);

  // Keep remote stream connected to remote audio & video elements
  useEffect(() => {
    if (remoteStream) {
      setupAudioAnalyzer(remoteStream, setRemoteIsSpeaking, true);

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().then(() => {
          setAutoplayBlocked(false);
        }).catch((e) => {
          console.warn('Remote audio autoplay blocked:', e);
          setAutoplayBlocked(true);
        });
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.play().catch((e) => console.warn('Remote video play catch:', e));
      }
    }
  }, [remoteStream]);

  // Automatically unblock audio on any user tap/click/keystroke anywhere on the page
  useEffect(() => {
    const handleGesture = () => {
      if (remoteAudioRef.current && remoteAudioRef.current.paused && remoteStream) {
        remoteAudioRef.current.play().then(() => {
          setAutoplayBlocked(false);
        }).catch(() => {});
      }
      if (remoteAudioContextRef.current && remoteAudioContextRef.current.state === 'suspended') {
        remoteAudioContextRef.current.resume().catch(() => {});
      }
      if (localAudioContextRef.current && localAudioContextRef.current.state === 'suspended') {
        localAudioContextRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [remoteStream]);

  // Socket Signaling Listeners
  useEffect(() => {
    const handlePeerReady = (data: { socketId: string; role?: string; name?: string }) => {
      console.log('👋 [WebRTC] Peer ready event received:', data);
      remoteSocketIdRef.current = data.socketId;
      if (data.name) setRemoteParticipantName(data.name);

      if (userRole === 'CANDIDATE') {
        setTimeout(() => sendOffer(data.socketId), 300);
      } else if (userRole === 'HOST') {
        // Host asks Candidate to produce an offer
        socket.emit('webrtc-signal', {
          roomId,
          targetSocketId: data.socketId,
          signal: { type: 'request-offer' },
          senderName: userName,
          senderRole: userRole
        });
      }
    };

    const handleUserJoined = (data: any) => {
      if (data.user?.socketId && data.user.socketId !== socket.id) {
        console.log('👤 [WebRTC] User joined room:', data.user.name, data.user.socketId);
        remoteSocketIdRef.current = data.user.socketId;
        if (data.user.name) setRemoteParticipantName(data.user.name);

        if (userRole === 'CANDIDATE') {
          setTimeout(() => sendOffer(data.user.socketId), 300);
        } else if (userRole === 'HOST') {
          socket.emit('webrtc-signal', {
            roomId,
            targetSocketId: data.user.socketId,
            signal: { type: 'request-offer' },
            senderName: userName,
            senderRole: userRole
          });
        }
      }
    };

    const handlePresenceUpdate = (data: { users: any[] }) => {
      if (Array.isArray(data?.users)) {
        const otherUser = data.users.find((u: any) => u.socketId !== socket.id);
        if (otherUser) {
          remoteSocketIdRef.current = otherUser.socketId;
          if (otherUser.name) setRemoteParticipantName(otherUser.name);

          if (userRole === 'CANDIDATE' && !remoteStream && !isNegotiatingRef.current) {
            console.log('👥 Peer detected via presence-update, initiating offer to:', otherUser.name);
            setTimeout(() => sendOffer(otherUser.socketId), 400);
          }
        }
      }
    };

    const handleSocketConnect = () => {
      console.log('⚡ VideoConference socket connected, broadcasting webrtc-ready');
      if (localStreamRef.current) {
        socket.emit('webrtc-ready', {
          roomId,
          role: userRole,
          name: userName
        });
        if (userRole === 'CANDIDATE') {
          setTimeout(() => sendOffer(), 500);
        }
      }
    };

    // Handle peer's camera/mic toggle events
    const handleUserMediaState = (data: {
      socketId: string;
      videoEnabled: boolean;
      audioEnabled: boolean;
      senderRole?: string;
      senderName?: string;
    }) => {
      if (data.videoEnabled !== undefined) setRemoteVideoEnabled(data.videoEnabled);
      if (data.audioEnabled !== undefined) setRemoteAudioEnabled(data.audioEnabled);
      if (data.senderName) setRemoteParticipantName(data.senderName);
    };

    const handleSignal = async (data: any) => {
      if (!data.signal) return;
      if (data.fromSocketId) remoteSocketIdRef.current = data.fromSocketId;
      if (data.senderName) setRemoteParticipantName(data.senderName);

      try {
        // 0. REQUEST-OFFER (Host asked Candidate to offer)
        if (data.signal.type === 'request-offer') {
          console.log('🔄 [WebRTC] Peer requested fresh offer from:', data.fromSocketId);
          if (userRole === 'CANDIDATE') {
            setTimeout(() => sendOffer(data.fromSocketId), 150);
          }
          return;
        }

        // 1. RECEIVE OFFER -> CREATE ANSWER
        if (data.signal.type === 'offer') {
          console.log('📥 [WebRTC] Received offer from:', data.fromSocketId);

          // If Host's PC is currently in an unstable state, reset before answering
          if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'stable') {
            console.log('🔄 Resetting Host PC before accepting new offer...');
            resetPeerConnection();
          }

          const pc = getOrCreatePeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

          // Drain queued ICE candidates safely
          while (pendingIceCandidatesRef.current.length > 0) {
            const cand = pendingIceCandidatesRef.current.shift();
            if (cand) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.warn('Could not add queued ICE candidate:', e);
              }
            }
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc-signal', {
            roomId,
            targetSocketId: data.fromSocketId,
            signal: answer,
            senderName: userName,
            senderRole: userRole
          });
        }
        // 2. RECEIVE ANSWER -> SET REMOTE DESCRIPTION
        else if (data.signal.type === 'answer') {
          console.log('📥 [WebRTC] Received answer from:', data.fromSocketId);
          const pc = peerConnectionRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

            while (pendingIceCandidatesRef.current.length > 0) {
              const cand = pendingIceCandidatesRef.current.shift();
              if (cand) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.warn('Could not add queued ICE candidate on answer:', e);
                }
              }
            }
          }
        }
        // 3. ICE CANDIDATES
        else if (data.signal.type === 'candidate' && data.signal.candidate) {
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
            } catch (e) {
              console.warn('Could not add live ICE candidate:', e);
            }
          } else {
            pendingIceCandidatesRef.current.push(data.signal.candidate);
          }
        }
      } catch (err) {
        console.error('WebRTC Signal handling error:', err);
      }
    };

    socket.on('webrtc-peer-ready', handlePeerReady);
    socket.on('user-joined', handleUserJoined);
    socket.on('presence-update', handlePresenceUpdate);
    socket.on('connect', handleSocketConnect);
    socket.on('user-media-state', handleUserMediaState);
    socket.on('webrtc-signal', handleSignal);

    return () => {
      socket.off('webrtc-peer-ready', handlePeerReady);
      socket.off('user-joined', handleUserJoined);
      socket.off('presence-update', handlePresenceUpdate);
      socket.off('connect', handleSocketConnect);
      socket.off('user-media-state', handleUserMediaState);
      socket.off('webrtc-signal', handleSignal);
    };
  }, [roomId, userRole, userName, socket, getOrCreatePeerConnection, resetPeerConnection, sendOffer, remoteStream]);

  // Toggle Video Track (Dynamically acquire camera if not present)
  const toggleVideo = async () => {
    if (userRole !== 'CANDIDATE') return;

    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: isAudioEnabled
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoEnabled(true);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        sendOffer(remoteSocketIdRef.current || undefined);
        socket.emit('media-state-changed', {
          roomId,
          videoEnabled: true,
          audioEnabled: isAudioEnabled,
          senderRole: userRole,
          senderName: userName
        });
      } catch (e) {
        console.error('Could not start video stream:', e);
      }
      return;
    }

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const nextState = !videoTrack.enabled;
      videoTrack.enabled = nextState;
      setIsVideoEnabled(nextState);
      socket.emit('media-state-changed', {
        roomId,
        videoEnabled: nextState,
        audioEnabled: isAudioEnabled,
        senderRole: userRole,
        senderName: userName
      });
    } else {
      // Dynamic camera acquisition if initial setup was audio-only
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        const newTrack = newStream.getVideoTracks()[0];
        if (newTrack) {
          localStreamRef.current.addTrack(newTrack);
          setIsVideoEnabled(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          const pc = peerConnectionRef.current;
          if (pc) {
            pc.addTrack(newTrack, localStreamRef.current);
          }
          sendOffer(remoteSocketIdRef.current || undefined);
          socket.emit('media-state-changed', {
            roomId,
            videoEnabled: true,
            audioEnabled: isAudioEnabled,
            senderRole: userRole,
            senderName: userName
          });
        }
      } catch (err) {
        console.warn('Could not acquire camera on toggle:', err);
      }
    }
  };

  // Toggle Audio Track
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !audioTrack.enabled;
        audioTrack.enabled = nextState;
        setIsAudioEnabled(nextState);
        socket.emit('media-state-changed', {
          roomId,
          videoEnabled: isVideoEnabled,
          audioEnabled: nextState,
          senderRole: userRole,
          senderName: userName
        });
      }
    }
  };

  // User click helper to unblock browser autoplay
  const handleUnblockAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.play().then(() => {
        setAutoplayBlocked(false);
      }).catch((e) => console.error('Audio unblock failed:', e));
    }
    if (remoteAudioContextRef.current && remoteAudioContextRef.current.state === 'suspended') {
      remoteAudioContextRef.current.resume();
    }
  };

  const reconnectCall = () => {
    console.log('🔄 Manually restarting WebRTC peer connection...');
    resetPeerConnection();
    remoteStreamRef.current = new MediaStream();
    setRemoteStream(null);

    socket.emit('webrtc-ready', {
      roomId,
      role: userRole,
      name: userName
    });

    if (userRole === 'HOST') {
      socket.emit('webrtc-signal', {
        roomId,
        targetSocketId: remoteSocketIdRef.current || 'broadcast',
        signal: { type: 'request-offer' },
        senderName: userName,
        senderRole: userRole
      });
    } else if (userRole === 'CANDIDATE') {
      setTimeout(() => sendOffer(remoteSocketIdRef.current || undefined), 300);
    }
  };

  const candidateSkills = parseCandidateSkills(candidateUser?.candidateProfile?.skills);

  return (
    <div className="w-full h-full bg-[#0b0e17] flex flex-col select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Hidden dedicated audio element for incoming voice stream - ALWAYS MOUNTED */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {/* Top Header of Video Panel */}
      <div className="h-11 px-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${remoteStream ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
            <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              {userRole === 'HOST' 
                ? 'Candidate Proctoring Feed' 
                : 'Your Proctoring Camera'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Autoplay Unblock Alert */}
          {autoplayBlocked && (
            <button
              onClick={handleUnblockAudio}
              className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] animate-bounce flex items-center gap-1 shadow-md cursor-pointer"
              title="Click to enable incoming audio"
            >
              <Volume2 className="w-3 h-3" />
              <span>Voice</span>
            </button>
          )}

          <button
            onClick={reconnectCall}
            className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/5"
            title="Restart audio & video stream"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Reconnect</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Video' : 'Minimize Video'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
              title="Collapse Studio Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Permission Warning if camera/mic blocked */}
      {hasPermissionError && (
        <div className="m-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-tight">{hasPermissionError}</span>
        </div>
      )}

      {/* Video Stream Container: 16:9 widescreen ratio (~200-230px height) */}
      {!isCollapsed ? (
        <div className="p-3 pb-2 shrink-0">
          <div className="relative rounded-2xl bg-[#06080e] border border-white/10 overflow-hidden aspect-video flex items-center justify-center shadow-lg group">
            {/* CANDIDATE VIEW: Candidate's local camera stream */}
            {userRole === 'CANDIDATE' && (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                />

                {!isVideoEnabled && (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs p-3 text-center">
                    <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-rose-300">Camera Turned Off</span>
                    <span className="text-[10px] text-slate-500">Your webcam is hidden from the interviewer</span>
                  </div>
                )}

                {/* Status Tags */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                  <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1 border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full ${isVideoEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span>You</span>
                  </div>

                  {isAudioEnabled ? (
                    <div className={`px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      localIsSpeaking 
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-md shadow-emerald-500/30' 
                        : 'bg-black/75 text-slate-300 border-white/10'
                    }`}>
                      <Mic className={`w-2.5 h-2.5 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>{localIsSpeaking ? 'Speaking' : 'Mic On'}</span>
                    </div>
                  ) : (
                    <div className="px-1.5 py-0.5 rounded-md bg-rose-950/80 backdrop-blur-sm text-[10px] font-bold text-rose-300 flex items-center gap-1 border border-rose-500/40">
                      <MicOff className="w-2.5 h-2.5 text-rose-400" />
                      <span>Muted</span>
                    </div>
                  )}
                </div>

                {/* Remote Peer Voice Status on Candidate Screen */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
                  {remoteStream ? (
                    <div className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-medium flex items-center gap-1 border ${
                      remoteIsSpeaking 
                        ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-500/20' 
                        : 'bg-black/75 text-slate-300 border-white/10'
                    }`}>
                      <Volume2 className={`w-2.5 h-2.5 ${remoteIsSpeaking ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                      <span className="truncate max-w-[90px]">{remoteParticipantName || 'Interviewer'}</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-medium text-slate-400 border border-white/10">
                      <span>Host Audio Waiting</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* HOST VIEW: Candidate's Remote Video Feed */}
            {userRole === 'HOST' && (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!remoteVideoEnabled ? 'hidden' : ''}`}
                />

                {/* If Candidate turned camera off */}
                {!remoteVideoEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-slate-950/90 border border-amber-500/30">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        ⚠️ Candidate Closed Camera
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {remoteParticipantName || 'Candidate'} paused their webcam feed
                      </span>
                    </div>
                  </div>
                )}

                {/* If waiting for Candidate stream connection */}
                {remoteVideoEnabled && !remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs p-3 text-center bg-slate-950/85">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <UserCheck className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="font-semibold text-white text-xs">Connecting Candidate Feed...</span>
                    <span className="text-[10px] text-slate-400">Negotiating WebRTC audio/video</span>
                  </div>
                )}

                {/* Live Status Indicators on Host screen */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                  {remoteStream && remoteVideoEnabled && (
                    <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="truncate max-w-[100px]">{remoteParticipantName || 'Candidate Live'}</span>
                    </div>
                  )}

                  {/* Candidate Voice Activity */}
                  {remoteStream && (
                    <div className={`px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      remoteIsSpeaking 
                        ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/30' 
                        : 'bg-black/75 text-slate-300 border-white/10'
                    }`}>
                      <Volume2 className={`w-2.5 h-2.5 ${remoteIsSpeaking ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                      <span>{remoteIsSpeaking ? 'Speaking' : 'Mic On'}</span>
                    </div>
                  )}

                  {!remoteAudioEnabled && (
                    <div className="px-2 py-0.5 rounded-md bg-rose-900/90 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1 border border-rose-500 animate-pulse">
                      <VolumeX className="w-3 h-3 text-rose-300" />
                      <span>Muted</span>
                    </div>
                  )}
                </div>

                {/* Host audio speaking indicator */}
                <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-medium flex items-center gap-1 border z-10 transition-all ${
                  localIsSpeaking 
                    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400 shadow-md shadow-emerald-500/20' 
                    : 'bg-indigo-950/80 text-indigo-200 border-indigo-500/30'
                }`}>
                  <Mic className={`w-2.5 h-2.5 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                  <span>You: {localIsSpeaking ? 'Speaking' : isAudioEnabled ? 'Mic On' : 'Muted'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Minimized Video Banner */
        <div className="mx-3 my-2 p-2 rounded-xl bg-[#07090e] border border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${remoteStream ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-semibold text-slate-300">
              {userRole === 'HOST' ? (remoteParticipantName || 'Candidate Audio Active') : 'Camera Minimized (Mic Active)'}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Expand Video
          </button>
        </div>
      )}

      {/* Media Controls Bar */}
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          {/* Mic Toggle */}
          <button
            onClick={toggleAudio}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isAudioEnabled
                ? localIsSpeaking 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className={`w-3 h-3 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
            ) : (
              <MicOff className="w-3 h-3 text-rose-400" />
            )}
            <span>{isAudioEnabled ? (localIsSpeaking ? 'Speaking' : 'Mic On') : 'Muted'}</span>
          </button>

          {/* Camera Toggle (Candidate) */}
          {userRole === 'CANDIDATE' && (
            <button
              onClick={toggleVideo}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isVideoEnabled
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isVideoEnabled ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-rose-400" />}
              <span>{isVideoEnabled ? 'Cam On' : 'Cam Off'}</span>
            </button>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>WebRTC P2P</span>
        </div>
      </div>

      {/* LOWER STUDIO PANEL: Information, Dossier & Proctoring */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {/* =============================================================== */}
        {/* HOST / INTERVIEWER VIEW                                         */}
        {/* =============================================================== */}
        {userRole === 'HOST' && (
          <>
            {/* Candidate Dossier Card */}
            <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight">Candidate Profile</h3>
                    <span className="text-[10px] text-slate-400 font-medium">Verified Applicant</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {candidateUser ? 'CONNECTED' : 'WAITING'}
                </span>
              </div>

              {/* Candidate Identity Details */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0 shadow-md"
                  style={{ backgroundColor: candidateUser?.color || '#72F000' }}
                >
                  {candidateUser?.name ? candidateUser.name.slice(0, 2).toUpperCase() : 'CD'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {candidateUser?.name || 'Waiting for Candidate...'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {candidateUser?.candidateProfile?.degree || candidateUser?.candidateProfile?.qualificationStatus || 'Applicant'}
                  </div>
                </div>
              </div>

              {/* Skills Tag Pills */}
              {candidateSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {candidateSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Candidate Dossier Modal Button */}
              {onOpenCandidateDossier && (
                <button
                  onClick={onOpenCandidateDossier}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Inspect Full Dossier & Resume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                </button>
              )}
            </div>

            {/* Anti-Cheat Proctoring Monitor Card */}
            <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Anti-Cheat Integrity</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  hostProctorCount === 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 animate-pulse'
                }`}>
                  {hostProctorCount === 0 ? 'Clean (0 Strikes)' : `${hostProctorCount} Strike${hostProctorCount === 1 ? '' : 's'}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-medium">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${remoteStream && remoteVideoEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="truncate">Camera Proctoring</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${remoteStream ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="truncate">Audio Sync</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">Keystroke P2P</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">Focus Tracking</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =============================================================== */}
        {/* CANDIDATE VIEW                                                  */}
        {/* =============================================================== */}
        {userRole === 'CANDIDATE' && (
          <>
            {/* Live Proctoring Active Card */}
            <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Proctoring Active</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  SECURE
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your video, microphone, and code keystrokes are securely streaming to the interviewer.
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Keep your face centered inside camera frame</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Do not switch browser tabs or windows</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Speak clearly and articulate your reasoning</span>
                </div>
              </div>
            </div>

            {/* Assessment Guidelines Card */}
            <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interview Best Practices</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Communicate your thought process aloud before writing code.</li>
                <li>Clarify input bounds and potential edge cases.</li>
                <li>Use the Execution Console below to run and test solutions.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
