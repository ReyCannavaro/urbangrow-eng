"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0 shadow-2xs"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Kontrol Relay &amp; Aktuator
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Kelola target saklar relay, proteksi interlock, dan jadwal otomasi node {edgeNode}.
          </p>
        </div>
      </div>

      {/* Honest Live Connection & Relay Summary Badges */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0 font-mono text-[11px]">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold ${
            edgeOnline
              ? "bg-[#DCFCE7] border-[#166534]/15 text-[#166534]"
              : "bg-white border-[#E5E7EB] text-[#4B5563]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              edgeOnline ? "bg-[#165B39]" : "bg-[#9CA3AF]"
            }`}
          />
          <span>{edgeOnline ? `${edgeNode} Online` : "ESP32 Offline"}</span>
        </div>

        <div
          className={`px-3 py-1.5 rounded-full border font-semibold ${
            edgeOnline
              ? "bg-[#DCFCE7]/70 border-[#166534]/15 text-[#166534]"
              : "bg-white border-[#E5E7EB] text-[#6B7280]"
          }`}
        >
          {edgeOnline ? (
            <>
              Est. Beban: <strong>{totalLoadWatts}W</strong>
            </>
          ) : (
            <span>Daya: --</span>
          )}
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827]">
          {edgeOnline ? (
            <>
              Aktif: <strong>{activeCount}/{totalCount} ON</strong>
            </>
          ) : (
            <>
              Terhubung: <strong>0/{totalCount}</strong>
              <span className="text-[#6B7280] ml-1.5">• {queuedCount} Antrean</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
