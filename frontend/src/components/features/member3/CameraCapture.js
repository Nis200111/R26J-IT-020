"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, FlipHorizontal, X, ZapOff } from "lucide-react";

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
      setIsReady(false);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-zinc-100">Capture Leaf Image</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
              <ZapOff className="h-10 w-10 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {isReady && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 rounded-xl border-2 border-emerald-400/60" />
                  <div
                    className="absolute inset-8 rounded-xl border border-emerald-300/20"
                    style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)" }}
                  />
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-emerald-300 backdrop-blur-sm">
                    Position leaf within the frame
                  </div>
                </div>
              )}
              {!isReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-5 bg-zinc-900">
          <button
            onClick={flipCamera}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
            title="Flip camera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>

          <button
            onClick={capture}
            disabled={!isReady}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-400 bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="h-11 w-11 rounded-full bg-emerald-500" />
          </button>

          <div className="h-11 w-11" />
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
