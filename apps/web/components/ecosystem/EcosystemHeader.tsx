"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function EcosystemHeader() {
  const { actuators, sensors } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : sensors.ph;
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;

  return (
    <div
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              Menara Kaskade 4-Tingkat &amp; Polikultur Hidrodinamika
            </h1>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Arsitektur gravitasi 4-level bertingkat: Pompa 12V mengangkat air nutrisi ke Level 4 (Pakcoy), mengalir pasif ke Level 3 (Nila) &rarr; Level 2 (Kangkung Biofilter) &rarr; Level 1 (Lele &amp; Sump Tank).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Flow Badges & Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0 font-mono text-[11px]">
        <div className="px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/15 font-semibold text-[#166534]">
          {isPumpOn ? "Resirkulasi 1.8 L/min" : "Sirkulasi Terhenti"}
        </div>

        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827]">
          pH {formattedPH} &bull; {formattedTemp}°C
        </div>

        <Link
          href="/controls"
          className="px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[#111827] font-semibold hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors text-xs font-sans"
        >
          Kontrol Relay &rarr;
        </Link>
      </div>
    </div>
  );
}
