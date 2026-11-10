"use client";

import React from "react";
import { Sprout, Calendar, TrendingUp, Sun } from "lucide-react";
import { formatIndonesianDate } from "../../lib/aiApi";

interface Props {
  cropName: string;
  daysToHarvest: number;
  accumulatedGdd: number;
  targetGdd: number;
  projectedBiomassGrams: number;
  growthStage: string;
  seedingDate?: string;
  daysSincePlanting?: number;
  estimatedHarvestDate?: string;
  plantCount?: number;
  projectedTotalYieldKg?: number;
  lightEfficiencyPct?: number;
}

export function HarvestCountdownCard({
  cropName,
  daysToHarvest,
  accumulatedGdd,
  targetGdd,
  projectedBiomassGrams,
  growthStage,
  seedingDate,
  daysSincePlanting,
  estimatedHarvestDate,
  plantCount,
  projectedTotalYieldKg,
  lightEfficiencyPct,
}: Props) {
  const isPakcoy = cropName.toLowerCase() === "pakcoy";
  const progressPct = Math.min(100, Math.round((accumulatedGdd / Math.max(1, targetGdd)) * 100));

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 transition-colors hover:bg-[#F9FAFB]/40 hover:border-[#D1D5DB]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#F3F4F6] pb-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#165B39]/10 text-[#165B39]">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-base font-bold capitalize text-[#111827]">
                Sayuran {cropName}
              </h3>
              <span className="rounded-full bg-[#165B39]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#165B39]">
                Level {isPakcoy ? "4" : "2"}
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                Benih
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {growthStage}
              {seedingDate ? ` • Semai ${formatIndonesianDate(seedingDate)}` : ""}
              {typeof daysSincePlanting === "number" ? ` (${daysSincePlanting} HSS)` : ""}
            </p>
          </div>
        </div>

        {/* Countdown & Date */}
        <div className="flex shrink-0 flex-col items-end">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#111827]">
            <Calendar className="h-3.5 w-3.5 text-[#165B39]" />
            <span>
              {daysToHarvest === 0 ? "Siap Panen Sekarang" : `${daysToHarvest} Hari Lagi`}
            </span>
          </div>
          {estimatedHarvestDate && (
            <span className="mt-1 text-[11px] font-medium text-[#6B7280]">
              Est. Panen:{" "}
              <strong className="text-[#111827]">
                {formatIndonesianDate(estimatedHarvestDate)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* GDD Progress Bar */}
      <div className="my-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#6B7280]">Akumulasi Termal GDD (Benih → Panen)</span>
          <span className="font-mono font-semibold text-[#111827] tabular-nums">
            {accumulatedGdd} / {targetGdd} °C·Hari ({progressPct}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="h-full rounded-full bg-[#165B39] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 3-Metric Summary */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
          <span className="block text-[11px] text-[#6B7280]">Populasi Semai</span>
          <span className="mt-0.5 block font-mono text-sm font-bold text-[#111827] tabular-nums">
            {plantCount ?? (isPakcoy ? 20 : 24)} netpot
          </span>
          <span className="text-[10px] text-[#6B7280]">Benih langsung</span>
        </div>

        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <TrendingUp className="h-3 w-3 text-[#165B39]" />
            Proyeksi Panen
          </span>
          <span className="mt-0.5 block font-mono text-sm font-bold text-[#165B39] tabular-nums">
            {projectedTotalYieldKg ? `~${projectedTotalYieldKg} kg` : `~${projectedBiomassGrams} g`}
          </span>
          <span className="text-[10px] text-[#6B7280]">
            ~{projectedBiomassGrams} g/pod
          </span>
        </div>

        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Sun className="h-3 w-3 text-amber-500" />
            Fotosintesis
          </span>
          <span className="mt-0.5 block font-mono text-sm font-bold text-[#111827] tabular-nums">
            {lightEfficiencyPct ?? 90}%
          </span>
          <span className="text-[10px] text-[#6B7280]">Sensor LDR</span>
        </div>
      </div>
    </div>
  );
}
