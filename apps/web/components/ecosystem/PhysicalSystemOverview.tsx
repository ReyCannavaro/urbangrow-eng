"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
  Fish,
  Waves,
  ArrowDown,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function PhysicalSystemOverview() {
  const { sensors, actuators, toggleActuator } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;

  const formattedDO =
    typeof sensors.dissolvedOxygen === "number"
      ? sensors.dissolvedOxygen.toFixed(2)
      : sensors.dissolvedOxygen;
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : sensors.waterTemperature;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. DONEZO 4-METRIC BENTO ROW (Identitas Visual Dashboard Utama)
          =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. HERO INVERTED CARD: Laju Alir Resirkulasi */}
        <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">
              Laju Alir Resirkulasi
            </span>
            <div
              className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
              title="Debit Pompa Lift"
            >
              <Waves className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
              {isPumpOn ? "1.8" : "0.0"}
              <span className="text-xl font-normal text-white/80 ml-1">L/min</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
              <TrendingUp className="h-3 w-3 text-[#68C194]" />
              <span>{isPumpOn ? "+4.2% Debit Gravitasi Konstan" : "Pompa Lift Terhenti"}</span>
            </div>
          </div>
        </div>

        {/* 2. KAPASITAS NETPOT HIDROPONIK */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
              <CheckCircle2 className="h-3 w-3" />
              <span>120 Pakcoy • 100 Kangkung</span>
            </div>
          </div>
        </div>

        {/* 3. POPULASI POLIKULTUR IKAN */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[10px] font-medium text-[#0369A1]">
              <ShieldCheck className="h-3 w-3" />
              <span>85 Nila Merah • 120 Lele Sump</span>
            </div>
          </div>
        </div>

        {/* 4. EFISIENSI SIRKULASI TERTUTUP */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#92400E]">
              <Sparkles className="h-3 w-3" />
              <span>Zero Synthetic Chemicals</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. DECK ATAS: AREA HIDROPONIK (4 BARIS TALANG)
          =================================================================== */}
      <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center font-bold shadow-2xs">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  Deck Atas: Talang Hidroponik 4-Baris
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#165B39] text-white font-mono text-[10px] font-bold">
                  NFT & Biofilter
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Pompa 12V mengangkat air ke Baris 1 & 2 (Pakcoy), lalu air melimpah gravitasi ke Baris 3 & 4 (Kangkung)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-bold">
              KEMIRINGAN 3% • PANJANG 120 CM
            </span>
          </div>
        </div>

        {/* 4 Distinct Donezo Plant Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* BARIS 1: PAKCOY CANOPY A (Inlet Primer) */}
          <div className="rounded-[24px] bg-white border-2 border-[#165B39]/20 p-5 shadow-xs flex flex-col justify-between hover:border-[#165B39] transition-all group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#165B39] text-white font-mono text-[10px] font-bold tracking-wide">
                    BARIS 1 • INLET
                  </span>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Pakcoy Super Green (Canopy A)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold">
                  DO: ~7.6 mg/L
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
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between hover:border-[#165B39]/50 transition-all group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#4EAB7C] text-white font-mono text-[10px] font-bold tracking-wide">
                    BARIS 2 • KASKADE
                  </span>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Pakcoy Kembang (Canopy B)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold">
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
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between hover:border-[#D97706]/50 transition-all group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#D97706] text-white font-mono text-[10px] font-bold tracking-wide">
                    BARIS 3 • HYDROTON
                  </span>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Kangkung Biofilter (Akar Masif A)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-mono font-bold">
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
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between hover:border-[#165B39]/50 transition-all group">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#165B39] text-white font-mono text-[10px] font-bold tracking-wide">
                    BARIS 4 • POLISHING
                  </span>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Kangkung Air Jernih (Canopy B)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-mono font-bold">
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

      {/* ===================================================================
          3. GRAVITY RETURN CONDUIT (Interactive Hydraulic Connector)
          =================================================================== */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#111827] flex items-center gap-2">
              <span>Pipa Gravitasi Bebas Energi (0 Watt Listrik)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono text-[#166534] font-bold">
                100% Pasif Alami
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280]">
              Air jernih kaya oksigen terjun bebas 85 cm dari Baris 4 menuju Sekat 1 Kolam Nila Merah
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#0284C7] font-bold">
            DEBIT: 1.8 L/MIN
          </span>
          <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-bold">
            AERASI ALAMI: +0.4 MG/L
          </span>
        </div>
      </div>

      {/* ===================================================================
          4. DECK BAWAH: BAK KOLAM BERSEKAT (2 SEKAT FISIK)
          =================================================================== */}
      <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold shadow-2xs">
              <Fish className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  Deck Bawah: Bak Kolam Ikan Polikultur (2 Sekat Fisik)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#0284C7] text-white font-mono text-[10px] font-bold">
                  Sekat Nila & Lele
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Sekat 1 untuk Ikan Nila (oksigen tinggi), Sekat 2 untuk Ikan Lele & penampung pompa lift (Sump)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
              POLIKULTUR ZERO CHEMICAL
            </span>
          </div>
        </div>

        {/* 2 Partitioned Tank Cards (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* SEKAT 1: KOLAM IKAN NILA MERAH */}
          <div className="rounded-[24px] bg-white border-2 border-[#BAE6FD] p-5 shadow-xs flex flex-col justify-between hover:border-[#0284C7] transition-all">
            <div>
              {/* Header with Donezo Tactile Toggle Switch */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white font-mono text-[10px] font-bold tracking-wide">
                    SEKAT 1
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0C4A6E]">
                      Kolam Ikan Nila Merah
                    </h3>
                    <div className="text-[10px] text-[#0284C7] font-mono">
                      Oreochromis niloticus • 85 Ekor (~14.2 kg)
                    </div>
                  </div>
                </div>

                {/* Tactile Toggle Switch for Aerator */}
                <div
                  onClick={() => toggleActuator("aerator")}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Toggle Aerator Oksigen Nila"
                >
                  <span className="text-[10px] font-mono font-bold text-[#4B5563]">
                    {isAeratorOn ? "Aerator ON" : "Aerator OFF"}
                  </span>
                  <div
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      isAeratorOn
                        ? "bg-[#0284C7] shadow-[0_0_8px_rgba(2,132,199,0.35)]"
                        : "bg-[#E5E7EB] border border-[#D1D5DB]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                        isAeratorOn ? "translate-x-5.5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Box Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-3.5">
                <div className="bg-[#F0F9FF] p-3 rounded-2xl border border-[#BAE6FD]">
                  <div className="text-[10px] text-[#0369A1] font-medium">DO Terbaca:</div>
                  <div className="text-lg font-bold text-[#0284C7] num-tabular">
                    {formattedDO} <span className="text-xs font-normal text-[#64748B]">mg/L</span>
                  </div>
                  <div className="text-[9px] text-[#166534] font-medium mt-0.5">
                    ✓ Optimal (&gt;5.0 mg/L)
                  </div>
                </div>

                <div className="bg-[#F0F9FF] p-3 rounded-2xl border border-[#BAE6FD]">
                  <div className="text-[10px] text-[#0369A1] font-medium">Suhu Air Kolam:</div>
                  <div className="text-lg font-bold text-[#0369A1] num-tabular">
                    {formattedTemp} <span className="text-xs font-normal text-[#64748B]">°C</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    Ideal Nila 24-28°C
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
                  <div className="text-[9px] text-[#4B5563]">07:00 & 16:30 WIB</div>
                </div>
              </div>
            </div>

            {/* Biological Footnote */}
            <div className="pt-3 border-t border-[#BAE6FD] text-[11px] text-[#334155] leading-relaxed">
              Menerima air jernih kaya oksigen dari kangkung Baris 4. Amonia ikan terlarut secara kontinu dialirkan ke Sekat 2 melalui sela sekat bawah.
            </div>
          </div>

          {/* SEKAT 2: KOLAM IKAN LELE & SUMP TANK */}
          <div className="rounded-[24px] bg-white border-2 border-[#CBD5E1] p-5 shadow-xs flex flex-col justify-between hover:border-[#165B39] transition-all">
            <div>
              {/* Header with Donezo Tactile Toggle Switch */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#334155] text-white font-mono text-[10px] font-bold tracking-wide">
                    SEKAT 2
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">
                      Kolam Lele & Sump Tank
                    </h3>
                    <div className="text-[10px] text-[#64748B] font-mono">
                      Clarias sp. • 120 Ekor • Muara Pompa Lift
                    </div>
                  </div>
                </div>

                {/* Tactile Toggle Switch for Pump */}
                <div
                  onClick={() => toggleActuator("waterPump")}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Toggle Pompa Sirkulasi 12V"
                >
                  <span className="text-[10px] font-mono font-bold text-[#4B5563]">
                    {isPumpOn ? "Pompa ON" : "Pompa OFF"}
                  </span>
                  <div
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      isPumpOn
                        ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.35)]"
                        : "bg-[#E5E7EB] border border-[#D1D5DB]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                        isPumpOn ? "translate-x-5.5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Box Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-3.5">
                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#CBD5E1]">
                  <div className="text-[10px] text-[#64748B] font-medium">Level Air Sump:</div>
                  <div className="text-lg font-bold text-[#165B39] num-tabular">
                    {sensors.waterLevel}% <span className="text-xs font-normal text-[#64748B]">Penuh</span>
                  </div>
                  <div className="text-[9px] text-[#166534] font-medium mt-0.5">
                    ✓ Aman dari Dry Run
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
            <div className="pt-3 border-t border-[#CBD5E1] text-[11px] text-[#334155] leading-relaxed">
              Ikan Lele memiliki pernapasan arboresen tambahan sehingga tahan oksigen rendah. Menjadi muara tempat pompa celup mengangkat nutrisi kembali ke Baris 1 Pakcoy.
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          5. SIGNATURE WAVY RIBBON: CLOSED-LOOP ECOSYSTEM SUMMARY
          =================================================================== */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#68C194] animate-pulse" />
            <h3 className="text-sm font-bold tracking-tight text-white">
              Siklus Tertutup 100% Alami (Closed-Loop Hardware Twin)
            </h3>
          </div>
          <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
            Aliran air bergerak kontinu tanpa henti: Kolam Lele (Sump) ➜ Pompa Lift 12V ➜ Baris 1 & 2 Pakcoy ➜ Baris 3 & 4 Kangkung ➜ Terjun Gravitasi ➜ Kolam Nila.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-white">
            RETENSI AIR 98.4%
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-[#68C194]">
            ZERO CHEMICAL
          </div>
        </div>
      </div>
    </div>
  );
}
