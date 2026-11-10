"use client";

import React from "react";
import {
  Sprout,
  Fish,
  Waves,
  ArrowDown,
  Zap,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { RevealOnView } from "@/components/motion/RevealOnView";

export function PhysicalSystemOverview() {
  const { sensors, actuators, toggleActuator } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : sensors.ph;
  const formattedTDS =
    typeof sensors.tds === "number" ? Math.round(sensors.tds) : sensors.tds;
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;
  const isPhOptimal = sensors.ph >= 6.5 && sensors.ph <= 7.5;
  const isTdsOptimal = sensors.tds >= 400 && sensors.tds <= 800;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. 4-METRIC BENTO ROW
          =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. HERO INVERTED CARD: Laju Alir Resirkulasi */}
        <div
          style={{ "--ug-delay": "60ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-[#165B39] hover:bg-[#145233] text-white p-5 shadow-xs flex flex-col justify-between h-[170px] relative overflow-hidden transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">
              Laju Alir Resirkulasi
            </span>
            <div
              className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39]"
              title="Debit Pompa Lift"
            >
              <Waves className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-white">
              {isPumpOn ? "1.8" : "0.0"}
              <span className="text-xl font-normal text-white/80 ml-1">L/min</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
              <TrendingUp className="h-3 w-3 text-[#68C194]" />
              <span>{isPumpOn ? "+4.2% Debit Gravitasi Konstan" : "Pompa Lift Terhenti"}</span>
            </div>
          </div>
        </div>

        {/* 2. KAPASITAS NETPOT HIDROPONIK */}
        <div
          style={{ "--ug-delay": "115ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Total Kapasitas Netpot
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <Sprout className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              220
              <span className="text-xl font-normal text-[#9CA3AF] ml-1">Pot</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
              <CheckCircle2 className="h-3 w-3" />
              <span>120 Pakcoy • 100 Kangkung</span>
            </div>
          </div>
        </div>

        {/* 3. POPULASI POLIKULTUR IKAN */}
        <div
          style={{ "--ug-delay": "170ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Populasi Polikultur Ikan
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <Fish className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              205
              <span className="text-xl font-normal text-[#9CA3AF] ml-1">Ekor</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[10px] font-medium text-[#0369A1]">
              <ShieldCheck className="h-3 w-3" />
              <span>85 Nila Merah • 120 Lele L1</span>
            </div>
          </div>
        </div>

        {/* 4. EFISIENSI SIRKULASI TERTUTUP */}
        <div
          style={{ "--ug-delay": "225ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Efisiensi Sirkulasi Air
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              98.4
              <span className="text-xl font-normal text-[#9CA3AF] ml-1">%</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#92400E]">
              <Sparkles className="h-3 w-3" />
              <span>Zero Synthetic Chemicals</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. DECK ATAS: AREA HIDROPONIK (4 BARIS TALANG)
          =================================================================== */}
      <RevealOnView delayMs={0}>
        <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center font-bold">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#111827]">
                    Deck Atas: Talang Hidroponik 4-Baris
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#165B39] text-white font-mono text-[10px] font-bold whitespace-nowrap shrink-0">
                    NFT &amp; Biofilter
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Pompa 12V mengangkat air ke Baris 1 &amp; 2 (Pakcoy), lalu air melimpah gravitasi ke Baris 3 &amp; 4 (Kangkung)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-bold">
                KEMIRINGAN 3% • PANJANG 120 CM
              </span>
            </div>
          </div>

          {/* 4 Distinct Plant Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BARIS 1: PAKCOY CANOPY A (Inlet Primer) */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#165B39] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      BARIS 1 • INLET
                    </span>
                    <h3 className="text-sm font-bold text-[#111827]">
                      Pakcoy Super Green (Canopy A)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                    pH: {formattedPH}
                  </span>
                </div>

                {/* Stat Chips Row */}
                <div className="grid grid-cols-3 gap-2 my-3.5">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Kapasitas</div>
                    <div className="text-xs font-bold text-[#111827] num-tabular">60 Netpot</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Umur Tanam</div>
                    <div className="text-xs font-bold text-[#111827] num-tabular">14 Hari</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Sistem Alir</div>
                    <div className="text-xs font-bold text-[#165B39]">NFT Film Tipis</div>
                  </div>
                </div>

                {/* Vegetative Progress Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-[#4B5563]">Fase Kanopi Vegetatif</span>
                    <span className="font-bold text-[#165B39]">50% (14 / 28 Hari)</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#165B39] rounded-full w-1/2 transition-all duration-500" />
                  </div>
                </div>
              </div>

              {/* Tactical hardware role note */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#4B5563] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#165B39]" />
                  Menerima semburan pertama pompa lift 12V
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">Akar Terbuka</span>
              </div>
            </div>

            {/* BARIS 2: PAKCOY CANOPY B (Asimilasi Nitrat) */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#4EAB7C] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      BARIS 2 • KASKADE
                    </span>
                    <h3 className="text-sm font-bold text-[#111827]">
                      Pakcoy Kembang (Canopy B)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                    Nitrat: Optimal
                  </span>
                </div>

                {/* Stat Chips Row */}
                <div className="grid grid-cols-3 gap-2 my-3.5">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Kapasitas</div>
                    <div className="text-xs font-bold text-[#111827] num-tabular">60 Netpot</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Est. Panen</div>
                    <div className="text-xs font-bold text-[#165B39] num-tabular">10 Hari Lagi</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Serapan Daun</div>
                    <div className="text-xs font-bold text-[#111827]">+3.8 mg/d</div>
                  </div>
                </div>

                {/* Chlorophyll Saturation Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-[#4B5563]">Saturasi Klorofil Daun</span>
                    <span className="font-bold text-[#4EAB7C]">65% Matang</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EAB7C] rounded-full w-[65%] transition-all duration-500" />
                  </div>
                </div>
              </div>

              {/* Tactical hardware role note */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#4B5563] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4EAB7C]" />
                  Limpahan air Baris 1 mengalir bebas ke Baris 2
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">Zero Pupuk Kimia</span>
              </div>
            </div>

            {/* BARIS 3: KANGKUNG BIOFILTER A (Media Hydroton) */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#D97706] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      BARIS 3 • HYDROTON
                    </span>
                    <h3 className="text-sm font-bold text-[#111827]">
                      Kangkung Biofilter (Akar Masif A)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                    Bakteri: 96%
                  </span>
                </div>

                {/* Stat Chips Row */}
                <div className="grid grid-cols-3 gap-2 my-3.5">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Kapasitas</div>
                    <div className="text-xs font-bold text-[#111827] num-tabular">50 Netpot</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Substrat</div>
                    <div className="text-xs font-bold text-[#D97706]">Clay Hydroton</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Koloni Aktif</div>
                    <div className="text-xs font-bold text-[#111827]">Nitrosomonas</div>
                  </div>
                </div>

                {/* Biofilter Activity Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-[#4B5563]">Efisiensi Oksidasi Amonia</span>
                    <span className="font-bold text-[#D97706]">85% Konversi</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D97706] rounded-full w-[85%] transition-all duration-500" />
                  </div>
                </div>
              </div>

              {/* Tactical hardware role note */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#4B5563] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
                  Pori hydroton mengubah amonia ikan menjadi nitrat
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">Biologis Murni</span>
              </div>
            </div>

            {/* BARIS 4: KANGKUNG BIOFILTER B (Polishing & Gravitasi) */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/60 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#165B39] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      BARIS 4 • POLISHING
                    </span>
                    <h3 className="text-sm font-bold text-[#111827]">
                      Kangkung Air Jernih (Canopy B)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                    Air Jernih 99%
                  </span>
                </div>

                {/* Stat Chips Row */}
                <div className="grid grid-cols-3 gap-2 my-3.5">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Kapasitas</div>
                    <div className="text-xs font-bold text-[#111827] num-tabular">50 Netpot</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Siap Panen</div>
                    <div className="text-xs font-bold text-[#165B39] num-tabular">4 Hari Lagi</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Filtrasi Padat</div>
                    <div className="text-xs font-bold text-[#111827]">Maksimal</div>
                  </div>
                </div>

                {/* Water Polishing Clarity Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-[#4B5563]">Tingkat Kejernihan Effluent</span>
                    <span className="font-bold text-[#165B39]">92% Siap Kolam</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#165B39] rounded-full w-[92%] transition-all duration-500" />
                  </div>
                </div>
              </div>

              {/* Tactical hardware role note */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#4B5563] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#165B39]" />
                  Perakaran masif menjernihkan air sebelum terjun bebas
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">Muara Gravitasi</span>
              </div>
            </div>
          </div>
        </div>
      </RevealOnView>

      {/* ===================================================================
          3. GRAVITY RETURN CONDUIT (Hydraulic Connector)
          =================================================================== */}
      <RevealOnView delayMs={60}>
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] transition-colors p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <ArrowDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827] flex items-center gap-2">
                <span>Pipa Gravitasi Bebas Energi (0 Watt Listrik)</span>
                <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono text-[#166534] font-bold">
                  100% Pasif Alami
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280]">
                Air jernih terjun bebas 85 cm dari Baris 4 menuju Sekat 1 Kolam Nila Merah dengan turbulensi alami
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#0284C7] font-bold">
              DEBIT: {isPumpOn ? "1.8 L/MIN" : "0.0 L/MIN"}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-bold">
              KEMIRINGAN: 3% PASIF
            </span>
          </div>
        </div>
      </RevealOnView>

      {/* ===================================================================
          4. DECK BAWAH: BAK KOLAM BERSEKAT (2 SEKAT FISIK)
          =================================================================== */}
      <RevealOnView delayMs={80}>
        <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                <Fish className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#111827]">
                    Deck Bawah: Bak Kolam Ikan Polikultur (2 Sekat Fisik)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white font-mono text-[10px] font-bold whitespace-nowrap shrink-0">
                    Sekat Nila &amp; Lele
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Sekat 1 untuk Ikan Nila (aerasi tinggi), Sekat 2 untuk Ikan Lele &amp; zona pompa lift 12V
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534] whitespace-nowrap shrink-0">
                POLIKULTUR ZERO CHEMICAL
              </span>
            </div>
          </div>

          {/* 2 Partitioned Tank Cards (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SEKAT 1: KOLAM IKAN NILA MERAH */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header with Tactile Toggle Switch */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      SEKAT 1
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0C4A6E]">
                        Kolam Ikan Nila Merah
                      </h3>
                      <div className="text-[10px] text-[#0284C7] font-mono">
                        Oreochromis niloticus • 85 Ekor (~14.2 kg)
                      </div>
                    </div>
                  </div>

                  {/* Tactile Toggle Switch for Aerator */}
                  <button
                    type="button"
                    onClick={() => toggleActuator("aerator")}
                    className="flex items-center gap-2 cursor-pointer shrink-0"
                    title="Toggle Aerator Nila"
                    aria-pressed={isAeratorOn}
                  >
                    <span className="text-[10px] font-mono font-bold text-[#4B5563]">
                      {isAeratorOn ? "Aerator ON" : "Aerator OFF"}
                    </span>
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                        isAeratorOn
                          ? "bg-[#0284C7]"
                          : "bg-[#E5E7EB] border border-[#D1D5DB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          isAeratorOn ? "translate-x-5.5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                </div>

                {/* 4-Box Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-3.5">
                  <div className="bg-[#F0F9FF] p-3 rounded-2xl border border-[#BAE6FD]">
                    <div className="text-[10px] text-[#0369A1] font-medium">Kadar pH Kolam:</div>
                    <div className="text-lg font-bold text-[#0284C7] num-tabular">
                      {formattedPH} <span className="text-xs font-normal text-[#64748B]">pH</span>
                    </div>
                    <div className="text-[9px] text-[#166534] font-medium mt-0.5">
                      {isPhOptimal ? "✓ Ideal (6.5 – 7.5 pH)" : "Pantau Buffer Air"}
                    </div>
                  </div>

                  <div className="bg-[#F0F9FF] p-3 rounded-2xl border border-[#BAE6FD]">
                    <div className="text-[10px] text-[#0369A1] font-medium">Suhu Air Kolam:</div>
                    <div className="text-lg font-bold text-[#0369A1] num-tabular">
                      {formattedTemp} <span className="text-xs font-normal text-[#64748B]">°C</span>
                    </div>
                    <div className="text-[9px] text-[#64748B] mt-0.5">
                      Ideal Nila 22 – 27°C
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Biomassa Est.:</div>
                    <div className="text-sm font-bold text-[#111827]">~14.2 kg</div>
                    <div className="text-[9px] text-[#4B5563]">Ukuran Konsumsi L3</div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Jadwal Pakan:</div>
                    <div className="text-sm font-bold text-[#165B39]">35g / Hari</div>
                    <div className="text-[9px] text-[#4B5563]">07:00 &amp; 16:30 WIB</div>
                  </div>
                </div>
              </div>

              {/* Biological Footnote */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#334155] leading-relaxed">
                Menerima air jernih dari kangkung Baris 4. Amonia ikan terlarut secara kontinu dialirkan ke Sekat 2 melalui sela sekat bawah.
              </div>
            </div>

            {/* SEKAT 2: KOLAM IKAN LELE (ZONA POMPA LIFT L1) */}
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB]/50 hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                {/* Header with Tactile Toggle Switch */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[#334155] text-white font-mono text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap">
                      SEKAT 2
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1E293B]">
                        Kolam Lele &amp; Bak Pompa L1
                      </h3>
                      <div className="text-[10px] text-[#64748B] font-mono">
                        Clarias sp. • 120 Ekor • Muara Pompa Lift
                      </div>
                    </div>
                  </div>

                  {/* Tactile Toggle Switch for Pump */}
                  <button
                    type="button"
                    onClick={() => toggleActuator("waterPump")}
                    className="flex items-center gap-2 cursor-pointer shrink-0"
                    title="Toggle Pompa Sirkulasi 12V"
                    aria-pressed={isPumpOn}
                  >
                    <span className="text-[10px] font-mono font-bold text-[#4B5563]">
                      {isPumpOn ? "Pompa ON" : "Pompa OFF"}
                    </span>
                    <div
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                        isPumpOn
                          ? "bg-[#165B39]"
                          : "bg-[#E5E7EB] border border-[#D1D5DB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          isPumpOn ? "translate-x-5.5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                </div>

                {/* 4-Box Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-3.5">
                  <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#CBD5E1]">
                    <div className="text-[10px] text-[#64748B] font-medium">Nutrisi TDS Kolam:</div>
                    <div className="text-lg font-bold text-[#165B39] num-tabular">
                      {formattedTDS} <span className="text-xs font-normal text-[#64748B]">ppm</span>
                    </div>
                    <div className="text-[9px] text-[#166534] font-medium mt-0.5">
                      {isTdsOptimal ? "✓ Ideal 400 – 800 ppm" : "Pantau Nutrisi Air"}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#CBD5E1]">
                    <div className="text-[10px] text-[#64748B] font-medium">Status Pompa Lift:</div>
                    <div className="text-lg font-bold text-[#1E293B] num-tabular">
                      {isPumpOn ? "45 Watt" : "0 Watt"}
                    </div>
                    <div className="text-[9px] text-[#64748B] mt-0.5">
                      Tegangan 12V DC
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Biomassa Est.:</div>
                    <div className="text-sm font-bold text-[#111827]">~18.5 kg</div>
                    <div className="text-[9px] text-[#4B5563]">Toleransi Amonia Tinggi</div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB]">
                    <div className="text-[10px] text-[#9CA3AF] font-medium">Sirkulasi Balik:</div>
                    <div className="text-sm font-bold text-[#165B39]">Ke Baris 1</div>
                    <div className="text-[9px] text-[#4B5563]">Lift Vertikal 140 cm</div>
                  </div>
                </div>
              </div>

              {/* Biological Footnote */}
              <div className="pt-3 border-t border-[#E5E7EB] text-[11px] text-[#334155] leading-relaxed">
                Ikan Lele memiliki organ arboresen tambahan sehingga tahan kondisi oksigen rendah. Menjadi zona akhir sebelum pompa celup mengangkat nutrisi ke Baris 1 Pakcoy.
              </div>
            </div>
          </div>
        </div>
      </RevealOnView>

      {/* ===================================================================
          5. SIGNATURE WAVY RIBBON: CLOSED-LOOP ECOSYSTEM SUMMARY
          =================================================================== */}
      <RevealOnView delayMs={100}>
        <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#68C194]" />
              <h3 className="text-sm font-bold tracking-tight text-white">
                Siklus Tertutup 100% Alami (Closed-Loop Hardware Twin)
              </h3>
            </div>
            <p className="text-xs text-white/75 mt-1 max-w-2xl leading-relaxed">
              Aliran air bergerak kontinu tanpa henti: Kolam Lele (L1) ➜ Pompa Lift 12V ➜ Baris 1 &amp; 2 Pakcoy ➜ Baris 3 &amp; 4 Kangkung ➜ Terjun Gravitasi ➜ Kolam Nila.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-white">
              RETENSI AIR 98.4%
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-[#68C194]">
              ZERO CHEMICAL
            </div>
          </div>
        </div>
      </RevealOnView>
    </div>
  );
}
