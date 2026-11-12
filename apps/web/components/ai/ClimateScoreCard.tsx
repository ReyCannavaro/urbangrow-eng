"use client";

import React from "react";
import { ClimateScoreData } from "../../lib/aiApi";
import { useTelemetry } from "../../lib/telemetryContext";

interface Props {
  data: ClimateScoreData;
}

export function ClimateScoreCard({ data }: Props) {
  const { sensors } = useTelemetry();
  const score = data.climate_adaptation_score;
  const isOffline =
    score === null || data.offline || data.resilience_grade === "OFFLINE";
  const isHealthy = typeof score === "number" && score >= 75;

  const hasMicroClimate =
    typeof sensors.airTemperature === "number" ||
    typeof sensors.humidity === "number";
  const airTempDiff =
    typeof sensors.airTemperature === "number"
      ? Math.abs(sensors.airTemperature - 27.0)
      : 0;
  const rhDiff =
    typeof sensors.humidity === "number"
      ? Math.abs(sensors.humidity - 65.0)
      : 0;
  const microClimatePct = hasMicroClimate
    ? Math.round(
        Math.max(55, Math.min(100, 100 - airTempDiff * 4.5 - rhDiff * 0.35))
      )
    : null;

  const formatSubScore = (val: number | null) =>
    typeof val === "number" ? `${val}%` : "--%";

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3.5">
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Climate Adaptation Score
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Indeks ketahanan ekosistem terhadap iklim mikro (0–100)
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isOffline
              ? "bg-[#F3F4F6] text-[#6B7280]"
              : isHealthy
              ? "bg-[#DCFCE7] text-[#166534]"
              : "bg-[#FEF3C7] text-[#B45309]"
          }`}
        >
          {isOffline ? "Offline" : data.resilience_grade}
        </span>
      </div>

      <div className="my-5 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-[#111827] num-tabular">
          {typeof score === "number" ? score.toFixed(1) : "--"}
        </span>
        <span className="text-sm font-medium text-[#6B7280]">/ 100</span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F3F4F6] text-xs">
        <div>
          <span className="text-[#6B7280]">Stabilitas Suhu Air</span>
          <p className="mt-0.5 text-base font-bold text-[#165B39] num-tabular">
            {formatSubScore(data.sub_scores.temperature_stability)}
          </p>
        </div>
        <div>
          <span className="text-[#6B7280]">Kualitas pH &amp; TDS</span>
          <p className="mt-0.5 text-base font-bold text-[#111827] num-tabular">
            {formatSubScore(data.sub_scores.water_quality)}
          </p>
        </div>
        <div>
          <span className="text-[#6B7280]">Iklim Mikro (DHT22)</span>
          <p className="mt-0.5 text-base font-bold text-[#165B39] num-tabular">
            {formatSubScore(microClimatePct)}
          </p>
        </div>
        <div>
          <span className="text-[#6B7280]">Fotoperiode LDR</span>
          <p className="mt-0.5 text-base font-bold text-[#111827] num-tabular">
            {formatSubScore(data.sub_scores.photoperiod_consistency)}
          </p>
        </div>
      </div>
    </div>
  );
}
