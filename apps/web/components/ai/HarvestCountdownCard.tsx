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
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#F3F4F6] pb-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#165B39]">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold capitalize text-[#111827]">
                Sayuran {cropName}
              </h3>
              <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-semibold text-[#166534]">
                Level {isPakcoy ? "4" : "2"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {growthStage}
              {seedingDate ? ` • Semai ${formatIndonesianDate(seedingDate)}` : ""}
              {typeof daysSincePlanting === "number" ? ` (${daysSincePlanting} HSS)` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#111827]">
            <Calendar className="h-3.5 w-3.5 text-[#165B39]" />
            <span>
              {daysToHarvest === 0 ? "Siap Panen" : `${daysToHarvest} Hari Lagi`}
            </span>
          </div>
          {estimatedHarvestDate && (
            <span className="mt-1 text-[11px] text-[#6B7280]">
              Panen:{" "}
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
          <span className="text-[#6B7280]">Akumulasi Termal GDD</span>
          <span className="font-semibold text-[#111827] num-tabular">
            {accumulatedGdd} / {targetGdd} °C·Hari ({progressPct}%)
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPakcoy ? "bg-[#165B39]" : "bg-[#4EAB7C]"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Clean Hairline 3-Metric Summary */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F3F4F6] text-xs">
        <div>
          <span className="block text-[11px] text-[#6B7280]">Populasi Semai</span>
          <span className="mt-0.5 block text-sm font-bold text-[#111827] num-tabular">
            {plantCount ?? (isPakcoy ? 20 : 24)} netpot
          </span>
          <span className="text-[11px] text-[#6B7280]">Dari benih</span>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <TrendingUp className="h-3 w-3 text-[#165B39]" />
            Proyeksi Panen
          </span>
          <span className="mt-0.5 block text-sm font-bold text-[#165B39] num-tabular">
            {projectedTotalYieldKg ? `~${projectedTotalYieldKg} kg` : `~${projectedBiomassGrams} g`}
          </span>
          <span className="text-[11px] text-[#6B7280]">
            ~{projectedBiomassGrams} g/pod
          </span>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Sun className="h-3 w-3 text-[#165B39]" />
            Fotosintesis
          </span>
          <span className="mt-0.5 block text-sm font-bold text-[#111827] num-tabular">
            {lightEfficiencyPct ?? 90}%
          </span>
          <span className="text-[11px] text-[#6B7280]">Sensor LDR</span>
        </div>
      </div>
    </div>
  );
}
