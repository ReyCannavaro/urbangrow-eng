"use client";

import React from "react";
import Link from "next/link";
import { useTelemetry } from "@/lib/telemetryContext";

export function EcosystemHeader() {
  const { actuators, systemMeta } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const edgeOnline = systemMeta.edgeOnline;

  return (
    <section
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Menara Kaskade 4-Tingkat
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Aliran sirkulasi tertutup: Pompa 12V dari Kolam Ikan &rarr; Pakcoy &rarr; Kangkung &rarr; turun kembali ke Kolam Ikan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${
            !edgeOnline
              ? "bg-white border-[#E5E7EB] text-[#6B7280]"
              : isPumpOn
              ? "bg-[#DCFCE7] border-[#166534]/15 text-[#166534]"
              : "bg-[#FEF3C7] border-[#B45309]/20 text-[#B45309]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              !edgeOnline
                ? "bg-[#9CA3AF]"
                : isPumpOn
                ? "bg-[#165B39]"
                : "bg-[#B45309]"
            }`}
          />
          <span>
            {!edgeOnline
              ? "ESP32 Offline"
              : isPumpOn
              ? "Pompa Sirkulasi ON"
              : "Sirkulasi Terhenti"}
          </span>
        </span>

        <Link
          href="/controls"
          className="px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
        >
          Kontrol Relay &rarr;
        </Link>
      </div>
    </section>
  );
}
