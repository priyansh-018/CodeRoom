import React, { useState, useEffect, useRef } from 'react';
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
  VolumeX,
  EyeOff
} from 'lucide-react';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

interface VideoConferenceProps {
  roomId: string;
  userName: string;
  userRole?: UserRole;
  userAvatar?: string;
  autoRequestMedia?: boolean;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  roomId,
  userName,
  userRole = 'CANDIDATE',
  autoRequestMedia = true
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteParticipantName, setRemoteParticipantName] = useState<string>('');

  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(userRole === 'CANDIDATE');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hasPermissionError, setHasPermissionError] = useState<string | null>(null);

  // Peer's Media State (e.g. Host seeing Candidate's camera/mic toggles)
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState<boolean>(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState<boolean>(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isNegotiatingRef = useRef<boolean>(false);

  const socket = getSocket();

  // Create PeerConnection
  const getOrCreatePeerConnection = () => {
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Attach local media tracks (Candidate has video+audio; Host has audio)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStreamRef.current!);
        } catch (e) {
          console.warn('Track already added', e);
        }
      });
    }

    // Remote Track Handler
    pc.ontrack = (event) => {
      console.log('🎥 Remote track received:', event.track.kind, event.streams);
      const incoming = event.streams[0] || new MediaStream([event.track]);
      setRemoteStream(incoming);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = incoming;
        remoteVideoRef.current.play().catch((e) => console.warn('Autoplay error', e));
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
    };

    pc.onsignalingstatechange = () => {
      if (pc.signalingState === 'stable') {
        isNegotiatingRef.current = false;
      }
    };

    return pc;
  };

  // Candidate initiates offer
  const startCandidateOffer = async (targetSocketId?: string) => {
    if (userRole !== 'CANDIDATE') return;
    if (isNegotiatingRef.current) return;

    try {
      isNegotiatingRef.current = true;
      const pc = getOrCreatePeerConnection();

      if (pc.signalingState !== 'stable') {
        isNegotiatingRef.current = false;
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('webrtc-signal', {
        roomId,
        targetSocketId: targetSocketId || 'broadcast',
        signal: offer,
        senderName: userName,
        senderRole: userRole
      });
    } catch (err) {
      console.error('Candidate offer error:', err);
      isNegotiatingRef.current = false;
    }
  };

  // Initialize Media Stream on mount
  useEffect(() => {
    let isCancelled = false;

    const startMedia = async () => {
      try {
        setHasPermissionError(null);

        const constraints: MediaStreamConstraints = userRole === 'CANDIDATE'
          ? {
              video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
              audio: true
            }
          : {
              video: false,
              audio: true
            };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Attach Candidate's local camera stream
        if (userRole === 'CANDIDATE' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection
        const pc = getOrCreatePeerConnection();

        // Add tracks to PC
        stream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, stream);
          } catch (e) {}
        });

        // Broadcast WebRTC readiness to room
        socket.emit('webrtc-ready', {
          roomId,
          role: userRole,
          name: userName
        });

        // If candidate, send offer after brief delay
        if (userRole === 'CANDIDATE') {
          setTimeout(() => {
            if (!isCancelled) startCandidateOffer();
          }, 500);
        }

      } catch (err: any) {
        if (isCancelled) return;
        console.warn('Camera/Mic permission failed', err);
        setHasPermissionError(
          userRole === 'CANDIDATE'
            ? 'Candidate camera & mic access are required. Please allow permissions in your browser.'
            : 'Microphone not detected. Please allow microphone permissions.'
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
    };
  }, [roomId, userRole]);

  // Keep local stream connected to candidate preview
  useEffect(() => {
    if (localStream && localVideoRef.current && userRole === 'CANDIDATE') {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, userRole]);

  // Keep remote stream connected to host view
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Socket Signaling Listeners
  useEffect(() => {
    const handlePeerReady = (data: { socketId: string; role?: string; name?: string }) => {
      if (data.name) setRemoteParticipantName(data.name);

      if (userRole === 'CANDIDATE') {
        setTimeout(() => startCandidateOffer(data.socketId), 300);
      }
    };

    const handleUserJoined = (data: any) => {
      if (data.user?.socketId && data.user.socketId !== socket.id) {
        if (data.user.name) setRemoteParticipantName(data.user.name);

        if (userRole === 'CANDIDATE') {
          setTimeout(() => startCandidateOffer(data.user.socketId), 300);
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
        // 1. HOST RECEIVES CANDIDATE OFFER -> CREATES ANSWER
        if (data.signal.type === 'offer' && userRole === 'HOST') {
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
        // 2. CANDIDATE RECEIVES HOST ANSWER -> SETS REMOTE DESCRIPTION
        else if (data.signal.type === 'answer' && userRole === 'CANDIDATE') {
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
        console.error('Signal handling error:', err);
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
  }, [roomId, userRole, userName, socket]);

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

  return (
    <div className="flex flex-col bg-[#0d121f] border-b border-white/10 p-3 space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {userRole === 'HOST' 
                ? 'Candidate Live Camera Proctoring Feed' 
                : 'Your Live Camera Stream (Proctoring Active)'}
            </span>
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Video' : 'Minimize Video'}
        >
          {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>
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

                {!isAudioEnabled && (
                  <div className="px-2 py-0.5 rounded-md bg-rose-950/80 backdrop-blur-sm text-[10px] font-bold text-rose-300 flex items-center gap-1 border border-rose-500/40">
                    <MicOff className="w-3 h-3 text-rose-400" />
                    <span>Muted</span>
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
                  <span className="text-[11px] text-slate-400">Negotiating WebRTC stream with candidate</span>
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

              {/* Host audio indicator */}
              <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-indigo-950/80 backdrop-blur-sm text-[10px] font-medium text-indigo-200 flex items-center gap-1.5 border border-indigo-500/30 z-10">
                <Mic className="w-3 h-3 text-emerald-400" />
                <span>Interviewer (You) • Voice Mic</span>
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
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isAudioEnabled ? 'Microphone On' : 'Microphone Muted'}</span>
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
          <span>{userRole === 'HOST' ? 'Host: Voice Mic' : 'Candidate: Camera + Mic'}</span>
          <span>•</span>
          <span>WebRTC P2P</span>
        </div>
      </div>
    </div>
  );
};
