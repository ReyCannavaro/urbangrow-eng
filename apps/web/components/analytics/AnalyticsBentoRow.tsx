"use client";

import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Droplets,
  Thermometer,
  Sun,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AnalyticsBentoRow() {
  const { sensors, systemMeta } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasLux = typeof sensors.lightIntensity === "number";
  const hasAnyWaterSensor = hasPh || hasWaterTemp;

  const wqiScore = hasAnyWaterSensor
    ? Math.max(
        50,
        Math.min(
          98,
          Math.round(
            100 -
              (hasPh ? Math.abs((sensors.ph as number) - 7.0) * 20 : 0) -
              (hasWaterTemp ? Math.abs((sensors.waterTemperature as number) - 24.5) * 3.5 : 0)
          )
        )
      )
    : null;

  const formattedTemp = hasWaterTemp ? (sensors.waterTemperature as number).toFixed(1) : "--";
  const formattedAirTemp = hasAirTemp ? (sensors.airTemperature as number).toFixed(1) : "--";
  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";
  const formattedLux = hasLux ? String(Math.round(sensors.lightIntensity as number)) : "--";

  const isPhOptimal = hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTempOptimal =
    hasWaterTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 27;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. PINE HERO ANCHOR CARD */}
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
                systemMeta.edgeOnline ? "bg-[#68C194]" : "bg-white/60"
              }`}
            />
            <span>
              {systemMeta.edgeOnline
                ? `${systemMeta.edgeNode} • ${systemMeta.liveSensorCount}/4 Sensor Live`
                : "Maaf, alat sedang offline"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KESTABILAN pH AIR (DALAM AIR) */}
      <div
        style={{ "--ug-delay": "115ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#111827] block">
              Kestabilan pH Air
            </span>
            <span className="text-[10px] text-[#6B7280]">Sensor Dalam Air</span>
          </div>
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
            <span>{!hasPh ? "Maaf, alat sedang offline" : "Ideal: 6.5 – 7.5 pH"}</span>
          </div>
        </div>
      </div>

      {/* 3. SUHU AIR KOLAM (DALAM AIR - DS18B20) */}
      <div
        style={{ "--ug-delay": "170ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#111827] block">
              Suhu Air Kolam
            </span>
            <span className="text-[10px] text-[#6B7280]">Sensor Dalam Air (DS18B20)</span>
          </div>
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
              {!hasWaterTemp ? "Maaf, alat sedang offline" : "Ideal: 22 – 27°C"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. SENSOR LUAR AIR: CAHAYA & SUHU UDARA */}
      <div
        style={{ "--ug-delay": "225ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[156px]"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#111827] block">
              Cahaya &amp; Lingkungan
            </span>
            <span className="text-[10px] text-[#6B7280]">Sensor Luar Air (LDR &amp; DHT22)</span>
          </div>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#D97706]">
            <Sun className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {formattedLux}
            <span className="text-lg font-normal text-[#9CA3AF] ml-1">lux</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium ${
              !hasLux && !hasAirTemp
                ? "bg-[#F3F4F6] text-[#6B7280]"
                : "bg-[#DCFCE7] text-[#166534]"
            }`}
          >
            {hasLux || hasAirTemp ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
            )}
            <span>
              {!hasLux && !hasAirTemp
                ? "Maaf, alat sedang offline"
                : hasAirTemp
                ? `Suhu Luar: ${formattedAirTemp}°C`
                : "Cahaya Normal"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
