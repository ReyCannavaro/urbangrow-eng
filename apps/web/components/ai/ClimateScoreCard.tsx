"use client";

import React from "react";
import { ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { ClimateScoreData } from "../../lib/aiApi";

interface Props {
  data: ClimateScoreData;
}

export function ClimateScoreCard({ data }: Props) {
  const score = data.climate_adaptation_score;
  const isHealthy = score >= 75;

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 transition-colors hover:border-[#D1D5DB]">
      <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#165B39]/10 text-[#165B39]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Climate Adaptation Score
            </h3>
            <p className="text-xs text-[#6B7280]">ECAD Resilience Index (0 - 100)</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isHealthy
              ? "border border-[#165B39]/20 bg-[#165B39]/10 text-[#165B39]"
              : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {isHealthy ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {data.resilience_grade}
        </span>
      </div>

      <div className="my-5 flex items-baseline gap-2">
        <span className="font-mono text-5xl font-bold tracking-tight text-[#111827] tabular-nums">
          {score.toFixed(1)}
        </span>
        <span className="text-sm font-medium text-[#6B7280]">/ 100</span>
      </div>

      {/* Sub Scores Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5">
          <span className="text-[#6B7280]">Stabilitas Suhu Air</span>
          <p className="mt-1 font-mono text-base font-bold text-[#165B39] tabular-nums">
            {data.sub_scores.temperature_stability}%
          </p>
        </div>
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5">
          <span className="text-[#6B7280]">Kualitas pH & TDS</span>
          <p className="mt-1 font-mono text-base font-bold text-sky-700 tabular-nums">
            {data.sub_scores.water_quality}%
          </p>
        </div>
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5">
          <span className="text-[#6B7280]">Oksigen Terlarut (DO)</span>
          <p className="mt-1 font-mono text-base font-bold text-indigo-700 tabular-nums">
            {data.sub_scores.dissolved_oxygen}%
          </p>
        </div>
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5">
          <span className="text-[#6B7280]">Fotoperiode LED</span>
          <p className="mt-1 font-mono text-base font-bold text-amber-600 tabular-nums">
            {data.sub_scores.photoperiod_consistency}%
          </p>
        </div>
      </div>
    </div>
  );
}
