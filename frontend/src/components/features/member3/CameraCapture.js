"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, FlipHorizontal, X, ZapOff, Sparkles } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async (mode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
          setError(null);
        };
      }
    } catch {
      setIsReady(false);
      setError("Camera access was denied or is not supported. Please allow camera permissions and try again.");
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function init() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isCancelled) {
              setIsReady(true);
              setError(null);
            }
          };
        }
      } catch {
        if (!isCancelled) {
          setIsReady(false);
          setError("Camera access was denied or is not supported. Please allow camera permissions and try again.");
        }
      }
    }

    init();

    return () => {
      isCancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  const flipCamera = () => setFacingMode((m) => (m === "user" ? "environment" : "user"));

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        const preview = canvas.toDataURL("image/jpeg");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file, preview);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base block">Capture Specimen</span>
              <span className="text-xs text-zinc-400">Medicinal leaf live viewfinder</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Close camera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6 py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                <ZapOff className="h-8 w-8" />
              </div>
              <div className="max-w-md">
                <p className="text-base font-bold text-red-400">Camera Unavailable</p>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">{error}</p>
              </div>
              <button
                onClick={() => startCamera(facingMode)}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 transition-all cursor-pointer"
              >
                Retry Access
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {isReady && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Outer dimmed mask */}
                  <div className="absolute inset-6 sm:inset-10 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />

                  {/* Corner marks */}
                  <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-md" />
                  <div className="absolute top-8 right-8 sm:top-12 sm:right-12 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-md" />
                  <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-md" />
                  <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-md" />

                  {/* Instruction tag */}
                  <div className="absolute top-9 sm:top-14 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Align leaf inside the reticle
                  </div>
                </div>
              )}

              {!isReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80">
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
                  <span className="text-xs text-zinc-400 font-medium">Initializing camera stream...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 bg-zinc-900 border-t border-zinc-800">
          <button
            onClick={flipCamera}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
            title="Switch front/rear camera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>

          <button
            onClick={capture}
            disabled={!isReady}
            className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-emerald-400 bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 cursor-pointer"
            title="Capture photo"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-colors" />
          </button>

          <div className="w-12" />
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
