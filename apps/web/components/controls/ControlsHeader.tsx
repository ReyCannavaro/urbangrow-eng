"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BatteryCharging } from "lucide-react";

interface ControlsHeaderProps {
  totalLoadWatts: number;
}

export function ControlsHeader({ totalLoadWatts }: ControlsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--border-light)]">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="h-8 w-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Kontrol Sistem & Aktuator
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-10">
          Manajemen saklar relay ESP32 DevKit V1 bertenaga catu daya ganda (Adaptor 12V DC & Baterai 7Ah)
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[var(--border-medium)] text-xs font-mono">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Total Daya: <strong className="text-emerald-700">{totalLoadWatts}W</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
