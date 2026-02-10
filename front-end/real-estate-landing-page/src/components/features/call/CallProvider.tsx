"use client";

import { useSocket } from "@/components/features/message/services/socket-context";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import CallDialog from "./CallDialog";

type CallState = "IDLE" | "CALLING" | "INCOMING" | "CONNECTED" | "ENDED";

interface CallContextType {
  callState: CallState;
  caller: any;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initiateCall: (targetUserId: string, targetUserInfo: any) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [callState, setCallState] = useState<CallState>("IDLE");
  const [caller, setCaller] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const targetUserIdRef = useRef<string | null>(null);
  const pendingOfferRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setCallState("IDLE");
    setCaller(null);
    targetUserIdRef.current = null;
    pendingOfferRef.current = null;
    setRemoteStream(null);
  }, []);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  };

  const createPeerConnection = (targetUserId: string) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("call:signal", {
          targetUserId,
          signal: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    peerRef.current = peer;
    return peer;
  };

  const initiateCall = async (targetUserId: string, targetUserInfo: any) => {
    cleanupCall(); // Ensure cleanup before start

    const stream = await getLocalStream();
    if (!stream) {
      alert("Cannot access camera/microphone");
      return;
    }

    setCallState("CALLING");
    setCaller(targetUserInfo);
    targetUserIdRef.current = targetUserId;

    const peer = createPeerConnection(targetUserId);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket?.emit("call:initiate", {
      targetUserId,
      callerInfo: {}, // Backend attaches sender info
      signal: { type: "offer", sdp: offer },
    });
  };

  const answerCall = async () => {
    if (!targetUserIdRef.current || !pendingOfferRef.current) return;

    const stream = await getLocalStream();
    if (!stream) {
      alert("Cannot access camera/microphone");
      return;
    }

    const peer = createPeerConnection(targetUserIdRef.current);

    // Set Remote Description (Offer)
    await peer.setRemoteDescription(
      new RTCSessionDescription(pendingOfferRef.current.sdp),
    );

    // Create Answer
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket?.emit("call:answer", {
      targetUserId: targetUserIdRef.current,
      signal: { type: "answer", sdp: answer },
    });

    setCallState("CONNECTED");

    // Process queued candidates if any (advanced implementation needed for robustness)
  };

  const rejectCall = () => {
    if (targetUserIdRef.current && socket) {
      socket.emit("call:reject", { targetUserId: targetUserIdRef.current });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (targetUserIdRef.current && socket) {
      socket.emit("call:end", { targetUserId: targetUserIdRef.current });
    }
    cleanupCall();
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsAudioEnabled((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoEnabled((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: any) => {
      console.log("Incoming call:", data);
      const { from, signal } = data;
      // If already in call, auto reject? For MVP, we overwrite or ignore.
      if (callState !== "IDLE") {
        socket.emit("call:reject", { targetUserId: from._id || from.id });
        return;
      }

      setCaller(from);
      targetUserIdRef.current = from._id || from.id; // Ensure consistent ID
      pendingOfferRef.current = signal;
      setCallState("INCOMING");
    };

    const handleAnswered = async (data: any) => {
      console.log("Call answered:", data);
      const { signal } = data;
      if (peerRef.current && signal?.sdp) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.sdp),
        );
        setCallState("CONNECTED");
      }
    };

    const handleRejected = (data: any) => {
      console.log("Call rejected");
      alert("Call declined");
      cleanupCall();
    };

    const handleEnded = (data: any) => {
      console.log("Call ended remotely");
      cleanupCall();
    };

    const handleSignal = async (data: any) => {
      const { signal } = data;
      if (!peerRef.current) return;

      try {
        if (signal.type === "candidate" && signal.candidate) {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(signal.candidate),
          );
        } else if (signal.type === "answer" && signal.sdp) {
          if (peerRef.current.signalingState !== "stable") {
            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription(signal.sdp),
            );
          }
        }
      } catch (e) {
        console.error("Error handling signal:", e);
      }
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:answered", handleAnswered);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);
    socket.on("call:signal", handleSignal);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:answered", handleAnswered);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
      socket.off("call:signal", handleSignal);
    };
  }, [socket, callState, cleanupCall]);

  const value: CallContextType = {
    callState,
    caller,
    localStream,
    remoteStream,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      <CallDialog />
    </CallContext.Provider>
  );
};
