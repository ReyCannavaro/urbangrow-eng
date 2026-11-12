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
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasAnyWaterSensor = hasPh || hasWaterTemp || hasTds;

  const formattedTemp = hasWaterTemp
    ? (sensors.waterTemperature as number).toFixed(1)
    : "--";
  const formattedTDS = hasTds ? Math.round(sensors.tds as number) : "--";
  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";

  const isPhOptimal =
    hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTempOptimal =
    hasWaterTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 27;
  const isTdsOptimal =
    hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;

  return (
    <div className="space-y-6">
      <AnalyticsHeader />

      {/* Dashboard-Matched Pine + White 4-Card KPI Row */}
      <AnalyticsBentoRow />

      {/* Hero Interactive Spline Time-Series Chart */}
      <RevealOnView delayMs={0}>
        <TimeSeriesChart history={history} sensors={sensors} />
      </RevealOnView>

      {/* Lower Scientific & Audit Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <ScientificInsightsGrid />
        </div>

        <div className="lg:col-span-5 space-y-4">
          {/* Water Chemistry Balance Card */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-bold text-[#111827]">
                Neraca Kimiawi Air (ECAD)
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  !hasAnyWaterSensor
                    ? "bg-[#F3F4F6] text-[#6B7280]"
                    : (!hasPh || isPhOptimal) &&
                      (!hasTds || isTdsOptimal) &&
                      (!hasWaterTemp || isTempOptimal)
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                {!hasAnyWaterSensor
                  ? "Offline"
                  : (!hasPh || isPhOptimal) &&
                    (!hasTds || isTdsOptimal) &&
                    (!hasWaterTemp || isTempOptimal)
                  ? "Stabil"
                  : "Pantau"}
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-3 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#111827] block">
                    pH Buffer Index
                  </span>
                  <span className="text-[11px] text-[#6B7280] num-tabular">
                    Terukur: {formattedPH} pH
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    !hasPh
                      ? "text-[#6B7280]"
                      : isPhOptimal
                      ? "text-[#166534]"
                      : "text-[#B45309]"
                  }`}
                >
                  {!hasPh
                    ? "Sensor Offline"
                    : isPhOptimal
                    ? "Optimal (6.5–7.5)"
                    : "Buffer Check"}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#111827] block">
                    TDS Nutrisi Terlarut
                  </span>
                  <span className="text-[11px] text-[#6B7280] num-tabular">
                    Kepekatan: {formattedTDS} ppm
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    !hasTds
                      ? "text-[#6B7280]"
                      : isTdsOptimal
                      ? "text-[#166534]"
                      : "text-[#B45309]"
                  }`}
                >
                  {!hasTds
                    ? "Sensor Offline"
                    : isTdsOptimal
                    ? "Ideal (400–800)"
                    : "Atur Pakan"}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#111827] block">
                    Suhu Air Kolam (DS18B20)
                  </span>
                  <span className="text-[11px] text-[#6B7280] num-tabular">
                    Temperatur: {formattedTemp} °C
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    !hasWaterTemp
                      ? "text-[#6B7280]"
                      : isTempOptimal
                      ? "text-[#166534]"
                      : "text-[#B45309]"
                  }`}
                >
                  {!hasWaterTemp
                    ? "Sensor Offline"
                    : isTempOptimal
                    ? "Optimal (22–27°C)"
                    : "Pantau Suhu"}
                </span>
              </div>
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
                Data telemetri disinkronkan kontinu dari ESP32 menuju backend ElysiaJS dan disimpan ke buffer SQLite deret waktu.
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
