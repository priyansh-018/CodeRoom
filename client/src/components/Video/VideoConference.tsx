import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../../services/socket';
import type { UserRole } from '../../types';
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
  Activity
} from 'lucide-react';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelay',
      credential: 'openrelay'
    }
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
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  roomId,
  userName,
  userRole = 'CANDIDATE',
  autoRequestMedia = true,
  onStreamsReady
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

  const localAudioContextRef = useRef<AudioContext | null>(null);
  const remoteAudioContextRef = useRef<AudioContext | null>(null);

  const socket = getSocket();

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

  // Create PeerConnection
  const getOrCreatePeerConnection = useCallback(() => {
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
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

    // Forward ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          roomId,
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
      if (pc.signalingState === 'stable') {
        isNegotiatingRef.current = false;
      }
    };

    return pc;
  }, [roomId, userName, userRole, socket]);

  // Initiate WebRTC Offer
  const sendOffer = useCallback(async (targetSocketId?: string) => {
    if (isNegotiatingRef.current) return;

    try {
      isNegotiatingRef.current = true;
      const pc = getOrCreatePeerConnection();

      if (pc.signalingState !== 'stable') {
        isNegotiatingRef.current = false;
        return;
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      socket.emit('webrtc-signal', {
        roomId,
        targetSocketId: targetSocketId || 'broadcast',
        signal: offer,
        senderName: userName,
        senderRole: userRole
      });
    } catch (err) {
      console.error('WebRTC sendOffer error:', err);
      isNegotiatingRef.current = false;
    }
  }, [getOrCreatePeerConnection, roomId, userName, userRole, socket]);

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

        // If candidate, send offer after brief initialization
        if (userRole === 'CANDIDATE') {
          setTimeout(() => {
            if (!isCancelled) sendOffer();
          }, 400);
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
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localAudioContextRef.current) {
        localAudioContextRef.current.close().catch(() => {});
      }
      if (remoteAudioContextRef.current) {
        remoteAudioContextRef.current.close().catch(() => {});
      }
    };
  }, [roomId, userRole, autoRequestMedia, getOrCreatePeerConnection, sendOffer, userName, socket]);

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
      if (data.name) setRemoteParticipantName(data.name);

      if (userRole === 'CANDIDATE') {
        setTimeout(() => sendOffer(data.socketId), 300);
      }
    };

    const handleUserJoined = (data: any) => {
      if (data.user?.socketId && data.user.socketId !== socket.id) {
        if (data.user.name) setRemoteParticipantName(data.user.name);

        if (userRole === 'CANDIDATE') {
          setTimeout(() => sendOffer(data.user.socketId), 300);
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
      if (data.senderName) setRemoteParticipantName(data.senderName);

      const pc = getOrCreatePeerConnection();

      try {
        // 1. RECEIVE OFFER -> CREATE ANSWER
        if (data.signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

          // Drain queued ICE candidates
          while (pendingIceCandidatesRef.current.length > 0) {
            const cand = pendingIceCandidatesRef.current.shift();
            if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
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
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

            while (pendingIceCandidatesRef.current.length > 0) {
              const cand = pendingIceCandidatesRef.current.shift();
              if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          }
        }
        // 3. ICE CANDIDATES
        else if (data.signal.type === 'candidate' && data.signal.candidate) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
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
    socket.on('user-media-state', handleUserMediaState);
    socket.on('webrtc-signal', handleSignal);

    return () => {
      socket.off('webrtc-peer-ready', handlePeerReady);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-media-state', handleUserMediaState);
      socket.off('webrtc-signal', handleSignal);
    };
  }, [roomId, userRole, userName, socket, getOrCreatePeerConnection, sendOffer]);

  // Toggle Video Track
  const toggleVideo = () => {
    if (localStreamRef.current && userRole === 'CANDIDATE') {
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

  return (
    <div className="flex flex-col bg-[#0d121f] border-b border-white/10 p-3 space-y-2 select-none">
      {/* Hidden dedicated audio element for incoming voice stream */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${remoteStream ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {userRole === 'HOST' 
                ? 'Candidate Live Camera Proctoring Feed' 
                : 'Your Live Camera Stream (Proctoring Active)'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay Unblock Alert */}
          {autoplayBlocked && (
            <button
              onClick={handleUnblockAudio}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] animate-bounce flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
              title="Click to enable incoming audio"
            >
              <Volume2 className="w-3 h-3" />
              <span>Click to Enable Voice</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Video' : 'Minimize Video'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Permission Warning */}
      {hasPermissionError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{hasPermissionError}</span>
        </div>
      )}

      {/* Video Streams Container */}
      {!isCollapsed && (
        <div>
          {/* CANDIDATE VIEW: Candidate's local camera stream */}
          {userRole === 'CANDIDATE' && (
            <div className="relative rounded-2xl bg-black/60 border border-white/10 overflow-hidden aspect-[21/9] sm:aspect-[24/7] flex items-center justify-center shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />

              {!isVideoEnabled && (
                <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs">
                  <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-rose-300">Camera Turned Off</span>
                  <span className="text-[10px] text-slate-500">Your video is hidden from the interviewer</span>
                </div>
              )}

              {/* Status Tags */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                  <span className={`w-1.5 h-1.5 rounded-full ${isVideoEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span>Candidate (You) • {isVideoEnabled ? 'Camera Active' : 'Camera Off'}</span>
                </div>

                {isAudioEnabled ? (
                  <div className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    localIsSpeaking 
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-md shadow-emerald-500/30' 
                      : 'bg-black/70 text-slate-300 border-white/10'
                  }`}>
                    <Mic className={`w-3 h-3 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                    <span>{localIsSpeaking ? 'Speaking...' : 'Mic Active'}</span>
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded-md bg-rose-950/80 backdrop-blur-sm text-[10px] font-bold text-rose-300 flex items-center gap-1 border border-rose-500/40">
                    <MicOff className="w-3 h-3 text-rose-400" />
                    <span>Muted</span>
                  </div>
                )}
              </div>

              {/* Remote Peer Voice Status on Candidate Screen */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2 z-10">
                {remoteStream ? (
                  <div className={`px-2.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-medium flex items-center gap-1.5 border ${
                    remoteIsSpeaking 
                      ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-500/20' 
                      : 'bg-black/70 text-slate-300 border-white/10'
                  }`}>
                    <Volume2 className={`w-3 h-3 ${remoteIsSpeaking ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                    <span>Interviewer: {remoteParticipantName || 'Connected'}</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-slate-400 border border-white/10">
                    <span>Waiting for Interviewer Audio...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HOST VIEW: Candidate's Remote Video Feed with Live Mute/Video Closed Alerts */}
          {userRole === 'HOST' && (
            <div className="relative rounded-2xl bg-black/60 border border-white/10 overflow-hidden aspect-[21/9] sm:aspect-[24/7] flex items-center justify-center shadow-lg">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!remoteVideoEnabled ? 'hidden' : ''}`}
              />

              {/* 1. If Candidate turned camera off */}
              {!remoteVideoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-950/90 border border-amber-500/30">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-300 block">
                      ⚠️ Candidate Closed / Paused Camera
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {remoteParticipantName || 'Candidate'} turned off their webcam feed.
                    </span>
                  </div>
                </div>
              )}

              {/* 2. If waiting for Candidate stream connection */}
              {remoteVideoEnabled && !remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs p-4 text-center bg-slate-950/80">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <UserCheck className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="font-semibold text-white">Connecting Candidate Live Stream...</span>
                  <span className="text-[11px] text-slate-400">Negotiating WebRTC audio & video stream</span>
                </div>
              )}

              {/* Live Status Indicators on Host screen */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2 z-10">
                {remoteStream && remoteVideoEnabled && (
                  <div className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Candidate Feed: {remoteParticipantName || 'Candidate Live'}</span>
                  </div>
                )}

                {/* Candidate Voice Activity Indicator */}
                {remoteStream && (
                  <div className={`px-2 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    remoteIsSpeaking 
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/70 text-slate-300 border-white/10'
                  }`}>
                    <Volume2 className={`w-3 h-3 ${remoteIsSpeaking ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                    <span>{remoteIsSpeaking ? 'Candidate Speaking...' : 'Candidate Mic On'}</span>
                  </div>
                )}

                {/* Candidate Mic Muted Warning on Host screen */}
                {!remoteAudioEnabled && (
                  <div className="px-2.5 py-0.5 rounded-md bg-rose-900/90 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1.5 border border-rose-500 animate-pulse">
                    <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                    <span>Candidate Muted Mic</span>
                  </div>
                )}

                {/* Candidate Camera Closed Warning Badge on Host screen */}
                {!remoteVideoEnabled && (
                  <div className="px-2.5 py-0.5 rounded-md bg-amber-900/90 backdrop-blur-sm text-[10px] font-bold text-amber-200 flex items-center gap-1.5 border border-amber-500">
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Camera Closed</span>
                  </div>
                )}
              </div>

              {/* Host audio speaking indicator */}
              <div className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-medium flex items-center gap-1.5 border z-10 transition-all ${
                localIsSpeaking 
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400 shadow-md shadow-emerald-500/20' 
                  : 'bg-indigo-950/80 text-indigo-200 border-indigo-500/30'
              }`}>
                <Mic className={`w-3 h-3 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                <span>Interviewer (You) • {localIsSpeaking ? 'Speaking...' : isAudioEnabled ? 'Voice Mic' : 'Muted'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Mic Toggle */}
          <button
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioEnabled
                ? localIsSpeaking 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className={`w-3.5 h-3.5 ${localIsSpeaking ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'}`} />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{isAudioEnabled ? (localIsSpeaking ? 'Microphone Active (Speaking)' : 'Microphone On') : 'Microphone Muted'}</span>
          </button>

          {/* Camera Toggle (Only for Candidate) */}
          {userRole === 'CANDIDATE' && (
            <button
              onClick={toggleVideo}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isVideoEnabled
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isVideoEnabled ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isVideoEnabled ? 'Camera On' : 'Camera Off'}</span>
            </button>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
          {remoteStream ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Voice Connected</span>
            </span>
          ) : (
            <span>{userRole === 'HOST' ? 'Host: Voice Mic' : 'Candidate: Camera + Mic'}</span>
          )}
          <span>•</span>
          <span>WebRTC P2P</span>
        </div>
      </div>
    </div>
  );
};
