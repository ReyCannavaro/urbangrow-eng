"use client";

import React from "react";
import {
  Sparkles,
  Activity,
  Calendar,
  CheckCircle2,
  Sprout,
  AlertTriangle,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { EcosystemDiagnosticReport, HealthSeverity } from "@/lib/types";

interface AgriBotBentoRowProps {
  diagnostics?: EcosystemDiagnosticReport | null;
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatShortDateId(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${MONTHS_ID[monthIdx] || parts[1]} ${parts[0]}`;
}

function getSeverityBadgeClass(status?: HealthSeverity) {
  switch (status) {
    case "CRITICAL":
      return "bg-rose-500/20 text-rose-100 border border-rose-300/30";
    case "WARNING":
      return "bg-amber-400/20 text-amber-100 border border-amber-300/30";
    case "OPTIMAL":
    default:
      return "bg-white/15 text-white border border-white/20";
  }
}

function formatOverallStatus(status?: HealthSeverity) {
  if (status === "CRITICAL") return "Kritis";
  if (status === "WARNING") return "Waspada";
  return "Optimal";
}

export function AgriBotBentoRow({ diagnostics }: AgriBotBentoRowProps) {
  const { sensors } = useTelemetry();

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : sensors.ph;
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;
  const formattedLux =
    typeof sensors.lightIntensity === "number"
      ? Math.round(sensors.lightIntensity)
      : sensors.lightIntensity;

  const overallStatus = diagnostics?.overallStatus ?? "OPTIMAL";
  const plantStatus = diagnostics?.diagnosis.plant.status ?? "OPTIMAL";
  const waterStatus = diagnostics?.diagnosis.water.status ?? "OPTIMAL";
  const fishStatus = diagnostics?.diagnosis.fish.status ?? "OPTIMAL";

  // Dynamic GDD nearest harvest
  const pakcoy = diagnostics?.predictions.harvest.pakcoy;
  const kangkung = diagnostics?.predictions.harvest.kangkung;
  const nearestHarvest =
    pakcoy && kangkung
      ? kangkung.estimatedDaysRemaining <= pakcoy.estimatedDaysRemaining
        ? kangkung
        : pakcoy
      : kangkung || pakcoy || null;

  // Water trend & emerging symptoms
  const trends = diagnostics?.predictions.trends;
  const symptoms = trends?.emergingSymptoms ?? [];
  const hasRealSymptom =
    symptoms.length > 0 && !symptoms[0].toLowerCase().startsWith("tidak ada gejala");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. INVERTED HERO ANCHOR CARD: Status Diagnosis 3 Domain */}
      <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Diagnosis 3-Domain (ECAD)
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
            title="Status Kesehatan Tumbuhan, Air & Ikan"
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {formatOverallStatus(overallStatus)}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded-full ${getSeverityBadgeClass(plantStatus)}`}>
              🌱 {plantStatus === "OPTIMAL" ? "Sehat" : plantStatus}
            </span>
            <span className={`px-2 py-0.5 rounded-full ${getSeverityBadgeClass(waterStatus)}`}>
              💧 {waterStatus === "OPTIMAL" ? "Stabil" : waterStatus}
            </span>
            <span className={`px-2 py-0.5 rounded-full ${getSeverityBadgeClass(fishStatus)}`}>
              🐟 {fishStatus === "OPTIMAL" ? "Aman" : fishStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TELEMETRI AIR & SENSOR CAHAYA LDR */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Telemetri Air &amp; LDR
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Activity className="h-4 w-4 text-[#165B39]" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {formattedPH}
              <span className="text-base font-normal text-[#9CA3AF] ml-1">pH</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#DCFCE7] text-[#166534] border border-[#165B39]/25">
              <Sun className="h-2.5 w-2.5 text-[#D97706]" />
              {formattedLux} lux • LIVE
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>
              DO {formattedDO} mg/L • Suhu {formattedTemp}°C
            </span>
          </div>
        </div>
      </div>

      {/* 3. PROYEKSI PANEN TERDEKAT (DINAMIS GDD + LDR) */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Panen ({nearestHarvest ? `${nearestHarvest.cropType === "kangkung" ? "Kangkung L2" : "Pakcoy L4"}` : "Kangkung L2"})
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Sprout className="h-4 w-4 text-[#D97706]" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {nearestHarvest
              ? nearestHarvest.estimatedDaysRemaining === 0
                ? "Siap!"
                : `H-${nearestHarvest.estimatedDaysRemaining}`
              : "..."}
            {nearestHarvest && nearestHarvest.estimatedDaysRemaining > 0 && (
              <span className="text-lg font-normal text-[#9CA3AF] ml-1">Hari</span>
            )}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#B45309]">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {nearestHarvest
                ? `${formatShortDateId(nearestHarvest.estimatedHarvestDate)} • Cahaya ${nearestHarvest.lightEfficiencyPct}%`
                : "Menghitung GDD & LDR..."}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PREDIKSI GEJALA DINI KONDISI AIR */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Prediksi Gejala Air
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            {hasRealSymptom ? (
              <AlertTriangle className="h-4 w-4 text-[#D97706]" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-[#165B39]" />
            )}
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {hasRealSymptom ? `${symptoms.length}` : "Aman"}
            {hasRealSymptom && (
              <span className="text-base font-normal text-[#9CA3AF] ml-1.5">Sinyal Dini</span>
            )}
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium max-w-full ${
              hasRealSymptom
                ? "bg-[#FEF3C7] text-[#B45309]"
                : "bg-[#DCFCE7] text-[#166534]"
            }`}
          >
            {hasRealSymptom ? (
              <AlertTriangle className="h-3 w-3 shrink-0" />
            ) : (
              <CheckCircle2 className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">
              {trends
                ? `ΔpH ${trends.phDelta >= 0 ? "+" : ""}${trends.phDelta} • ΔDO ${trends.doDelta >= 0 ? "+" : ""}${trends.doDelta}`
                : "Tren biokimia air stabil"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
