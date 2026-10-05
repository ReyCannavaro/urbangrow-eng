"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

interface ClosedLoopReturnBarProps {
  isPumpOn: boolean;
}

export function ClosedLoopReturnBar({ isPumpOn }: ClosedLoopReturnBarProps) {
  return (
    <div className="rounded-[20px] bg-[var(--bg-charcoal)] text-white p-3.5 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2 text-cyan-300">
        <ArrowUp className="h-4 w-4 animate-pulse" />
        <span>PIPA PVC RESIRKULASI TERTUTUP (SUBMERSIBLE 12V PUMP)</span>
      </div>
      <span className="text-[11px] text-white/60">
        STATUS: {isPumpOn ? "BEROPERASI NORMAL" : "STANDBY"}
      </span>
    </div>
  );
}
