"use client";

import React from "react";
import { Sprout, Fish, Waves, ArrowDown, ArrowUp, Droplets, Zap, ShieldCheck } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function PhysicalSystemOverview() {
  const { sensors, actuators, toggleActuator } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. DECK ATAS: AREA HIDROPONIK (4 BARIS TALANG PIPA)
          =================================================================== */}
      <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                DECK ATAS: Area Hidroponik (4 Baris Talang)
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Air dari kolam dipompa ke Baris 1 & 2 (Pakcoy), mengalir gravitasi ke Baris 3 & 4 (Kangkung)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[10px] font-mono font-bold text-[#165B39]">
            TOTAL 220 NETPOT
          </span>
        </div>

        {/* 4 Rows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BARIS 1: PAKCOY CANOPY A */}
          <div className="rounded-2xl p-4.5 bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#165B39]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#165B39] text-white font-mono text-[10px] font-bold">
                  BARIS 1
                </span>
                <span className="text-xs font-bold text-[#111827]">
                  Pakcoy (Canopy A)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#166534] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                DO Masuk: ~7.6 mg/L
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
              Menerima semburan air pertama dari pompa lift. Akar renggang tidak menghambat laju air dan mempertahankan saturasi oksigen tinggi.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-2 border-t border-[#E5E7EB]">
              <span>60 Netpot • NFT System</span>
              <span>Umur: 14 Hari</span>
            </div>
          </div>

          {/* BARIS 2: PAKCOY CANOPY B */}
          <div className="rounded-2xl p-4.5 bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#165B39]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#165B39] text-white font-mono text-[10px] font-bold">
                  BARIS 2
                </span>
                <span className="text-xs font-bold text-[#111827]">
                  Pakcoy (Canopy B)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#166534] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                Absorpsi Nitrat: Optimal
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
              Menerima limpahan air dari Baris 1. Daun hijau segar menyerap nitrat terlarut sebagai nutrisi alami daun tanpa pupuk sintetis.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-2 border-t border-[#E5E7EB]">
              <span>60 Netpot • NFT System</span>
              <span>Est. Panen: 10 Hari</span>
            </div>
          </div>

          {/* BARIS 3: KANGKUNG BIOFILTER A */}
          <div className="rounded-2xl p-4.5 bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#D97706]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white font-mono text-[10px] font-bold">
                  BARIS 3
                </span>
                <span className="text-xs font-bold text-[#111827]">
                  Kangkung (Biofilter A)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#B45309] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                Substrat Hydroton
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
              Air dari pakcoy masuk ke talang kangkung. Pori-pori media hydroton menjadi sarang jutaan bakteri pengurai amonia menjadi nitrat.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-2 border-t border-[#E5E7EB]">
              <span>50 Netpot • Media Hydroton</span>
              <span>Bakteri Aktif: 96%</span>
            </div>
          </div>

          {/* BARIS 4: KANGKUNG BIOFILTER B */}
          <div className="rounded-2xl p-4.5 bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#D97706]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white font-mono text-[10px] font-bold">
                  BARIS 4
                </span>
                <span className="text-xs font-bold text-[#111827]">
                  Kangkung (Biofilter B)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#166534] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                Air Jernih Teralirkan
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
              Hilir dari area hidroponik. Perakaran masif kangkung menjernihkan air sebelum diterjunkan gravitasi kembali ke kolam bawah.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9CA3AF] pt-2 border-t border-[#E5E7EB]">
              <span>50 Netpot • Filtrasi Padatan</span>
              <span>Siap Panen: 4 Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. GRAVITY RETURN CONDUIT (Pipa Gravitasi Menuju Kolam)
          =================================================================== */}
      <div className="flex items-center justify-center gap-3 py-1">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-mono text-[#4B5563] shadow-2xs">
          <ArrowDown className="h-3.5 w-3.5 text-[#0284C7] animate-bounce" />
          <span>Air Jernih Turun Mengalir Bebas Secara Gravitasi ke Bak Kolam</span>
          <ArrowDown className="h-3.5 w-3.5 text-[#0284C7] animate-bounce" />
        </div>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      {/* ===================================================================
          3. DECK BAWAH: BAK KOLAM BERSEKAT (2 SEKAT TERPISAH)
          =================================================================== */}
      <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Fish className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                DECK BAWAH: Bak Kolam Ikan (2 Sekat Fisik)
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Kolam bagian bawah disekat menjadi dua kompartemen: Sekat Nila & Sekat Lele (Sump Tank)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
            POLIKULTUR ZERO CHEMICAL
          </span>
        </div>

        {/* 2 Partitioned Tanks Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {/* SEKAT 1: KOLAM IKAN NILA */}
          <div className="rounded-2xl p-5 bg-[#F0F9FF] border border-[#BAE6FD] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#0284C7] text-white font-mono text-[10px] font-bold">
                    SEKAT 1
                  </span>
                  <h3 className="text-sm font-bold text-[#0C4A6E]">
                    Kolam Ikan Nila Merah
                  </h3>
                </div>
                <button
                  onClick={() => toggleActuator("aerator")}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                    isAeratorOn
                      ? "bg-[#0284C7] text-white"
                      : "bg-white text-[#64748B] border border-[#CBD5E1]"
                  }`}
                >
                  {isAeratorOn ? "AERATOR 18W ON" : "AERATOR OFF"}
                </button>
              </div>

              <div className="text-[11px] text-[#0369A1] italic font-mono mb-2">
                Oreochromis niloticus • 85 Ekor (~14.2 kg)
              </div>
              <p className="text-[11px] text-[#334155] leading-relaxed mb-4">
                Ikan Nila mutlak membutuhkan kadar Oksigen Terlarut (DO) tinggi (&gt;5.0 mg/L). Menerima air segar sebelum menghasilkan amonia organik alami sebagai pupuk bagi sayuran.
              </p>
            </div>

            <div className="pt-3 border-t border-[#BAE6FD] grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-white/80 p-2 rounded-xl">
                <div className="text-[#64748B]">DO Terbaca:</div>
                <div className="text-xs font-bold text-[#0284C7]">{sensors.dissolvedOxygen} mg/L</div>
              </div>
              <div className="bg-white/80 p-2 rounded-xl">
                <div className="text-[#64748B]">Suhu Kolam:</div>
                <div className="text-xs font-bold text-[#0369A1]">{sensors.waterTemperature}°C</div>
              </div>
            </div>
          </div>

          {/* SEKAT 2: KOLAM IKAN LELE & SUMP PUMP */}
          <div className="rounded-2xl p-5 bg-[#F8FAFC] border border-[#CBD5E1] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#475569] text-white font-mono text-[10px] font-bold">
                    SEKAT 2
                  </span>
                  <h3 className="text-sm font-bold text-[#1E293B]">
                    Kolam Lele & Sump Tank
                  </h3>
                </div>
                <button
                  onClick={() => toggleActuator("waterPump")}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                    isPumpOn
                      ? "bg-[#165B39] text-white"
                      : "bg-white text-[#64748B] border border-[#CBD5E1]"
                  }`}
                >
                  {isPumpOn ? "POMPA 45W ON" : "POMPA OFF"}
                </button>
              </div>

              <div className="text-[11px] text-[#475569] italic font-mono mb-2">
                Clarias sp. • 120 Ekor • Muara Pompa Submersible
              </div>
              <p className="text-[11px] text-[#334155] leading-relaxed mb-4">
                Ikan Lele memiliki organ pernapasan tambahan (arboresen) sehingga toleran terhadap DO lebih rendah. Muara tempat pompa celup mengangkat air kembali ke Baris 1 Pakcoy.
              </p>
            </div>

            <div className="pt-3 border-t border-[#CBD5E1] grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0]">
                <div className="text-[#64748B]">Level Air:</div>
                <div className="text-xs font-bold text-[#165B39]">{sensors.waterLevel}% Penuh</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E2E8F0]">
                <div className="text-[#64748B]">Status Pompa:</div>
                <div className="text-xs font-bold text-[#1E293B]">12V DC • 45 Watt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          4. CLOSED-LOOP RETURN BAR
          =================================================================== */}
      <div className="rounded-2xl p-4 bg-[#165B39] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold">
              Resirkulasi Tertutup (Closed-Loop Lift)
            </div>
            <div className="text-[11px] text-white/80">
              Pompa Submersible 12V 45W mendorong air bersih dari Sekat 2 kembali ke Puncak Baris 1 Pakcoy
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-mono font-bold text-white shrink-0">
          EFISIENSI AIR 98.4%
        </div>
      </div>
    </div>
  );
}
