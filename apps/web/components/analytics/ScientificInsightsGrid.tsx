"use client";

import React from "react";
import { CheckCircle2, Thermometer, Sun } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function ScientificInsightsGrid() {
  const { sensors, actuators, systemMeta } = useTelemetry();
  const edgeOnline = systemMeta.edgeOnline;

  const hasPh = typeof sensors.ph === "number";
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasHumidity = typeof sensors.humidity === "number";
  const hasLux = typeof sensors.lightIntensity === "number";
  const hasBiofilter = hasPh || hasWaterTemp || hasTds;

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
      <div>
        <h2 className="text-base font-bold text-[#111827] tracking-tight">
          Korelasi Bioproses &amp; Stabilitas Ekosistem
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Ringkasan efisiensi nitrifikasi, keseimbangan termal iklim mikro, dan kecukupan cahaya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: KONVERSI NITRIFIKASI */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Konversi Nitrifikasi
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  edgeOnline && actuators.waterPump?.isOn
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {!edgeOnline
                  ? "Offline"
                  : actuators.waterPump?.isOn
                  ? "Aktif"
                  : "Terjeda"}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight num-tabular text-[#111827]">
                {totalEfficiency !== null ? totalEfficiency.toFixed(1) : "--"}
                <span className="text-lg font-normal text-[#9CA3AF] ml-0.5">%</span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Perombakan Amonia ke Nitrat (NH3 &rarr; NO3-)
              </p>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>Distribusi Biofilter</span>
                <span className={totalEfficiency !== null ? "text-[#165B39] font-semibold" : "text-[#9CA3AF]"}>
                  {totalEfficiency !== null ? `${nitratePct}% Terserap` : "Menunggu"}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden flex">
                <div
                  className="bg-[#165B39] h-full transition-all duration-300"
                  style={{ width: `${nitratePct}%` }}
                />
                <div
                  className="bg-[#4EAB7C] h-full transition-all duration-300"
                  style={{ width: `${nitrificationPct}%` }}
                />
                <div
                  className="bg-[#CBD5E1] h-full transition-all duration-300"
                  style={{ width: `${residuePct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] num-tabular pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#165B39]" /> Nitrat {totalEfficiency !== null ? `${nitratePct}%` : "--"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4EAB7C]" /> Proses {totalEfficiency !== null ? `${nitrificationPct}%` : "--"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" /> Residu {totalEfficiency !== null ? `${residuePct}%` : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Biofilter Kangkung (L2) dan Pakcoy (L4) menyerap limbah ikan menjadi nutrisi daun berkelanjutan.
          </div>
        </div>

        {/* CARD 2: STABILITAS TERMAL */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Thermometer className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Stabilitas Termal
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
                  airDelta !== null
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {airDelta !== null
                  ? `Δ ${airDelta >= 0 ? `+${airDelta}` : airDelta}°C`
                  : "Offline"}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight num-tabular text-[#111827]">
                {formattedTemp}
                <span className="text-lg font-normal text-[#9CA3AF] ml-0.5">°C</span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {thermalStabilityPct !== null
                  ? `${thermalStabilityPct}% berada di zona nyaman (22–27°C)`
                  : "Menunggu data DS18B20"}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-[#4EAB7C] rounded-full transition-all duration-300"
                  style={{ width: `${thermalStabilityPct ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Suhu Udara</div>
                  <div className="font-semibold text-[#111827] num-tabular">{formattedAirTemp}°C</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Kelembaban</div>
                  <div className="font-semibold text-[#111827] num-tabular">{formattedHumidity}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Resirkulasi air konstan meredam fluktuasi panas harian demi kesehatan kolam Nila dan Lele.
          </div>
        </div>

        {/* CARD 3: INTENSITAS CAHAYA LDR */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#165B39]">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Intensitas Cahaya
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
                  ? "PAR Cukup"
                  : "Redup"}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold tracking-tight num-tabular text-[#111827]">
                {formattedLux}
                <span className="text-lg font-normal text-[#9CA3AF] ml-1">lux</span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {estimatedPpfd !== null
                  ? `Estimasi PPFD ~${estimatedPpfd} µmol/m²/s`
                  : "Menunggu data LDR dari ESP32"}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-[#165B39] rounded-full transition-all duration-300"
                  style={{ width: `${lightEfficiencyPct ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Efisiensi GDD</div>
                  <div className="font-semibold text-[#165B39] num-tabular">
                    {lightEfficiencyPct !== null ? `${lightEfficiencyPct}%` : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#6B7280]">Grow Light</div>
                  <div className="font-semibold text-[#111827]">
                    {!edgeOnline
                      ? "Offline"
                      : actuators.growLight?.isOn
                      ? "85W Aktif"
                      : "Standby"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] leading-relaxed">
            Pembacaan lux memodulasi proyeksi hari panen GDD dan rekomendasi fotoperiode tanaman.
          </div>
        </div>
      </div>
    </div>
  );
}
