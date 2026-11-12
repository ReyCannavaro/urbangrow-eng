"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  Upload,
  Sparkles,
} from "lucide-react";
import type { AgriBotImageAttachment } from "@/lib/types";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (attachment: AgriBotImageAttachment) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current video tracks safely
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Request camera stream based on selected facingMode
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    setIsLoading(true);
    setError(null);
    setCapturedDataUrl(null);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Browser Anda tidak mendukung akses kamera langsung (WebRTC). Gunakan opsi aplikasi kamera bawaan."
      );
      setIsLoading(false);
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Izin kamera ditolak oleh browser. Silakan izinkan akses kamera di pengaturan browser, atau gunakan kamera bawaan."
        );
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("Perangkat kamera tidak ditemukan pada sistem ini.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Tidak dapat mengakses kamera. Pastikan kamera tidak sedang dipakai aplikasi lain."
        );
      }
    }
  }, [stream]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      void startCamera(facingMode);
    } else {
      stopTracks();
      setCapturedDataUrl(null);
      setError(null);
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode, startCamera, stopTracks]);

  // Attach stream to video element whenever video element or stream updates
  useEffect(() => {
    if (videoRef.current && stream && !capturedDataUrl) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedDataUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Shutter action: capture current frame from video to canvas
  const handleShutter = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 160);

    // If using user (front) camera, mirror it horizontally so it feels natural
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Compress to high quality JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedDataUrl(dataUrl);

    // Pause tracks while previewing to save battery/CPU
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
    }
  };

  // Retake photo: resume camera
  const handleRetake = () => {
    setCapturedDataUrl(null);
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      void startCamera(facingMode);
    }
  };

  // Flip camera (environment <-> user)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    void startCamera(nextMode);
  };

  // Confirm photo: convert to AgriBotImageAttachment and pass to parent
  const handleConfirmPhoto = () => {
    if (!capturedDataUrl) return;

    const base64 = capturedDataUrl.split(",")[1] || "";
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);

    const attachment: AgriBotImageAttachment = {
      name: `kamera-diagnosa-${timestamp}.jpg`,
      mimeType: "image/jpeg",
      data: base64,
      previewUrl: capturedDataUrl,
    };

    stopTracks();
    onCapture(attachment);
    onClose();
  };

  // Native mobile camera input fallback
  const handleNativeFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      const attachment: AgriBotImageAttachment = {
        name: file.name || "kamera-hp.jpg",
        mimeType: file.type || "image/jpeg",
        data: base64,
        previewUrl: result,
      };
      stopTracks();
      onCapture(attachment);
      onClose();
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = "";
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Modal Kamera Diagnosa AgriBot"
    >
      {/* Hidden native input fallback with capture="environment" */}
      <input
        ref={nativeFallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFallbackChange}
        className="hidden"
      />

      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0F172A]/90 text-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#165B39] text-[#DCFCE7] flex items-center justify-center shrink-0">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Foto Diagnosa AgriBot</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-[#4EAB7C]">
                  <Sparkles className="h-3 w-3" />
                  Live AI Vision
                </span>
              </h3>
              <p className="text-[11px] text-white/60">
                Arahkan kamera ke daun pakcoy, kangkung, atau sisik ikan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Flip camera button (if live) */}
            {!capturedDataUrl && !error && !isLoading && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={`Ganti kamera (${facingMode === "environment" ? "Belakang" : "Depan"})`}
                aria-label="Ganti kamera depan atau belakang"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                stopTracks();
                onClose();
              }}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup kamera"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-black overflow-hidden flex items-center justify-center">
          {/* Flash animation layer */}
          <div
            className={`absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150 ${
              isFlashing ? "opacity-90" : "opacity-0"
            }`}
          />

          {/* Loading State */}
          {isLoading && !error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0F172A] text-white">
              <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-[#4EAB7C] animate-spin" />
              <p className="text-xs text-white/70 font-mono">
                Menginisialisasi sensor kamera...
              </p>
            </div>
          )}

          {/* Error / Fallback State */}
          {error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center bg-[#0F172A] text-white">
              <div className="h-11 w-11 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="max-w-md space-y-1.5">
                <p className="text-xs text-rose-300 font-medium leading-relaxed">
                  {error}
                </p>
                <p className="text-[11px] text-white/50">
                  Anda tetap bisa mengambil foto menggunakan kamera bawaan ponsel Anda di bawah:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => nativeFallbackInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#165B39] hover:bg-[#145032] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Buka Kamera HP</span>
                </button>
                <button
                  type="button"
                  onClick={() => void startCamera(facingMode)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Coba Lagi</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Video Stream */}
          {!capturedDataUrl && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isLoading || error ? "opacity-0" : "opacity-100"
                } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />

              {/* Viewfinder Target Reticle & Framing Corners */}
              {!isLoading && !error && (
                <div className="absolute inset-6 sm:inset-10 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-[#4EAB7C] rounded-tl-md" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-[#4EAB7C] rounded-tr-md" />
                  </div>

                  {/* Center Target Crosshair */}
                  <div className="self-center flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-full border border-dashed border-white/40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#4EAB7C]" />
                    </div>
                    <span className="text-[10px] font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Fokuskan Daun / Ikan
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-[#4EAB7C] rounded-bl-md" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-[#4EAB7C] rounded-br-md" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedDataUrl && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedDataUrl}
                alt="Pratinjau Hasil Foto Kamera"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10.5px] font-mono backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4EAB7C]" />
                Foto Berhasil Dijepret
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-5 py-4 bg-[#0F172A] border-t border-white/10 flex items-center justify-between gap-3">
          {!capturedDataUrl ? (
            <>
              {/* Fallback to Native Camera button */}
              <button
                type="button"
                onClick={() => nativeFallbackInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium border border-white/10 transition cursor-pointer"
                title="Gunakan aplikasi kamera ponsel"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kamera Bawaan HP</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={isLoading || !!error}
                onClick={handleShutter}
                className="h-15 w-15 rounded-full border-4 border-white bg-[#165B39] hover:bg-[#145032] active:scale-95 disabled:opacity-40 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer disabled:cursor-not-allowed mx-auto"
                aria-label="Ambil foto sekarang"
                title="Jepret foto"
              >
                <div className="h-10 w-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  stopTracks();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-full text-white/70 hover:text-white text-xs font-medium hover:bg-white/10 transition cursor-pointer"
              >
                Batal
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              {/* Retake Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Foto Ulang</span>
              </button>

              {/* Confirm / Use Photo Button */}
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#165B39] hover:bg-[#145032] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

