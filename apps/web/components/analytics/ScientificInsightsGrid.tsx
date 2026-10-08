"use client";

import React from "react";
import {
  CheckCircle2,
  Thermometer,
  Sun,
  Activity,
  Droplets,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function ScientificInsightsGrid() {
  const { sensors, actuators } = useTelemetry();

  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
            Korelasi Ilmiah & Evaluasi Stabilitas Ekosistem
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Model analitik bioproses: nitrifikasi bakteri, solubilitas oksigen termal, dan asimilasi foton.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#4B5563] shadow-2xs">
          <Sparkles className="h-3 w-3 text-[#165B39]" />
          <span>Biomodel ECAD v2.4</span>
        </span>
      </div>

      {/* 3 Rich Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: INDEKS KONVERSI NITRIFIKASI */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#D1D5DB] transition-colors">
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
                Bakteri Aktif
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                94.2<span className="text-xl font-normal text-[#9CA3AF] ml-0.5">%</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Efisiensi Perombakan Amonia ke Nitrat (NH₃ → NO₃⁻)
              </p>
            </div>

            {/* Multi-segment Nitrogen Cycle Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                <span>Distribusi Kimiawi Nitrogen:</span>
                <span className="text-[#166534] font-bold">94.2% Terserap</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#F3F4F6] overflow-hidden flex">
                <div
                  className="bg-[#10B981] h-full"
                  style={{ width: "94.2%" }}
                  title="Nitrat NO₃⁻ (94.2%)"
                />
                <div
                  className="bg-[#F59E0B] h-full"
                  style={{ width: "3.8%" }}
                  title="Nitrit NO₂⁻ (3.8%)"
                />
                <div
                  className="bg-[#EF4444] h-full"
                  style={{ width: "2.0%" }}
                  title="Amonia NH₃ (2.0%)"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> NO₃⁻ 45.2 mg/L
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" /> NO₂⁻ 0.02 mg/L
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" /> NH₃ 0.04 mg/L
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#4B5563] leading-relaxed">
            Substrat biofilter Kangkung (L2) & Pakcoy (L1) mentransformasi 94% limbah metabolik ikan menjadi nutrisi daun organik tanpa residu racun.
          </div>
        </div>

        {/* CARD 2: KORELASI INVERS SUHU VS OKSIGEN TERLARUT */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#D1D5DB] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                  <Thermometer className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Korelasi Invers Suhu-DO
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[10px] font-mono font-bold text-[#0284C7] whitespace-nowrap shrink-0">
                r = -0.82 (Kuat)
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                -0.82
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Koefisien Korelasi Termal Oksigen (p &lt; 0.001)
              </p>
            </div>

            {/* Thermal vs DO Saturation Gauge Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6B7280]">Saturasi Oksigen Kolam:</span>
                <span className="text-[#0284C7] font-bold">87% dari Batas Jenuh</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full"
                  style={{ width: "87%" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">Suhu Saat Ini</div>
                  <div className="font-bold text-[#111827]">{formattedTemp}°C</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">Kadar Oksigen DO</div>
                  <div className="font-bold text-[#0284C7]">{formattedDO} mg/L</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#4B5563] leading-relaxed">
            Kenaikan suhu air kolam menurunkan kelarutan alami DO. Sistem mempertahankan aerasi venturi aktif sehingga kadar oksigen tetap di atas 7 mg/L.
          </div>
        </div>

        {/* CARD 3: SPEKTRUM PAR & FOTOPERIODE GROW LIGHT */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#D1D5DB] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#111827]">
                  Radiasi Fotosintesis (PAR)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-mono font-bold text-[#D97706]">
                660nm + 450nm
              </span>
            </div>

            {/* KPI Display */}
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
                220<span className="text-xl font-normal text-[#9CA3AF] ml-1">µmol</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Intensitas PPFD Fotosintesis Daun Pakcoy
              </p>
            </div>

            {/* Photoperiod Daily Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6B7280]">Siklus Terang Harian:</span>
                <span className="text-[#D97706] font-bold">14 / 16 Jam (87%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D97706] to-[#FBBF24] rounded-full"
                  style={{ width: "87.5%" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#9CA3AF]">DLI Terakumulasi</div>
                  <div className="font-bold text-[#111827]">12.7 mol/m²/d</div>
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
            Fotoperiode 16 jam dengan rasio spektrum merah-biru memicu laju asimilasi daun Pakcoy hingga +28% lebih pesat tanpa bergantung cuaca luar.
          </div>
        </div>
      </div>
    </div>
  );
}
