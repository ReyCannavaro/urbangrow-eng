"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Play, Pause, Clock } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function DialGaugeCard() {
  const { sensors } = useTelemetry();
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Compute stroke offset for circular gauge (circumference: 2 * PI * r = 2 * 3.14159 * 42 ≈ 264)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  // Normalized temperature: 20°C to 30°C
  const norm = Math.max(0, Math.min(1, (sensors.waterTemperature - 20) / 10));
  const strokeDashoffset = circumference - norm * (circumference * 0.75);

  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-5 shadow-sm h-[320px] flex flex-col justify-between">
      {/* Card Header with Arrow Button */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Suhu & Oksigen (DO)
        </span>
        <Link
          href="/ecosystem"
          className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:text-black hover:border-black transition-colors"
          title="Lihat Aliran Oksigen"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Circular Dial Gauge (Matching Crextio Time Tracker Yellow Arc) */}
      <div className="relative flex items-center justify-center py-2">
        <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
          {/* Dashed outer ticks */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />

          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />

          {/* Sunlit Butter Yellow Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--accent-yellow)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Readouts */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-light tracking-tight text-[var(--text-primary)] num-tabular">
            {sensors.waterTemperature}<span className="text-sm font-normal text-[var(--text-muted)]">°C</span>
          </span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">
            DO {sensors.dissolvedOxygen} mg/L
          </span>
        </div>
      </div>

      {/* Bottom Action Controls (Matching Crextio Play/Pause & Clock Button) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:border-black transition-colors cursor-pointer"
            title={isLiveActive ? "Jeda Stream" : "Mulai Stream"}
          >
            {isLiveActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {isLiveActive ? "Stream 2s" : "Paused"}
          </span>
        </div>

        <button
          className="h-8 w-8 rounded-full bg-[var(--bg-charcoal)] text-white flex items-center justify-center shadow-xs"
          title="Timer Resirkulasi"
        >
          <Clock className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
