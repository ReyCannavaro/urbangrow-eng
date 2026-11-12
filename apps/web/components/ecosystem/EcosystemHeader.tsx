"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function EcosystemHeader() {
  const { actuators, sensors, systemMeta } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const edgeOnline = systemMeta.edgeOnline;

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : "--";
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? `${sensors.waterTemperature.toFixed(1)}°C`
      : "--°C";

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
            Menara Kaskade 4-Tingkat
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Arsitektur gravitasi tertutup: Pompa 12V ke Level 4 (Pakcoy) &rarr; Level 3 (Nila) &rarr; Level 2 (Kangkung) &rarr; Level 1 (Lele).
          </p>
        </div>
      </div>

      {/* Real-time Flow Badges & Action */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0 font-mono text-[11px]">
        <div
          className={`px-3 py-1.5 rounded-full border font-semibold ${
            !edgeOnline
              ? "bg-white border-[#E5E7EB] text-[#6B7280]"
              : isPumpOn
              ? "bg-[#DCFCE7] border-[#166534]/15 text-[#166534]"
              : "bg-[#FEF3C7] border-[#B45309]/20 text-[#B45309]"
          }`}
        >
          {!edgeOnline
            ? "ESP32 Offline"
            : isPumpOn
            ? "Resirkulasi 1.8 L/min"
            : "Sirkulasi Terhenti"}
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827]">
          pH {formattedPH} &bull; {formattedTemp}
        </div>

        <Link
          href="/controls"
          className="px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[#111827] font-semibold hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors text-xs font-sans"
        >
          Kontrol Relay &rarr;
        </Link>
      </div>
    </section>
  );
}
