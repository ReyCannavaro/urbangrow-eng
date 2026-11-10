"use client";

import React from "react";
import {
  Calendar,
  Sprout,
  Fish,
  Sparkles,
  Droplets,
  TrendingUp,
  Sun,
  Minus,
  Plus,
} from "lucide-react";
import { EcosystemDiagnosticReport, HealthSeverity } from "@/lib/types";
import { useTelemetry } from "@/lib/telemetryContext";

interface HarvestProjectionsSidebarProps {
  diagnostics?: EcosystemDiagnosticReport | null;
  cropDayPakcoy?: number;
  cropDayKangkung?: number;
  onChangeCropDay?: (crop: "pakcoy" | "kangkung", nextDay: number) => void;
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatDateId(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${MONTHS_ID[monthIdx] || parts[1]} ${parts[0]}`;
}

function SeverityPill({ status }: { status: HealthSeverity }) {
  const styles =
    status === "CRITICAL"
      ? "bg-[#FFE4E6] text-[#E11D48]"
      : status === "WARNING"
      ? "bg-[#FEF3C7] text-[#B45309]"
      : "bg-[#DCFCE7] text-[#166534]";

  return (
    <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${styles}`}>
      {status}
    </span>
  );
}

export function HarvestProjectionsSidebar({
  diagnostics,
  cropDayPakcoy = 14,
  cropDayKangkung = 17,
  onChangeCropDay,
}: HarvestProjectionsSidebarProps) {
  const { sensors } = useTelemetry();

  const pakcoy = diagnostics?.predictions.harvest.pakcoy;
  const kangkung = diagnostics?.predictions.harvest.kangkung;
  const trends = diagnostics?.predictions.trends;
  const diag = diagnostics?.diagnosis;

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. Real-time 3-Domain Diagnosis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#DCFCE7] text-[#165B39] flex items-center justify-center shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">
                Diagnosis 3 Domain
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Tumbuhan • Kualitas Air • Ikan
              </p>
            </div>
          </div>
          <SeverityPill status={diagnostics?.overallStatus ?? "OPTIMAL"} />
        </div>

        <div className="space-y-2 text-xs">
          {/* Plant Diagnosis */}
          <div className="p-3 rounded-[18px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                <Sprout className="h-3.5 w-3.5 text-[#165B39]" />
                Tumbuhan (L2 &amp; L4)
              </span>
              <SeverityPill status={diag?.plant.status ?? "OPTIMAL"} />
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {diag?.plant.details[0] ?? "Menunggu sinkronisasi diagnosis tumbuhan..."}
            </p>
          </div>

          {/* Water Diagnosis */}
          <div className="p-3 rounded-[18px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                <Droplets className="h-3.5 w-3.5 text-[#0284C7]" />
                Kualitas Air
              </span>
              <SeverityPill status={diag?.water.status ?? "OPTIMAL"} />
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {diag?.water.details[0] ?? `pH ${sensors.ph.toFixed(2)}, Suhu ${sensors.waterTemperature.toFixed(1)}°C stabil.`}
            </p>
          </div>

          {/* Fish Diagnosis */}
          <div className="p-3 rounded-[18px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                <Fish className="h-3.5 w-3.5 text-[#0284C7]" />
                Ikan (Nila L3 &amp; Lele L1)
              </span>
              <SeverityPill status={diag?.fish.status ?? "OPTIMAL"} />
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              {diag?.fish.details[0] ?? `DO ${sensors.dissolvedOxygen.toFixed(2)} mg/L mencukupi.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Prediksi Air & Gejala Dini */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-bold text-xs text-[#111827]">
              Prediksi Tren &amp; Gejala Air
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#6B7280]">
            {trends?.sampleCount ?? 0} sampel
          </span>
        </div>

        <p className="text-[11px] text-[#4B5563] leading-relaxed">
          {trends?.waterForecast ?? "Menghitung tren perubahan parameter air dari sliding buffer..."}
        </p>

        {trends && (
          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]">
              ΔpH {trends.phDelta >= 0 ? "+" : ""}{trends.phDelta}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]">
              ΔSuhu {trends.waterTempDelta >= 0 ? "+" : ""}{trends.waterTempDelta}°C
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]">
              ΔDO {trends.doDelta >= 0 ? "+" : ""}{trends.doDelta} mg/L
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {(trends?.emergingSymptoms ?? ["Menganalisis potensi gejala awal..."]).map((sym, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-[#FEF3C7]/45 border border-[#F59E0B]/20 text-[11px] text-[#4B5563] leading-relaxed"
            >
              {sym}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Dynamic Harvest Forecast (GDD + Live LDR) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#111827]">
                Proyeksi Panen (GDD + LDR)
              </h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 bg-[#DCFCE7] text-[#166534]">
            <Sun className="h-2.5 w-2.5 text-[#D97706]" />
            {Math.round(sensors.lightIntensity)} lux
          </span>
        </div>

        {/* Kangkung L2 */}
        <div className="p-3.5 rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-[#111827]">
              <Sprout className="h-3.5 w-3.5 text-[#165B39]" />
              Kangkung (L2)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono font-bold text-[10px]">
              {kangkung
                ? kangkung.estimatedDaysRemaining === 0
                  ? "Siap Panen!"
                  : `H-${kangkung.estimatedDaysRemaining} Panen`
                : "..."}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10.5px] font-mono text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <span>HST ke-{cropDayKangkung}</span>
                {onChangeCropDay && (
                  <span className="inline-flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => onChangeCropDay("kangkung", cropDayKangkung - 1)}
                      className="h-4 w-4 rounded bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-[#DCFCE7] cursor-pointer"
                      title="Kurangi umur tanam Kangkung"
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeCropDay("kangkung", cropDayKangkung + 1)}
                      className="h-4 w-4 rounded bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-[#DCFCE7] cursor-pointer"
                      title="Tambah umur tanam Kangkung"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </div>
              <span className="font-bold text-[#166534]">
                {kangkung?.progressPct ?? 0}% GDD
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#165B39] to-[#4EAB7C] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, kangkung?.progressPct ?? 0)}%` }}
              />
            </div>
          </div>

          <p className="text-[10.5px] text-[#4B5563] pt-1 border-t border-[#E5E7EB]/60">
            {kangkung
              ? `Est. ~${kangkung.projectedBiomassGrams}g • Panen ${formatDateId(kangkung.estimatedHarvestDate)}`
              : "Menghitung proyeksi GDD..."}
          </p>
        </div>

        {/* Pakcoy L4 */}
        <div className="p-3.5 rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-[#111827]">
              <Sprout className="h-3.5 w-3.5 text-[#4EAB7C]" />
              Pakcoy (L4)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] font-mono font-bold text-[10px]">
              {pakcoy
                ? pakcoy.estimatedDaysRemaining === 0
                  ? "Siap Panen!"
                  : `H-${pakcoy.estimatedDaysRemaining} Panen`
                : "..."}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10.5px] font-mono text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <span>HST ke-{cropDayPakcoy}</span>
                {onChangeCropDay && (
                  <span className="inline-flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => onChangeCropDay("pakcoy", cropDayPakcoy - 1)}
                      className="h-4 w-4 rounded bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-[#DCFCE7] cursor-pointer"
                      title="Kurangi umur tanam Pakcoy"
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeCropDay("pakcoy", cropDayPakcoy + 1)}
                      className="h-4 w-4 rounded bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-[#DCFCE7] cursor-pointer"
                      title="Tambah umur tanam Pakcoy"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </div>
              <span className="font-bold text-[#166534]">
                {pakcoy?.progressPct ?? 0}% GDD
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4EAB7C] to-[#86EFAC] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, pakcoy?.progressPct ?? 0)}%` }}
              />
            </div>
          </div>

          <p className="text-[10.5px] text-[#4B5563] pt-1 border-t border-[#E5E7EB]/60">
            {pakcoy
              ? `Est. ~${pakcoy.projectedBiomassGrams}g • Panen ${formatDateId(pakcoy.estimatedHarvestDate)} • Ef. Cahaya ${pakcoy.lightEfficiencyPct}%`
              : "Menghitung proyeksi GDD..."}
          </p>
        </div>
      </div>
    </div>
  );
}
