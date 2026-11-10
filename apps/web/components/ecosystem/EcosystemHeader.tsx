"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Waves, Droplets, Sliders } from "lucide-react";
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
      className="ug-enter bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
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
              Aliran Kaskade 4-Baris &amp; Kolam Bersekat
            </h1>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Arsitektur fisik nyata: Pompa 12V mengangkat air ke Area Hidroponik (2 Baris Pakcoy + 2 Baris Kangkung), lalu gravitasi mengalirkan air kembali ke Bak Kolam 2 Sekat (Nila &amp; Lele).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Flow Badges & Quick Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/15 text-[11px] font-mono font-semibold text-[#166534]">
          <Waves className="h-3.5 w-3.5" />
          <span>{isPumpOn ? "Resirkulasi Aktif • 1.8 L/min" : "Sirkulasi Terhenti"}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#111827]">
          <Droplets className="h-3.5 w-3.5 text-[#0284C7]" />
          <span>
            pH: <strong>{formattedPH}</strong> • <strong>{formattedTemp}°C</strong>
          </span>
        </div>

        <Link
          href="/controls"
          className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
          title="Buka Kontrol Relay"
        >
          <Sliders className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
