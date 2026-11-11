"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function PhysicalSystemOverview() {
  const { sensors, actuators, systemMeta, toggleActuator } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;

  const formattedPH =
    typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : "--";
  const formattedTDS =
    typeof sensors.tds === "number" ? String(Math.round(sensors.tds)) : "--";
  const formattedTemp =
    typeof sensors.waterTemperature === "number"
      ? sensors.waterTemperature.toFixed(1)
      : "--";
  const formattedLux =
    typeof sensors.lightIntensity === "number"
      ? String(Math.round(sensors.lightIntensity))
      : "--";
  const isPhOptimal =
    typeof sensors.ph === "number" && sensors.ph >= 6.5 && sensors.ph <= 7.5;
  const isTdsOptimal =
    typeof sensors.tds === "number" && sensors.tds >= 400 && sensors.tds <= 800;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. CLEAN HYDRODYNAMIC STREAM STRIP (Typography-First, Zero Fluff)
          =================================================================== */}
      <div className="rounded-[20px] bg-[#165B39] text-white p-5 sm:p-6 shadow-sm border border-[#145233]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isPumpOn ? "bg-[#68C194]" : "bg-rose-400"}`} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68C194]">
                ECAD-STD-2026 &bull; 4-LEVEL GRAVITY HYDRAULIC LOOP
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Menara Kaskade Bertingkat &amp; Ekologi Sirkulasi Tertutup
            </h2>
            <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
              Air diangkat pompa 12V DC ke puncak rak (Level 4), lalu mengalir pasif memanfaatkan gravitasi melintasi kanopi sayuran, biofilter perakaran, dan dua kompartemen kolam ikan.
            </p>
          </div>

          {/* Precision Metric Pills (Clean typography, no redundant icons) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 font-mono text-xs">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Debit Lift</div>
              <div className="font-bold text-white text-sm num-tabular mt-0.5">
                {isPumpOn ? "1.8 L/min" : "0.0 L/min"}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 font-mono text-xs">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Status Sensor</div>
              <div className="font-bold text-[#68C194] text-sm num-tabular mt-0.5">
                {systemMeta.edgeOnline ? `${systemMeta.liveSensorCount}/6 Live` : "Offline"}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 font-mono text-xs">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Cahaya LDR (L4)</div>
              <div className="font-bold text-[#38BDF8] text-sm num-tabular mt-0.5">
                {formattedLux === "--" ? "-- lux" : `${formattedLux} lux`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. ASYMMETRIC MAIN GRID:
             LEFT (65%): ARCHITECTURAL 4-TIER ELEVATION SPINE
             RIGHT (35%): BIOGEOCHEMICAL & NITROGEN HUB
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ARCHITECTURAL 4-TIER VERTICAL SPINE */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-[#111827] uppercase tracking-wider">
              Cross-Section Elevasi Menara Fisik (H = 160 cm &rarr; 0 cm)
            </h3>
            <span className="text-[10px] font-mono text-[#6B7280]">
              Slope Kemiringan: 3% Pasif
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              LEVEL 4 (PUNCAK • ELEVASI 160 CM): PAKCOY CANOPY DECK
              ───────────────────────────────────────────────────────────── */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] p-5 shadow-xs transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#165B39] text-white font-mono text-[10px] font-bold">
                    L4 &bull; 160 CM
                  </span>
                  <span className="text-xs font-mono text-[#165B39] font-bold">
                    PUNCAK SIRKULASI
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">NFT Thin-Film Aerasi</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                  Sayuran Pakcoy Super Green (Brassica rapa subsp. chinensis)
                </h4>
                <p className="text-xs text-[#4B5563] leading-relaxed pt-0.5">
                  Menerima semburan primer air kaya nutrisi dari pompa lift. Karakteristik perakaran renggang memaksimalkan kelolosan oksigen terlarut (DO) ke tingkat bawah.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#166534] font-mono text-[11px] font-bold shrink-0">
                120 Netpot
              </span>
            </div>

            {/* Metrics Row */}
            <div className="mt-3.5 pt-3 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Target DO</div>
                <div className="font-bold text-[#0284C7] mt-0.5">&gt; 6.0 mg/L</div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">pH Masuk</div>
                <div className="font-bold text-[#166534] mt-0.5">
                  {formattedPH === "--" ? "--" : `${formattedPH} pH`}
                </div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Kemiringan</div>
                <div className="font-bold text-[#111827] mt-0.5">3% NFT</div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Fase Tumbuh</div>
                <div className="font-bold text-[#165B39] mt-0.5">Vegetatif</div>
              </div>
            </div>
          </div>

          {/* GRAVITY FLOW CONNECTOR 4 -> 3 */}
          <div className="flex items-center justify-between px-4 py-0.5 text-xs font-mono text-[#0284C7]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#0284C7]" />
              <span className="font-bold text-[11px]">Terjun Bebas Gravitasi 50 cm &rarr; Limpahan Kaya DO</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">0 Watt</span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              LEVEL 3 (TINGKAT 3 • ELEVASI 110 CM): KOLAM IKAN NILA
              ───────────────────────────────────────────────────────────── */}
          <div className="rounded-[20px] bg-white border border-[#BAE6FD] hover:border-[#7DD3FC] p-5 shadow-xs transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white font-mono text-[10px] font-bold">
                    L3 &bull; 110 CM
                  </span>
                  <span className="text-xs font-mono text-[#0284C7] font-bold">
                    KOMPARTEMEN NILA
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Oreochromis niloticus</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#0C4A6E]">
                  Sanctuari Ikan Nila Merah (Kebutuhan DO Tinggi)
                </h4>
                <p className="text-xs text-[#334155] leading-relaxed pt-0.5">
                  Menerima air kaya oksigen dari Level 4. Nila membutuhkan DO &gt; 5.0 mg/L untuk respirasi optimal. Menghasilkan ekskresi organik amonia alami sebagai sumber nutrisi biofilter.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] text-[#0369A1] font-mono text-[11px] font-bold">
                  85 Ekor
                </span>
                <button
                  type="button"
                  onClick={() => toggleActuator("aerator")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-colors border cursor-pointer ${
                    isAeratorOn
                      ? "bg-[#0284C7] text-white border-[#0284C7]"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {isAeratorOn ? "AERATOR ON" : "AERATOR OFF"}
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mt-3.5 pt-3 border-t border-[#E0F2FE] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-[#F0F9FF] p-2.5 rounded-lg border border-[#BAE6FD]">
                <div className="text-[9.5px] text-[#0369A1]">Biomassa Est.</div>
                <div className="font-bold text-[#0C4A6E] mt-0.5">~14.2 kg</div>
              </div>
              <div className="bg-[#F0F9FF] p-2.5 rounded-lg border border-[#BAE6FD]">
                <div className="text-[9.5px] text-[#0369A1]">Suhu Kolam</div>
                <div className="font-bold text-[#0C4A6E] mt-0.5">
                  {formattedTemp === "--" ? "--" : `${formattedTemp} °C`}
                </div>
              </div>
              <div className="bg-[#F0F9FF] p-2.5 rounded-lg border border-[#BAE6FD]">
                <div className="text-[9.5px] text-[#0369A1]">Batas Kritis DO</div>
                <div className="font-bold text-[#0284C7] mt-0.5">&gt; 5.0 mg/L</div>
              </div>
              <div className="bg-[#F0F9FF] p-2.5 rounded-lg border border-[#BAE6FD]">
                <div className="text-[9.5px] text-[#0369A1]">Jadwal Pakan</div>
                <div className="font-bold text-[#166534] mt-0.5">07:00 &bull; 16:30</div>
              </div>
            </div>
          </div>

          {/* GRAVITY FLOW CONNECTOR 3 -> 2 */}
          <div className="flex items-center justify-between px-4 py-0.5 text-xs font-mono text-[#D97706]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#D97706]" />
              <span className="font-bold text-[11px]">Siphon Aliran Amonia &rarr; Menuju Biofilter (Terjun 50 cm)</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">Konversi Nitrifikasi</span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              LEVEL 2 (TINGKAT 2 • ELEVASI 60 CM): KANGKUNG BIOFILTER
              ───────────────────────────────────────────────────────────── */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] p-5 shadow-xs transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#D97706] text-white font-mono text-[10px] font-bold">
                    L2 &bull; 60 CM
                  </span>
                  <span className="text-xs font-mono text-[#D97706] font-bold">
                    ZONA BIOFILTER
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Ipomoea aquatica</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                  Sayuran Kangkung Air &amp; Substrat Hydroton Nitrifikasi
                </h4>
                <p className="text-xs text-[#4B5563] leading-relaxed pt-0.5">
                  Perakaran kangkung yang masif bertindak sebagai biofilter alami penyerap amonia, namun secara alami menyerap oksigen dalam air sebelum dialirkan ke dasar.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E] font-mono text-[11px] font-bold shrink-0">
                100 Netpot
              </span>
            </div>

            {/* Metrics Row */}
            <div className="mt-3.5 pt-3 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Bakteri Aktif</div>
                <div className="font-bold text-[#D97706] mt-0.5">Nitrosomonas</div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Konversi Amonia</div>
                <div className="font-bold text-[#166534] mt-0.5">94.2% Efektif</div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">TDS Terukur</div>
                <div className="font-bold text-[#111827] mt-0.5">
                  {formattedTDS === "--" ? "--" : `${formattedTDS} ppm`}
                </div>
              </div>
              <div className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Media Akar</div>
                <div className="font-bold text-[#165B39] mt-0.5">Clay Hydroton</div>
              </div>
            </div>
          </div>

          {/* GRAVITY FLOW CONNECTOR 2 -> 1 */}
          <div className="flex items-center justify-between px-4 py-0.5 text-xs font-mono text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#64748B]" />
              <span className="font-bold text-[11px]">Effluent Rendah DO &rarr; Mengalir ke Dasar Bak Kolam (Terjun 50 cm)</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">Air Jernih</span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              LEVEL 1 (DASAR • ELEVASI 10 CM): KOLAM LELE & SUMP PUMP
              ───────────────────────────────────────────────────────────── */}
          <div className="rounded-[20px] bg-[#1E293B] text-white p-5 shadow-xs transition-colors border border-[#334155]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#475569] text-white font-mono text-[10px] font-bold">
                    L1 &bull; 10 CM
                  </span>
                  <span className="text-xs font-mono text-[#94A3B8] font-bold">
                    DASAR MENARA &amp; SUMP LIFT
                  </span>
                  <span className="text-xs text-white/40">&bull;</span>
                  <span className="text-xs text-white/70">Clarias sp.</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Kolam Ikan Lele &amp; Muara Suction Pompa Lift 12V
                </h4>
                <p className="text-xs text-white/80 leading-relaxed pt-0.5">
                  Ikan Lele memiliki organ arboresen tambahan sehingga sangat toleran terhadap air minim oksigen. Berfungsi sebagai penampung dasar sebelum nutrisi diangkat kembali ke puncak.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono text-[11px] font-bold">
                  120 Ekor
                </span>
                <button
                  type="button"
                  onClick={() => toggleActuator("waterPump")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-colors border cursor-pointer ${
                    isPumpOn
                      ? "bg-[#165B39] text-[#68C194] border-[#165B39]"
                      : "bg-white/10 text-white/60 border-white/20 hover:bg-white/15"
                  }`}
                >
                  {isPumpOn ? "POMPA ON (45W)" : "POMPA OFF"}
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/10">
                <div className="text-[9.5px] text-white/50">Toleransi DO</div>
                <div className="font-bold text-[#68C194] mt-0.5">&lt; 3.0 mg/L</div>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/10">
                <div className="text-[9.5px] text-white/50">Biomassa Est.</div>
                <div className="font-bold text-white mt-0.5">~18.5 kg</div>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/10">
                <div className="text-[9.5px] text-white/50">Node Hardware</div>
                <div className={`font-bold mt-0.5 ${systemMeta.edgeOnline ? "text-[#68C194]" : "text-white/70"}`}>
                  {systemMeta.edgeOnline ? systemMeta.edgeNode : "ESP32 Offline"}
                </div>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/10">
                <div className="text-[9.5px] text-white/50">Sirkulasi Lift</div>
                <div className="font-bold text-[#38BDF8] mt-0.5">&uarr; Ke Level 4</div>
              </div>
            </div>
          </div>

          {/* CLOSED LOOP RETURN PIPE */}
          <div className="rounded-xl border border-dashed border-[#165B39] bg-[#DCFCE7]/30 p-3 flex items-center justify-between text-xs font-mono text-[#166534]">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-3.5 w-3.5 text-[#165B39]" />
              <span className="font-bold text-[11px]">
                Pipa PVC 1/2&quot; mengangkat nutrisi 150 cm dari Sump L1 kembali ke Puncak L4
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#165B39] text-white text-[10px] font-bold">
              100% RECIRCULATION
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: BIOGEOCHEMICAL & SCIENTIFIC INTELLIGENCE */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Nitrogen Transformation Cycle */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3.5">
            <div className="pb-2.5 border-b border-[#E5E7EB]">
              <span className="text-[10px] font-mono font-bold text-[#165B39] uppercase tracking-wider block">
                Siklus Transformasi
              </span>
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wide mt-0.5">
                Dinamika Biogeokimia Nitrogen
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#111827]">1. Amonia Terlarut (NH3)</span>
                  <span className="text-[#0284C7] font-bold">Feses Nila L3</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Limbah organik ekskresi insang dan feses ikan nila mengandung kadar amonia terlarut.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FEF3C7]/50 border border-[#FDE68A] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#92400E]">2. Oksidasi Nitrit (NO2-)</span>
                  <span className="text-[#B45309] font-bold">Nitrosomonas</span>
                </div>
                <p className="text-[11px] text-[#78350F]">
                  Bakteri aerobik pada pori hydroton kangkung mengubah amonia menjadi nitrit beracun sedang.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#166534]">3. Asimilasi Nitrat (NO3-)</span>
                  <span className="text-[#165B39] font-bold">Nitrobacter &amp; Daun</span>
                </div>
                <p className="text-[11px] text-[#14532D]">
                  Nitrat diserap sebagai pupuk utama daun Pakcoy &amp; Kangkung, mengembalikan air jernih ke kolam.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Biological Pairing Rationale (ECAD Principle) */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <div className="pb-2.5 border-b border-[#E5E7EB]">
              <span className="text-[10px] font-mono font-bold text-[#165B39] uppercase tracking-wider block">
                Prinsip Adaptasi Iklim
              </span>
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wide mt-0.5">
                Rasionalitas Pasangan Hayati ECAD
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-[#4B5563] leading-relaxed">
              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                <strong className="text-[#111827] block text-[11px]">Nila Merah + Sayur Pakcoy:</strong>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Nila rentan DO drop (&lt;3 mg/L). Menempatkan Nila tepat di bawah talang aerasi NFT menjamin limpahan turbulensi oksigen tinggi.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                <strong className="text-[#111827] block text-[11px]">Ikan Lele + Sayur Kangkung:</strong>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Lele memproduksi limbah padat tinggi namun memiliki organ pernapasan arboresen. Kangkung dengan akar masif menyerap amonia sebelum air masuk ke pompa.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Water Quality Index */}
          <div className="rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              Parameter Kualitas Air Menara
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">Kadar pH</div>
                <div className="text-base font-bold text-[#111827] num-tabular mt-0.5">{formattedPH}</div>
                <div
                  className={`text-[9px] mt-0.5 font-sans ${
                    typeof sensors.ph !== "number"
                      ? "text-[#6B7280]"
                      : isPhOptimal
                        ? "text-[#166534]"
                        : "text-[#B45309]"
                  }`}
                >
                  {typeof sensors.ph !== "number"
                    ? "Sensor Offline"
                    : isPhOptimal
                      ? "Optimal"
                      : "Buffer Check"}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                <div className="text-[9.5px] text-[#6B7280]">TDS Nutrisi</div>
                <div className="text-base font-bold text-[#111827] num-tabular mt-0.5">
                  {formattedTDS === "--" ? "--" : `${formattedTDS} ppm`}
                </div>
                <div
                  className={`text-[9px] mt-0.5 font-sans ${
                    typeof sensors.tds !== "number"
                      ? "text-[#6B7280]"
                      : isTdsOptimal
                        ? "text-[#166534]"
                        : "text-[#B45309]"
                  }`}
                >
                  {typeof sensors.tds !== "number"
                    ? "Sensor Offline"
                    : isTdsOptimal
                      ? "Optimal"
                      : "Check Nutrisi"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
