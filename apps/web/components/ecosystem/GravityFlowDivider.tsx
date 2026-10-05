"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

interface GravityFlowDividerProps {
  label: string;
  accentColor?: string;
}

export function GravityFlowDivider({ label, accentColor = "var(--accent-cyan)" }: GravityFlowDividerProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-muted)] py-0.5">
      <ArrowDown className="h-4 w-4 animate-bounce" style={{ color: accentColor }} />
      <span>{label}</span>
    </div>
  );
}
