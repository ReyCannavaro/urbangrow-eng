"use client";

import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Droplets,
  Thermometer,
  Gauge,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AnalyticsBentoRow() {
  const { sensors, systemMeta } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasAnyWaterSensor = hasPh || hasWaterTemp || hasTds;

  const tdsPenalty = hasTds
    ? (sensors.tds as number) < 400
      ? (400 - (sensors.tds as number)) * 0.03
      : (sensors.tds as number) > 800
      ? ((sensors.tds as number) - 800) * 0.03
      : 0
    : 0;
  const wqiScore = hasAnyWaterSensor
    ? Math.max(
        50,
        Math.min(
          98,
          Math.round(
            100 -
              (hasPh ? Math.abs((sensors.ph as number) - 7.0) * 16 : 0) -
              (hasWaterTemp ? Math.abs((sensors.waterTemperature as number) - 24.5) * 2.5 : 0) -
              tdsPenalty
          )
        )
      )
    : null;

  const formattedTemp = hasWaterTemp ? (sensors.waterTemperature as number).toFixed(1) : "--";
  const formattedTDS = hasTds ? Math.round(sensors.tds as number) : "--";
  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";

  const isPhOptimal = hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTempOptimal =
    hasWaterTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 27;
  const isTdsOptimal =
    hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. PINE HERO ANCHOR CARD (Matches Dashboard MetricCardsRow) */}
      <div
        style={{ "--ug-delay": "60ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-[#165B39] hover:bg-[#145233] text-white p-5 shadow-xs flex flex-col justify-between h-[156px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Water Quality Index (WQI)
          </span>
          <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-[#68C194]">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-white">
            {wqiScore !== null ? wqiScore : "--"}
            <span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-medium text-white/90">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                systemMeta.liveSensorCount > 0 ? "bg-[#68C194]" : "bg-white/60"
              }`}
            />
            <span>
              {systemMeta.liveSensorCount > 0
                ? `${systemMeta.edgeNode} • ${systemMeta.liveSensorCount} Live`
                : "Menunggu Data ESP32"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KESTABILAN pH AIR */}
      <div
        style={{ "--ug-delay": "115ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Kestabilan pH Air
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#165B39]">
            <Droplets className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedPH}
            <span className="text-lg font-normal text-[#9CA3AF] ml-1">pH</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium ${
              !hasPh
                ? "bg-[#F3F4F6] text-[#6B7280]"
                : isPhOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            {hasPh ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
            )}
            <span>{!hasPh ? "Sensor pH offline" : "Ideal: 6.5 – 7.5 pH"}</span>
          </div>
        </div>
      </div>

      {/* 3. SUHU AIR KOLAM */}
      <div
        style={{ "--ug-delay": "170ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Suhu Air Kolam
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#165B39]">
            <Thermometer className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedTemp}
            <span className="text-lg font-normal text-[#9CA3AF] ml-0.5">°C</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium ${
              !hasWaterTemp
                ? "bg-[#F3F4F6] text-[#6B7280]"
                : isTempOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            {hasWaterTemp ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
            )}
            <span>
              {!hasWaterTemp ? "Sensor DS18B20 offline" : "Ideal: 22 – 27°C"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. NUTRISI TDS TERLARUT */}
      <div
        style={{ "--ug-delay": "225ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Nutrisi TDS Terlarut
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#165B39]">
            <Gauge className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedTDS}
            <span className="text-lg font-normal text-[#9CA3AF] ml-1">ppm</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium ${
              !hasTds
                ? "bg-[#F3F4F6] text-[#6B7280]"
                : isTdsOptimal
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#FEF3C7] text-[#B45309]"
            }`}
          >
            {hasTds ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
            )}
            <span>
              {!hasTds ? "Sensor TDS offline" : "Target: 400 – 800 ppm"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
