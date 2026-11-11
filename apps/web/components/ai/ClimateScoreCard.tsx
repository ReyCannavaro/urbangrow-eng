"use client";

import React from "react";
import { ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { ClimateScoreData } from "../../lib/aiApi";
import { useTelemetry } from "../../lib/telemetryContext";

interface Props {
  data: ClimateScoreData;
}

export function ClimateScoreCard({ data }: Props) {
  const { sensors } = useTelemetry();
  const score = data.climate_adaptation_score;
  const isHealthy = score >= 75;

  const airTempDiff = Math.abs((sensors.airTemperature ?? 27.2) - 27.0);
  const rhDiff = Math.abs((sensors.humidity ?? 65.0) - 65.0);
  const microClimatePct = Math.round(
    Math.max(55, Math.min(100, 100 - airTempDiff * 4.5 - rhDiff * 0.35))
  );

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 transition-colors hover:bg-[#F9FAFB]/40 hover:border-[#D1D5DB]">
      <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3.5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#165B39] block">
            ECAD Resilience Index (0 - 100)
          </span>
          <h3 className="text-base font-bold text-[#111827] mt-0.5">
            Climate Adaptation Score
          </h3>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
            isHealthy
              ? "border border-[#165B39]/20 bg-[#DCFCE7] text-[#166534]"
              : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
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
          <span className="text-[#6B7280]">Kualitas pH &amp; TDS</span>
          <p className="mt-1 font-mono text-base font-bold text-sky-700 tabular-nums">
            {data.sub_scores.water_quality}%
          </p>
        </div>
        <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5">
          <span className="text-[#6B7280]">Iklim Mikro (DHT22)</span>
          <p className="mt-1 font-mono text-base font-bold text-[#0284C7] tabular-nums">
            {microClimatePct}%
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
