"use client";

import React from "react";
import {
  CheckCircle2,
  Thermometer,
  Sun,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function ScientificInsightsGrid() {
  const { sensors, actuators } = useTelemetry();

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasHumidity = typeof sensors.humidity === "number";
  const hasLux = typeof sensors.lightIntensity === "number";
  const hasBiofilter = hasPh || hasWaterTemp || hasTds;

  // Compute live nitrification efficiency strictly when live ECAD sensors exist
  const phDeviation = hasPh ? Math.abs((sensors.ph as number) - 7.0) : 0;
  const tempDeviation = hasWaterTemp
    ? Math.abs((sensors.waterTemperature as number) - 25.0)
    : 0;
  const pumpPenalty = actuators.waterPump?.isOn ? 0 : 8.5;
  const totalEfficiency = hasBiofilter
    ? Number(
        Math.max(
          62,
          Math.min(
            98.5,
            97.2 - phDeviation * 5.2 - Math.max(0, tempDeviation - 2) * 1.6 - pumpPenalty
          )
        ).toFixed(1)
      )
    : null;
  const nitrateRatio =
    hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800
      ? 0.768
      : 0.72;
  const nitratePct =
    totalEfficiency !== null ? Number((totalEfficiency * nitrateRatio).toFixed(1)) : 0;
  const nitrificationPct =
    totalEfficiency !== null ? Number((totalEfficiency - nitratePct).toFixed(1)) : 0;
  const residuePct =
    totalEfficiency !== null ? Number((100 - totalEfficiency).toFixed(1)) : 0;

  const formattedTemp = hasWaterTemp ? (sensors.waterTemperature as number).toFixed(1) : "--";
  const formattedAirTemp = hasAirTemp ? (sensors.airTemperature as number).toFixed(1) : "--";
  const formattedHumidity = hasHumidity ? Math.round(sensors.humidity as number) : "--";
  const formattedLux = hasLux ? Math.round(sensors.lightIntensity as number) : "--";

  // Thermal buffer score centered at 24.5°C across ECAD window [22, 27]
  const thermalStabilityPct = hasWaterTemp
    ? Math.round(
        Math.max(
          45,
          Math.min(100, 100 - Math.abs((sensors.waterTemperature as number) - 24.5) * 8)
        )
      )
    : null;
  const airDelta =
    hasAirTemp && hasWaterTemp
      ? Number(((sensors.airTemperature as number) - (sensors.waterTemperature as number)).toFixed(1))
      : null;

  const lightEfficiencyPct = !hasLux
    ? null
    : (sensors.lightIntensity as number) >= 1200
    ? 100
    : (sensors.lightIntensity as number) >= 500
    ? 90
    : (sensors.lightIntensity as number) >= 250
    ? 78
    : 62;
  const estimatedPpfd = hasLux
    ? Math.round((sensors.lightIntensity as number) * 0.0185)
    : null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
            Korelasi Ilmiah &amp; Evaluasi Stabilitas Ekosistem
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Model analitik bioproses: nitrifikasi bakteri, keseimbangan termal iklim mikro, dan asimilasi foton.
          </p>
        </div>
      </div>

      {/* 3 Rich Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: INDEKS KONVERSI NITRIFIKASI (Synced live with BiofilterDonutCard) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Konversi Nitrifikasi
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534] whitespace-nowrap shrink-0">
                {actuators.waterPump?.isOn ? "Biofilter Aktif" : "Sirkulasi Terjeda"}
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                {totalEfficiency !== null ? totalEfficiency.toFixed(1) : "--"}
                <span className="text-xl font-normal text-[#9CA3AF] ml-0.5">%</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Efisiensi Perombakan Amonia ke Nitrat (NH₃ → NO₃⁻)
              </p>
            </div>

            {/* Multi-segment Nitrogen Cycle Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                <span>Distribusi Biofilter Nitrogen:</span>
                <span className="text-[#166534] font-bold">
                  {totalEfficiency !== null ? `${nitratePct}% Terserap` : "Menunggu Sensor"}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#F3F4F6] overflow-hidden flex">
                <div
                  className="bg-[#165B39] h-full transition-all duration-300"
                  style={{ width: `${nitratePct}%` }}
                  title={`Nitrat NO₃⁻ (${nitratePct}%)`}
                />
                <div
                  className="bg-[#4EAB7C] h-full transition-all duration-300"
                  style={{ width: `${nitrificationPct}%` }}
                  title={`Nitrifikasi (${nitrificationPct}%)`}
                />
                <div
                  className="bg-[#CBD5E1] h-full transition-all duration-300"
                  style={{ width: `${residuePct}%` }}
                  title={`Residu (${residuePct}%)`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#165B39]" /> Nitrat{" "}
                  {totalEfficiency !== null ? `${nitratePct}%` : "--"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4EAB7C]" /> Proses{" "}
                  {totalEfficiency !== null ? `${nitrificationPct}%` : "--"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" /> Residu{" "}
                  {totalEfficiency !== null ? `${residuePct}%` : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#4B5563] leading-relaxed">
            Substrat biofilter Kangkung (B 3-4) &amp; Pakcoy (B 1-2) menyerap limbah metabolik ikan menjadi nutrisi organik berkelanjutan.
          </div>
        </div>

        {/* CARD 2: KESEIMBANGAN TERMAL & IKLIM MIKRO (DS18B20 + DHT22) */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                  <Thermometer className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Stabilitas Termal &amp; Iklim
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[10px] font-mono font-bold text-[#0284C7] whitespace-nowrap shrink-0">
                {airDelta !== null
                  ? `Δ ${airDelta >= 0 ? `+${airDelta}` : airDelta}°C Udara-Air`
                  : "Sensor Offline"}
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                {formattedTemp}
                <span className="text-xl font-normal text-[#9CA3AF] ml-0.5">°C</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {thermalStabilityPct !== null
                  ? `Indeks Keseimbangan Suhu Kolam (${thermalStabilityPct}% Zona Nyaman)`
                  : "Menunggu data suhu air DS18B20 dari ESP32"}
              </p>
            </div>

            {/* Thermal Stability Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6B7280]">Buffer Termal Ikan &amp; Tanaman:</span>
                <span className="text-[#0284C7] font-bold">
                  {thermalStabilityPct !== null ? `${thermalStabilityPct}% Optimal` : "--"}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                  style={{ width: `${thermalStabilityPct ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">Suhu Udara (DHT22)</div>
                  <div className="font-bold text-[#111827]">{formattedAirTemp}°C</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">Kelembaban RH</div>
                  <div className="font-bold text-[#0284C7]">{formattedHumidity}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#4B5563] leading-relaxed">
            Resirkulasi air konstan membantu meredam lonjakan panas harian sehingga suhu kolam Nila &amp; Lele tetap stabil di rentang 22–27°C.
          </div>
        </div>

        {/* CARD 3: SPEKTRUM PAR & CAHAYA LDR LIVE */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Intensitas Cahaya (LDR)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3F4F6] text-[#4B5563]">
                {!hasLux
                  ? "Sensor Offline"
                  : (sensors.lightIntensity as number) >= 300
                  ? "PAR Cukup"
                  : "Butuh Grow Light"}
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                {formattedLux}
                <span className="text-xl font-normal text-[#9CA3AF] ml-1">lux</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {estimatedPpfd !== null
                  ? `Estimasi PPFD Fotosintesis ~${estimatedPpfd} µmol/m²/s`
                  : "Menunggu data cahaya LDR dari ESP32"}
              </p>
            </div>

            {/* Photosynthetic Light Efficiency */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6B7280]">Efisiensi Fotosintesis (GDD):</span>
                <span className="text-[#D97706] font-bold">
                  {lightEfficiencyPct !== null ? `${lightEfficiencyPct}% Optimal` : "--"}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                  style={{ width: `${lightEfficiencyPct ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">Sumber Sensor</div>
                  <div className="font-bold text-[#111827]">
                    {hasLux ? "ADC Live ESP32" : "Menunggu ESP32"}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">LED Array Status</div>
                  <div className="font-bold text-[#166534]">
                    {actuators.growLight?.isOn ? "85W Aktif" : "Mati (Standby)"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#4B5563] leading-relaxed">
            Pembacaan lux dari sensor LDR langsung memodulasi estimasi hari panen GDD dan peringatan etiolasi daun oleh AgriBot AI.
          </div>
        </div>
      </div>
    </div>
  );
}
