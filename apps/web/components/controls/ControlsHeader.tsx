"use client";

import React from "react";

interface ControlsHeaderProps {
  edgeOnline: boolean;
  edgeNode: string;
  totalLoadWatts: number;
  activeCount: number;
  queuedCount: number;
  totalCount: number;
}

export function ControlsHeader({
  edgeOnline,
  edgeNode,
  totalLoadWatts,
  activeCount,
  queuedCount,
  totalCount,
}: ControlsHeaderProps) {
  return (
    <section
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Kontrol Relay &amp; Aktuator
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Kelola target saklar relay, proteksi interlock sensor, dan jadwal otomasi node {edgeNode}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px]">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold ${
            edgeOnline
              ? "bg-[#DCFCE7] border-[#166534]/15 text-[#166534]"
              : "bg-white border-[#E5E7EB] text-[#6B7280]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              edgeOnline ? "bg-[#165B39]" : "bg-[#9CA3AF]"
            }`}
          />
          <span>
            {edgeOnline ? `${edgeNode} Online • ${totalLoadWatts}W` : "ESP32 Offline"}
          </span>
        </span>

        <span className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] font-semibold num-tabular">
          {edgeOnline
            ? `Aktif: ${activeCount}/${totalCount}`
            : `Antrean: ${queuedCount}/${totalCount}`}
        </span>
      </div>
    </section>
  );
}
