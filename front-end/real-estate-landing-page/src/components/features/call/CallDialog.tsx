"use client";

import { useCall } from "./CallProvider";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CallDialog = () => {
  const {
    callState,
    localStream,
    remoteStream,
    caller,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  } = useCall();
  const title = caller?.fullName || "Unknown Caller";
  const avatar = caller?.avatarUrl || "/default-avatar.png";

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (!mounted || callState === "IDLE" || callState === "ENDED") return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      {/* Incoming Call UI */}
      {callState === "INCOMING" && (
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 shadow-inner">
              <Image
                src={avatar}
                alt={title}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-2 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-white animate-bounce">
              <Phone className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-emerald-600 font-medium">
              Incoming Video Call...
            </p>
          </div>
          <div className="flex items-center gap-8 w-full justify-center">
            <button
              onClick={rejectCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-500 transition-colors duration-300">
                <PhoneOff className="w-6 h-6 text-red-600 group-hover:text-white fill-current" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Decline</span>
            </button>
            <button
              onClick={answerCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300 animate-pulse">
                <Phone className="w-6 h-6 text-emerald-600 group-hover:text-white fill-current" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Accept</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Call (Calling or Connected) */}
      {(callState === "CALLING" || callState === "CONNECTED") && (
        <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          {/* Main Video Area (Remote or Placeholder) */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            {callState === "CONNECTED" && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                  <Image
                    src={avatar}
                    alt={title}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-white text-lg font-medium">
                  {callState === "CALLING" ? "Calling..." : "Connecting..."}
                </p>
              </div>
            )}

            {/* Local Video Overlay (Picture-in-Picture) */}
            <div className="absolute right-4 bottom-24 md:bottom-4 w-32 md:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror-x" // Add mirror class for selfie feel
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar & Info */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-50">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <PhoneOff className="w-6 h-6 fill-current" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-white font-medium text-sm">
              {callState === "CONNECTED" ? "AO:05" : "Calling..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document === "undefined") return null; // SSR check
  return createPortal(content, document.body);
};

export default CallDialog;
