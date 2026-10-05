"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function ParameterLollipopChart() {
  const { sensors } = useTelemetry();

  // Weekly historical stability points (S M T W T F S)
  const days = [
    { day: "S", val: 6.88, height: "45%" },
    { day: "M", val: 6.92, height: "65%" },
    { day: "T", val: 6.95, height: "55%" },
    { day: "W", val: 6.91, height: "50%" },
    { day: "T", val: 6.94, height: "70%" },
    { day: "F", val: 7.02, height: "85%", isHighlight: true, badge: `${sensors.ph} pH` },
    { day: "S", val: 6.96, height: "40%" },
  ];

  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-5 shadow-sm h-[320px] flex flex-col justify-between">
      {/* Card Header with Arrow Button */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Stabilitas pH & TDS
        </span>
        <Link
          href="/analytics"
          className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:text-black hover:border-black transition-colors"
          title="Buka Analitik"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metric Readout */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light tracking-tight text-[var(--text-primary)] num-tabular">
            {sensors.ph} <span className="text-lg font-normal text-[var(--text-muted)]">pH</span>
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
          TDS {sensors.tds} ppm • Rentang optimal 6.5 - 7.5
        </div>
      </div>

      {/* Lollipop Bar Chart (Matching Crextio S M T W T F S style) */}
      <div className="pt-2">
        <div className="flex items-end justify-between h-36 px-2 relative">
          {days.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end relative group">
              {/* Highlight Badge above Friday */}
              {item.isHighlight && (
                <div className="absolute -top-3 z-10 px-2 py-0.5 rounded-full bg-[var(--accent-yellow)] text-stone-900 font-mono text-[10px] font-bold shadow-xs whitespace-nowrap">
                  {item.badge}
                </div>
              )}

              {/* Vertical Capsule Bar */}
              <div
                style={{ height: item.height }}
                className={`w-2.5 rounded-full transition-all duration-300 ${
                  item.isHighlight ? "bg-[var(--accent-yellow)]" : "bg-[var(--bg-charcoal)]"
                }`}
              />

              {/* Dot Connector */}
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  item.isHighlight ? "bg-[var(--accent-yellow-deep)]" : "bg-stone-300"
                }`}
              />

              {/* Day Label */}
              <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
