"use client";

import React, { useState, useEffect } from "react";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function EdgeTimeTrackerCard() {
  const { actuators, backendConnected } = useTelemetry();
  const [seconds, setSeconds] = useState(5048); // 01:24:08 baseline
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const totalWatts = Object.values(actuators).reduce(
    (acc, a) => acc + (a.isOn ? a.powerWatts : 0),
    0
  );

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
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#68C194]">
            IoT Edge Node Runtime
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono font-medium text-white/80">
            ESP32 DevKit V1
          </span>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">
          Siklus operasional kontinu mikrokontroler
        </p>
      </div>

      {/* Large Digital Clock (Matching Donezo 01:24:08) */}
      <div className="my-auto py-2 text-center">
        <div className="text-4xl font-bold tracking-tight font-mono text-white num-tabular drop-shadow-sm">
          {formatTime(seconds)}
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/10 text-[11px] font-mono text-[#68C194]">
          <Zap className="h-3.5 w-3.5 text-[#FACC15]" />
          <span>{totalWatts} Watt Aktif • WiFi -56 dBm</span>
        </div>
      </div>

      {/* Control Buttons (Matching Donezo Pause + Stop buttons) */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {/* Pause/Play Button (White circle) */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="h-10 w-10 rounded-full bg-white text-[#111827] flex items-center justify-center shadow-md hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
          title={isRunning ? "Jeda Timer" : "Lanjutkan Timer"}
        >
          {isRunning ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Reset / Stop Button (Red circle) */}
        <button
          onClick={() => setSeconds(0)}
          className="h-10 w-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-md hover:bg-[#BE123C] active:scale-95 transition-all cursor-pointer"
          title="Reset Waktu Siklus"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
