"use client";

import React from "react";
import Link from "next/link";
import { Check, Waves, Wind, Sun, Zap, Droplets } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function DarkTaskPanel() {
  const { actuators, toggleActuator } = useTelemetry();

  const activeCount = Object.values(actuators).filter((a) => a.isOn).length;
  const totalCount = Object.values(actuators).length;

  return (
    <div className="flex flex-col justify-between h-[320px]">
      {/* Top Header Segment (Matching Crextio Onboarding 18% with small segmented bar) */}
      <div className="flex items-center justify-between pb-2 px-1">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          Otomasi Sistem
        </span>
        <span className="text-sm font-light num-tabular text-[var(--text-primary)]">
          {Math.round((activeCount / totalCount) * 100)}%
        </span>
      </div>

      {/* Mini Segmented Progress Pill */}
      <div className="flex items-center gap-1.5 h-6 mb-3 px-1">
        <div className="h-full px-3 rounded-full bg-[var(--accent-yellow)] text-stone-900 text-[10px] font-mono font-bold flex items-center justify-center">
          {activeCount} Aktif
        </div>
        <div className="h-full px-3 rounded-full bg-[var(--bg-charcoal)] text-white text-[10px] font-mono flex items-center justify-center">
          {totalCount - activeCount} Standby
        </div>
        <div className="h-full flex-1 rounded-full bg-stone-200" />
      </div>

      {/* The Deep Matte Charcoal Card (Matching Crextio Onboarding Task 2/8) */}
      <div className="rounded-[28px] bg-[var(--bg-charcoal)] text-white p-5 shadow-xl flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-charcoal)]">
          <span className="text-xs font-medium text-white/90">
            Status Aktuator & Tugas
          </span>
          <span className="text-base font-light font-mono text-[var(--accent-yellow)]">
            {activeCount}/{totalCount}
          </span>
        </div>

        {/* Task Items List */}
        <div className="space-y-2.5 py-1">
          {/* Item 1: Pompa */}
          <div
            onClick={() => toggleActuator("waterPump")}
            className="flex items-center justify-between gap-3 text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                <Waves className="h-3 w-3" />
              </div>
              <div>
                <div className="font-medium text-[11px] group-hover:text-[var(--accent-yellow)] transition-colors">
                  Pompa Sirkulasi 12V
                </div>
                <div className="text-[9px] text-white/50 font-mono">07:00 • 45 Watt</div>
              </div>
            </div>

            <div
              className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                actuators.waterPump?.isOn
                  ? "bg-[var(--accent-yellow)] text-stone-900"
                  : "border border-white/20"
              }`}
            >
              {actuators.waterPump?.isOn && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </div>
          </div>

          {/* Item 2: Aerator */}
          <div
            onClick={() => toggleActuator("aerator")}
            className="flex items-center justify-between gap-3 text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                <Wind className="h-3 w-3" />
              </div>
              <div>
                <div className="font-medium text-[11px] group-hover:text-[var(--accent-yellow)] transition-colors">
                  Aerator Oksigen Nila
                </div>
                <div className="text-[9px] text-white/50 font-mono">10:30 • 18 Watt</div>
              </div>
            </div>

            <div
              className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                actuators.aerator?.isOn
                  ? "bg-[var(--accent-yellow)] text-stone-900"
                  : "border border-white/20"
              }`}
            >
              {actuators.aerator?.isOn && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </div>
          </div>

          {/* Item 3: Grow Light */}
          <div
            onClick={() => toggleActuator("growLight")}
            className="flex items-center justify-between gap-3 text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                <Sun className="h-3 w-3" />
              </div>
              <div>
                <div className="font-medium text-[11px] group-hover:text-[var(--accent-yellow)] transition-colors">
                  LED Grow Light
                </div>
                <div className="text-[9px] text-white/50 font-mono">17:00 • 85 Watt</div>
              </div>
            </div>

            <div
              className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                actuators.growLight?.isOn
                  ? "bg-[var(--accent-yellow)] text-stone-900"
                  : "border border-white/20"
              }`}
            >
              {actuators.growLight?.isOn && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
