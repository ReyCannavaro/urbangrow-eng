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
  const { sensors, history, actuators, systemMeta } = useTelemetry();
  const edgeOnline = systemMeta.edgeOnline;

  const hasPh = typeof sensors.ph === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasHumidity = typeof sensors.humidity === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const phStats = computeSensorStats(history, "ph");
  const tdsStats = computeSensorStats(history, "tds");
  const waterTempStats = computeSensorStats(history, "waterTemperature");
  const airTempStats = computeSensorStats(history, "airTemperature");
  const humidityStats = computeSensorStats(history, "humidity");
  const luxStats = computeSensorStats(history, "lightIntensity");

  const hasWaterQualityLive = hasPh || hasTds;
  const hasThermalLive = hasWaterTemp || hasAirTemp || hasHumidity;

  const formattedPh = hasPh ? (sensors.ph as number).toFixed(2) : "--";
  const formattedTds = hasTds ? String(Math.round(sensors.tds as number)) : "--";
  const formattedWaterTemp = hasWaterTemp
    ? (sensors.waterTemperature as number).toFixed(1)
    : "--";
  const formattedAirTemp = hasAirTemp
    ? (sensors.airTemperature as number).toFixed(1)
    : "--";
  const formattedHumidity = hasHumidity
    ? String(Math.round(sensors.humidity as number))
    : "--";
  const formattedLux = hasLux
    ? String(Math.round(sensors.lightIntensity as number))
    : "--";

  const luxBarPct = hasLux
    ? Math.max(0, Math.min(100, Math.round(((sensors.lightIntensity as number) / 2500) * 100)))
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#111827] tracking-tight">
          Ringkasan Statistik 6 Sensor ESP32
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Nilai terkini dan statistik min/rata-rata/maks aktual dari sensor pH, TDS, DS18B20, DHT22, dan LDR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: KUALITAS AIR (PROBE pH & TDS) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Droplets className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Kualitas Air
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  hasWaterQualityLive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {hasWaterQualityLive ? "Live" : "Offline"}
              </span>
            </div>

            <div className="space-y-3 divide-y divide-[#F3F4F6]">
              {/* pH Sensor */}
              <div className="pb-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Sensor pH Air
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF]">
                    Ideal 6.5–7.5
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

              {/* TDS Sensor */}
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Sensor TDS Nutrisi
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF]">
                    Ideal 400–800
                  </span>
                </div>
                <div className="text-2xl font-bold tracking-tight num-tabular text-[#111827] mt-0.5">
                  {formattedTds}
                  <span className="text-sm font-normal text-[#9CA3AF] ml-1">ppm</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-[#6B7280] num-tabular mt-1.5">
                  <span>Min: {tdsStats ? Math.round(tdsStats.min) : "--"}</span>
                  <span>Avg: {tdsStats ? Math.round(tdsStats.avg) : "--"}</span>
                  <span>Max: {tdsStats ? Math.round(tdsStats.max) : "--"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Diukur langsung oleh probe pH air dan sensor TDS analog pada sirkulasi kolam.
          </div>
        </div>

        {/* CARD 2: SUHU AIR & IKLIM MIKRO (DS18B20 & DHT22) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Thermometer className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Suhu &amp; Iklim Mikro
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  hasThermalLive
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {hasThermalLive ? "Live" : "Offline"}
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">
                    Suhu Air (DS18B20)
                  </span>
                  <span className="text-sm font-bold text-[#111827] num-tabular">
                    {formattedWaterTemp} °C
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] num-tabular mt-0.5">
                  {waterTempStats
                    ? `Buffer: ${waterTempStats.min.toFixed(1)}–${waterTempStats.max.toFixed(1)}°C (avg ${waterTempStats.avg.toFixed(1)}°C)`
                    : "Menunggu sampel DS18B20"}
                </div>
              </div>

              <div className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">
                    Suhu Udara (DHT22)
                  </span>
                  <span className="text-sm font-bold text-[#111827] num-tabular">
                    {formattedAirTemp} °C
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] num-tabular mt-0.5">
                  {airTempStats
                    ? `Buffer: ${airTempStats.min.toFixed(1)}–${airTempStats.max.toFixed(1)}°C (avg ${airTempStats.avg.toFixed(1)}°C)`
                    : "Menunggu sampel DHT22"}
                </div>
              </div>

              <div className="pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280]">
                    Kelembaban (DHT22)
                  </span>
                  <span className="text-sm font-bold text-[#111827] num-tabular">
                    {formattedHumidity} %
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] num-tabular mt-0.5">
                  {humidityStats
                    ? `Buffer: ${Math.round(humidityStats.min)}–${Math.round(humidityStats.max)}% (avg ${Math.round(humidityStats.avg)}%)`
                    : "Menunggu sampel DHT22"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Pembacaan suhu air DS18B20 dan suhu/kelembaban udara sekitar dari DHT22.
          </div>
        </div>

        {/* CARD 3: INTENSITAS CAHAYA (SENSOR LDR) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Cahaya (LDR)
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  !hasLux
                    ? "bg-[#F3F4F6] text-[#6B7280]"
                    : (sensors.lightIntensity as number) >= 300
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                {!hasLux
                  ? "Offline"
                  : (sensors.lightIntensity as number) >= 300
                  ? "Terang"
                  : "Redup"}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight num-tabular text-[#111827]">
                {formattedLux}
                <span className="text-lg font-normal text-[#9CA3AF] ml-1">lux</span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {hasLux
                  ? (sensors.lightIntensity as number) >= 300
                    ? "Memenuhi ambang ≥ 300 lux"
                    : "Di bawah ambang 300 lux"
                  : "Menunggu data sensor LDR dari ESP32"}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-[#165B39] rounded-full transition-all duration-300"
                  style={{ width: `${luxBarPct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Min–Maks (LDR)</div>
                  <div className="font-semibold text-[#111827] num-tabular">
                    {luxStats
                      ? `${Math.round(luxStats.min)}–${Math.round(luxStats.max)} lux`
                      : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Grow Light</div>
                  <div className="font-semibold text-[#111827]">
                    {!edgeOnline
                      ? actuators.growLight?.isOn
                        ? "Antrean ON"
                        : "Offline"
                      : actuators.growLight?.isOn
                      ? "Aktif (85W)"
                      : "Standby"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Sensor cahaya LDR memantau intensitas pencahayaan area tanam (target ≥ 300 lux).
          </div>
        </div>
      </div>
    </div>
  );
}
