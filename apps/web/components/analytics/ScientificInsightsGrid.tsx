"use client";

import React from "react";
import { Droplets, Thermometer, Sun } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { HistorySample, SensorKey } from "@/lib/types";

interface SensorWindowStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

function computeSensorStats(
  history: HistorySample[],
  key: SensorKey
): SensorWindowStats | null {
  const values = history
    .map((sample) => sample.sensors[key])
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  if (values.length === 0) return null;

  const total = values.reduce((acc, v) => acc + v, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: total / values.length,
  };
}

export function ScientificInsightsGrid() {
  const { sensors, history } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const phStats = computeSensorStats(history, "ph");
  const waterTempStats = computeSensorStats(history, "waterTemperature");
  const airTempStats = computeSensorStats(history, "airTemperature");
  const luxStats = computeSensorStats(history, "lightIntensity");

  const formattedPh = hasPh ? (sensors.ph as number).toFixed(2) : "--";
  const formattedWaterTemp = hasWaterTemp
    ? (sensors.waterTemperature as number).toFixed(1)
    : "--";
  const formattedAirTemp = hasAirTemp
    ? (sensors.airTemperature as number).toFixed(1)
    : "--";
  const formattedLux = hasLux
    ? String(Math.round(sensors.lightIntensity as number))
    : "--";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#111827] tracking-tight">
          Ringkasan Statistik 4 Sensor Fisik ESP32
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Nilai aktual dan statistik min/rata-rata/maks dari 2 sensor dalam air (pH &amp; Suhu Air DS18B20) dan 2 sensor luar air (Suhu Udara &amp; Cahaya LDR).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: SENSOR DALAM AIR (PROBE pH) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    pH Air Kolam
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Sensor Dalam Air</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  hasPh
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {hasPh ? "Live" : "Offline"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Kadar Keasaman (pH)
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF]">
                    Ideal 6.5–7.5 pH
                  </span>
                </div>
                <div className="text-2xl font-bold tracking-tight num-tabular text-[#111827] mt-0.5">
                  {formattedPh}
                  <span className="text-sm font-normal text-[#9CA3AF] ml-1">pH</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-[#6B7280] num-tabular mt-1.5">
                  <span>Min: {phStats ? phStats.min.toFixed(2) : "--"}</span>
                  <span>Avg: {phStats ? phStats.avg.toFixed(2) : "--"}</span>
                  <span>Max: {phStats ? phStats.max.toFixed(2) : "--"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            {hasPh
              ? "Diukur langsung oleh elektroda probe pH analog yang terendam pada sirkulasi air."
              : "Maaf, alat sedang offline — probe pH dalam mode standby."}
          </div>
        </div>

        {/* CARD 2: SENSOR DALAM AIR (SUHU AIR DS18B20) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Thermometer className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    Suhu Air Kolam
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Sensor Dalam Air (DS18B20)</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  hasWaterTemp
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {hasWaterTemp ? "Live" : "Offline"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Temperatur Air
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF]">
                    Ideal 22–27°C
                  </span>
                </div>
                <div className="text-2xl font-bold tracking-tight num-tabular text-[#111827] mt-0.5">
                  {formattedWaterTemp}
                  <span className="text-sm font-normal text-[#9CA3AF] ml-1">°C</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-[#6B7280] num-tabular mt-1.5">
                  <span>Min: {waterTempStats ? `${waterTempStats.min.toFixed(1)}°C` : "--"}</span>
                  <span>Avg: {waterTempStats ? `${waterTempStats.avg.toFixed(1)}°C` : "--"}</span>
                  <span>Max: {waterTempStats ? `${waterTempStats.max.toFixed(1)}°C` : "--"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            {hasWaterTemp
              ? "Diukur langsung oleh sensor waterproof DS18B20 yang terendam pada kompartemen ikan."
              : "Maaf, alat sedang offline — probe DS18B20 dalam mode standby."}
          </div>
        </div>

        {/* CARD 3: SENSOR LUAR AIR (SUHU UDARA DHT22 & CAHAYA LDR) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    Suhu Udara &amp; Cahaya
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Sensor Luar Air (DHT22 &amp; LDR)</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  hasAirTemp || hasLux
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {hasAirTemp || hasLux ? "Live" : "Offline"}
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">Suhu Udara</span>
                  <span className="text-sm font-bold text-[#111827] num-tabular">
                    {formattedAirTemp} °C
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] num-tabular mt-0.5">
                  {airTempStats
                    ? `Min: ${airTempStats.min.toFixed(1)}°C • Max: ${airTempStats.max.toFixed(1)}°C`
                    : "Ideal 24–32°C"}
                </div>
              </div>

              <div className="pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">Cahaya LDR</span>
                  <span className="text-sm font-bold text-[#111827] num-tabular">
                    {formattedLux} lux
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] num-tabular mt-0.5">
                  {luxStats
                    ? `Min: ${Math.round(luxStats.min)} • Max: ${Math.round(luxStats.max)} lux`
                    : "Target ≥ 300 lux"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            {hasAirTemp || hasLux
              ? "Diukur langsung di luar air oleh sensor mikroklimat DHT22 dan photoresistor LDR."
              : "Maaf, alat sedang offline — sensor luar air dalam mode standby."}
          </div>
        </div>
      </div>
    </div>
  );
}
