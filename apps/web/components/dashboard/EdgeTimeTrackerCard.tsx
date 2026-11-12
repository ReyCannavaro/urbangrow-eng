"use client";

import React, { useState, useEffect } from "react";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function EdgeTimeTrackerCard() {
  const { actuators, backendConnected, systemMeta } = useTelemetry();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const edgeOnline = backendConnected && systemMeta.edgeOnline;

  useEffect(() => {
    if (!edgeOnline || !isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [edgeOnline, isRunning]);

  const totalWatts = edgeOnline
    ? Object.values(actuators).reduce(
        (acc, a) => acc + (a.isOn ? a.powerWatts : 0),
        0
      )
    : 0;

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-[24px] bg-wavy-ribbon text-white p-5 shadow-sm flex flex-col justify-between h-[300px]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#68C194]">
            IoT Edge Node Runtime
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono font-medium text-white/80 truncate max-w-[140px]">
            {systemMeta.edgeNode || "ESP32-GROW-01"}
          </span>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">
          {edgeOnline
            ? systemMeta.liveSensorCount > 0
              ? `Sinkronisasi ESP32 Live (${systemMeta.liveSensorCount}/4 Sensor Fisik)`
              : "ESP32 Terhubung (Heartbeat Saja)"
            : backendConnected
            ? "Maaf, alat sedang offline"
            : "Menghubungkan ke Backend VPS..."}
        </p>
      </div>

      {/* Large Digital Clock */}
      <div className="my-auto py-2 text-center">
        <div
          className={`text-4xl font-bold tracking-tight font-mono num-tabular drop-shadow-sm ${
            edgeOnline ? "text-white" : "text-white/45"
          }`}
        >
          {edgeOnline ? formatTime(seconds) : "--:--:--"}
        </div>
        <div
          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/10 text-[11px] font-mono ${
            edgeOnline ? "text-[#68C194]" : "text-white/65"
          }`}
        >
          <Zap
            className={`h-3.5 w-3.5 ${
              edgeOnline ? "text-[#FACC15]" : "text-white/40"
            }`}
          />
          <span>
            {edgeOnline
              ? `${totalWatts} Watt • ${
                  typeof systemMeta.wifiSignalDbm === "number"
                    ? `WiFi ${systemMeta.wifiSignalDbm} dBm`
                    : "HTTPS Sync Aktif"
                }`
              : "Daya: -- • Maaf, alat sedang offline"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          disabled={!edgeOnline}
          className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${
            edgeOnline
              ? "bg-white text-[#111827] border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer"
              : "bg-white/15 text-white/40 border-white/15 cursor-not-allowed"
          }`}
          title={
            !edgeOnline
              ? "ESP32 offline"
              : isRunning
              ? "Jeda Timer"
              : "Lanjutkan Timer"
          }
        >
          {isRunning && edgeOnline ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSeconds(0)}
          disabled={!edgeOnline}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
            edgeOnline
              ? "bg-[#E11D48] text-white hover:bg-[#BE123C] cursor-pointer"
              : "bg-white/15 text-white/40 cursor-not-allowed"
          }`}
          title="Reset Waktu Siklus"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
