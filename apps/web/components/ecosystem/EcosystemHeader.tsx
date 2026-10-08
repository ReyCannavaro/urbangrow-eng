"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Waves, Droplets, CheckCircle2, Sliders } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function EcosystemHeader() {
  const { actuators, sensors } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;

  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
                Aliran Kaskade 4-Baris & Kolam Bersekat
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                Hardware Twin • Skala 1:1
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Arsitektur fisik nyata: Pompa 12V mengangkat air ke Area Hidroponik (2 Baris Pakcoy + 2 Baris Kangkung), lalu gravitasi mengalirkan air kembali ke Bak Kolam 2 Sekat (Nila & Lele).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Flow Badges & Quick Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/20 text-[11px] font-mono font-semibold text-[#166534] shadow-2xs">
          <Waves className="h-3.5 w-3.5" />
          <span>{isPumpOn ? "Resirkulasi Aktif • 1.8 L/min" : "Sirkulasi Terhenti"}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#111827] shadow-2xs">
          <Droplets className="h-3.5 w-3.5 text-[#0284C7]" />
          <span>DO Kolam: <strong>{formattedDO} mg/L</strong></span>
        </div>

        <Link
          href="/controls"
          className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
          title="Buka Kontrol Relay"
        >
          <Sliders className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
