"use client";

import React from "react";
import { Fish, Calendar, Ruler, Scale, Waves } from "lucide-react";
import { FishHarvestForecastItem } from "../../lib/types";
import { formatIndonesianDate } from "../../lib/aiApi";

interface FishHarvestCardProps {
  forecast: FishHarvestForecastItem;
}

export function FishHarvestCard({ forecast }: FishHarvestCardProps) {
  const isNila = forecast.species === "nila";

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#F3F4F6] pb-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#165B39]">
            <Fish className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#111827]">
                {isNila ? "Ikan Nila" : "Ikan Lele"}
              </h3>
              <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-semibold text-[#166534]">
                {isNila ? "Kolam Level 3" : "Kolam Level 1"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {forecast.growthStage} &bull; Tebar {formatIndonesianDate(forecast.stockingDate)} ({forecast.daysElapsed} hari)
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#111827]">
            <Calendar className="h-3.5 w-3.5 text-[#165B39]" />
            <span>
              {forecast.estimatedDaysRemaining === 0
                ? "Siap Panen"
                : `${forecast.estimatedDaysRemaining} Hari Lagi`}
            </span>
          </div>
          <span className="mt-1 text-[11px] text-[#6B7280]">
            Panen: <strong className="text-[#111827]">{formatIndonesianDate(forecast.estimatedHarvestDate)}</strong>
          </span>
        </div>
      </div>

      {/* Length Growth Progress */}
      <div className="my-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <Ruler className="h-3.5 w-3.5 text-[#165B39]" />
            Progres Panjang Ikan
          </span>
          <span className="font-semibold text-[#111827] num-tabular">
            {forecast.initialLengthCm} cm &rarr;{" "}
            <span className="text-[#165B39]">
              {forecast.estimatedCurrentLengthCm} cm
            </span>{" "}
            / {forecast.targetHarvestLengthCm} cm ({forecast.progressPct}%)
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isNila ? "bg-[#165B39]" : "bg-[#4EAB7C]"
            }`}
            style={{ width: `${forecast.progressPct}%` }}
          />
        </div>
      </div>

      {/* Clean Hairline 3-Column Metrics */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F3F4F6] text-xs">
        <div>
          <span className="block text-[11px] text-[#6B7280]">Populasi Bibit</span>
          <span className="mt-0.5 block text-sm font-bold text-[#111827] num-tabular">
            {forecast.count} ekor
          </span>
          <span className="text-[11px] text-[#6B7280]">
            +{forecast.dailyGrowthRateCm} cm/hari
          </span>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Scale className="h-3 w-3 text-[#165B39]" />
            Estimasi Panen
          </span>
          <span className="mt-0.5 block text-sm font-bold text-[#165B39] num-tabular">
            ~{forecast.projectedTotalYieldKg} kg
          </span>
          <span className="text-[11px] text-[#6B7280]">
            ~{forecast.projectedWeightPerFishGrams} g/ekor
          </span>
        </div>

        <div>
          <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <Waves className="h-3 w-3 text-[#165B39]" />
            Kelayakan Air
          </span>
          <span className="mt-0.5 block text-sm font-bold text-[#111827] num-tabular">
            {forecast.waterSuitabilityPct}%
          </span>
          <span className="text-[11px] text-[#6B7280]">
            {isNila ? "Suhu & pH Air" : "Adaptif L1"}
          </span>
        </div>
      </div>
    </div>
  );
}
