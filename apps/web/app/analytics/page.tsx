"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsBentoRow } from "@/components/analytics/AnalyticsBentoRow";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { ScientificInsightsGrid } from "@/components/analytics/ScientificInsightsGrid";
import { RevealOnView } from "@/components/motion/RevealOnView";

export default function AnalyticsPage() {
  const { history, sensors, backendConnected, systemMeta } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasHumidity = typeof sensors.humidity === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const sensorRows = [
    {
      label: "pH Air (Probe pH)",
      measured: hasPh ? `${(sensors.ph as number).toFixed(2)} pH` : "-- pH",
      ideal: "Ideal: 6.5–7.5 pH",
      live: hasPh,
      ok: hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5,
      warnLabel: "Di Luar Rentang",
    },
    {
      label: "TDS Nutrisi (Sensor TDS)",
      measured: hasTds ? `${Math.round(sensors.tds as number)} ppm` : "-- ppm",
      ideal: "Ideal: 400–800 ppm",
      live: hasTds,
      ok: hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800,
      warnLabel: "Di Luar Rentang",
    },
    {
      label: "Suhu Air Kolam (DS18B20)",
      measured: hasWaterTemp
        ? `${(sensors.waterTemperature as number).toFixed(1)} °C`
        : "-- °C",
      ideal: "Ideal: 22–27 °C",
      live: hasWaterTemp,
      ok:
        hasWaterTemp &&
        (sensors.waterTemperature as number) >= 22 &&
        (sensors.waterTemperature as number) <= 27,
      warnLabel: "Di Luar Rentang",
    },
    {
      label: "Suhu Udara (DHT22)",
      measured: hasAirTemp
        ? `${(sensors.airTemperature as number).toFixed(1)} °C`
        : "-- °C",
      ideal: "Ideal: 23–32 °C",
      live: hasAirTemp,
      ok:
        hasAirTemp &&
        (sensors.airTemperature as number) >= 23 &&
        (sensors.airTemperature as number) <= 32,
      warnLabel: "Di Luar Rentang",
    },
    {
      label: "Kelembaban Udara (DHT22)",
      measured: hasHumidity
        ? `${Math.round(sensors.humidity as number)} %`
        : "-- %",
      ideal: "Ideal: 55–80 %",
      live: hasHumidity,
      ok:
        hasHumidity &&
        (sensors.humidity as number) >= 55 &&
        (sensors.humidity as number) <= 80,
      warnLabel: "Di Luar Rentang",
    },
    {
      label: "Intensitas Cahaya (LDR)",
      measured: hasLux ? `${Math.round(sensors.lightIntensity as number)} lux` : "-- lux",
      ideal: "Target: ≥ 300 lux",
      live: hasLux,
      ok: hasLux && (sensors.lightIntensity as number) >= 300,
      warnLabel: "Redup",
    },
  ];

  const liveSensorCount = sensorRows.filter((row) => row.live).length;

  return (
    <div className="space-y-6">
      <AnalyticsHeader />

      {/* Dashboard-Matched Pine + White 4-Card KPI Row */}
      <AnalyticsBentoRow />

      {/* Hero Interactive Spline Time-Series Chart */}
      <RevealOnView delayMs={0}>
        <TimeSeriesChart
          history={history}
          sensors={sensors}
          edgeOnline={systemMeta.edgeOnline}
          liveSensorCount={systemMeta.liveSensorCount}
        />
      </RevealOnView>

      {/* Lower Sensor Statistics & 6-Sensor Threshold Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <ScientificInsightsGrid />
        </div>

        <div className="lg:col-span-5 space-y-4">
          {/* 6 Physical ESP32 Sensors Checklist Card */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-bold text-[#111827]">
                Status 6 Sensor Fisik ESP32
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  liveSensorCount === 0
                    ? "bg-[#F3F4F6] text-[#6B7280]"
                    : "bg-[#DCFCE7] text-[#166534]"
                }`}
              >
                {liveSensorCount === 0 ? "Offline" : `${liveSensorCount}/6 Live`}
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              {sensorRows.map((row) => (
                <div
                  key={row.label}
                  className="py-2.5 first:pt-3 last:pb-0 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-[#111827] block truncate">
                      {row.label}
                    </span>
                    <span className="text-[11px] text-[#6B7280] num-tabular">
                      {row.measured} &bull; {row.ideal}
                    </span>
                  </div>
                  <span
                    className={`font-semibold shrink-0 ${
                      !row.live
                        ? "text-[#6B7280]"
                        : row.ok
                        ? "text-[#166534]"
                        : "text-[#B45309]"
                    }`}
                  >
                    {!row.live ? "Offline" : row.ok ? "Normal" : row.warnLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Status Card (Matches Dashboard EdgeTimeTrackerCard .bg-wavy-ribbon) */}
          <div className="rounded-[24px] bg-wavy-ribbon text-white p-5 shadow-xs space-y-2.5">
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                <span className="font-semibold text-[#68C194]">
                  Pipeline Telemetri
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    backendConnected && systemMeta.edgeOnline
                      ? "text-[#68C194]"
                      : "text-white/75"
                  }`}
                >
                  {backendConnected
                    ? systemMeta.edgeOnline
                      ? `ESP32 Live (${systemMeta.edgeNode})`
                      : "API Live • ESP32 Offline"
                    : "Menyambung API..."}
                </span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                Telemetri 6 sensor dikirim dari {systemMeta.edgeNode} via HTTPS ke backend ElysiaJS dan disimpan pada buffer SQLite ({history.length} sampel aktif).
              </p>

              <div className="pt-1 flex items-center justify-between text-xs">
                <Link
                  href="/ecosystem"
                  className="font-semibold text-[#68C194] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Lihat Menara Kaskade</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] text-white/50">
                  HTTPS &bull; WebSocket
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
