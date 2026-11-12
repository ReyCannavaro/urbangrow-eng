"use client";

import React from "react";
import { ArrowDown, ArrowUp, Droplets } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function PhysicalSystemOverview() {
  const { sensors, actuators, systemMeta, toggleActuator } = useTelemetry();
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;
  const edgeOnline = systemMeta.edgeOnline;

  const hasPh = typeof sensors.ph === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasTemp = typeof sensors.waterTemperature === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";
  const formattedTDS = hasTds ? String(Math.round(sensors.tds as number)) : "--";
  const formattedTemp = hasTemp ? (sensors.waterTemperature as number).toFixed(1) : "--";
  const formattedLux = hasLux ? String(Math.round(sensors.lightIntensity as number)) : "--";

  const isPhOptimal = hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTdsOptimal = hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;

  return (
    <div className="space-y-6">
      {/* ===================================================================
          1. UNIFIED 3-CARD KPI STRIP (Matches Dashboard MetricCardsRow)
          =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pine Hero Anchor */}
        <div
          style={{ "--ug-delay": "50ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-[#165B39] text-white p-5 shadow-xs flex flex-col justify-between h-[152px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">
              Sirkulasi Kaskade
            </span>
            <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-white">
              <Droplets className="h-4 w-4 text-[#68C194]" />
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-white">
              {!edgeOnline ? "Offline" : isPumpOn ? "1.8" : "0.0"}
              {edgeOnline && (
                <span className="text-lg font-normal text-white/75 ml-1">L/min</span>
              )}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-medium text-white/90">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  edgeOnline ? "bg-[#68C194]" : "bg-white/60"
                }`}
              />
              <span>
                {edgeOnline
                  ? `${systemMeta.liveSensorCount}/6 Sensor Live (${systemMeta.edgeNode})`
                  : "Menunggu Koneksi ESP32"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: pH & TDS */}
        <div
          style={{ "--ug-delay": "100ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[152px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Kadar pH &amp; Nutrisi
            </span>
            <span className="text-[11px] text-[#6B7280] font-medium">
              Ideal 6.5–7.5
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {formattedPH}
              <span className="text-base font-normal text-[#9CA3AF] ml-1">pH</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#4B5563]">
              <span className="num-tabular font-medium text-[#111827]">
                TDS {formattedTDS} ppm
              </span>
              <span className="text-[#D1D5DB]">&bull;</span>
              <span
                className={
                  !hasPh && !hasTds
                    ? "text-[#6B7280]"
                    : (hasPh ? isPhOptimal : true) && (hasTds ? isTdsOptimal : true)
                    ? "text-[#166534] font-medium"
                    : "text-[#B45309] font-medium"
                }
              >
                {!hasPh && !hasTds
                  ? "Sensor Offline"
                  : (hasPh ? isPhOptimal : true) && (hasTds ? isTdsOptimal : true)
                  ? "Optimal"
                  : "Perlu Penyesuaian"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Water Temp & LDR */}
        <div
          style={{ "--ug-delay": "150ms" } as React.CSSProperties}
          className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[152px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Suhu Air &amp; Cahaya L4
            </span>
            <span className="text-[11px] text-[#6B7280] font-medium">
              Kemiringan 3%
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {formattedTemp}
              <span className="text-xl font-normal text-[#9CA3AF]">°C</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#4B5563]">
              <span className="num-tabular font-medium text-[#111827]">
                LDR {formattedLux} lux
              </span>
              <span className="text-[#D1D5DB]">&bull;</span>
              <span className="text-[#6B7280]">
                {hasTemp || hasLux ? "Telemetri Aktif" : "Menunggu Sensor"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. 4-TIER CASCADE ARCHITECTURE & NITROGEN CYCLE
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: 4-TIER VERTICAL CASCADE */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex items-center justify-between px-1 pb-1">
            <h2 className="text-sm font-bold text-[#111827]">
              Elevasi Menara Fisik (160 cm &rarr; 0 cm)
            </h2>
            <span className="text-xs text-[#6B7280]">
              4 Tingkat Gravitasi
            </span>
          </div>

          {/* LEVEL 4: PAKCOY */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#165B39] text-white text-[11px] font-semibold">
                    L4 &bull; 160 cm
                  </span>
                  <span className="text-xs font-semibold text-[#165B39]">
                    Puncak Sirkulasi NFT
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Brassica rapa</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Sayuran Pakcoy Super Green
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Menerima suplai primer air nutrisi dari pompa lift. Perakaran renggang menjaga kelolosan oksigen terlarut ke kolam di bawahnya.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold shrink-0">
                120 Netpot
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">Target DO</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&gt; 6.0 mg/L</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">pH Masuk</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedPH === "--" ? "--" : `${formattedPH} pH`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Kemiringan</div>
                <div className="font-semibold text-[#111827] mt-0.5">3% NFT</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Fase Tumbuh</div>
                <div className="font-semibold text-[#111827] mt-0.5">Vegetatif</div>
              </div>
            </div>
          </div>

          {/* FLOW 4 -> 3 */}
          <div className="flex items-center justify-between px-4 py-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#165B39]" />
              <span>Terjun gravitasi 50 cm &rarr; limpahan kaya oksigen ke Kolam Nila</span>
            </div>
            <span className="font-medium text-[#9CA3AF]">0 Watt</span>
          </div>

          {/* LEVEL 3: NILA */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
                    L3 &bull; 110 cm
                  </span>
                  <span className="text-xs font-semibold text-[#111827]">
                    Kolam Ikan Nila
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Oreochromis niloticus</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Kompartemen Nila Merah (Kebutuhan DO Tinggi)
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Menampung air teroksigenasi dari Level 4. Membutuhkan DO &gt; 5.0 mg/L sekaligus menghasilkan amonia organik alami untuk biofilter.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
                  85 Ekor
                </span>
                <button
                  type="button"
                  onClick={() => toggleActuator("aerator")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border cursor-pointer ${
                    !edgeOnline
                      ? "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      : isAeratorOn
                      ? "bg-[#165B39] text-white border-[#165B39]"
                      : "bg-[#F9FAFB] text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {!edgeOnline
                    ? `Aerator: Antrean ${isAeratorOn ? "ON" : "OFF"}`
                    : isAeratorOn
                    ? "Aerator: ON"
                    : "Aerator: OFF"}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">Biomassa Est.</div>
                <div className="font-semibold text-[#111827] mt-0.5">~14.2 kg</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Suhu Kolam</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedTemp === "--" ? "--" : `${formattedTemp} °C`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Batas Kritis DO</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&gt; 5.0 mg/L</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Jadwal Pakan</div>
                <div className="font-semibold text-[#111827] mt-0.5">07:00 &bull; 16:30</div>
              </div>
            </div>
          </div>

          {/* FLOW 3 -> 2 */}
          <div className="flex items-center justify-between px-4 py-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#165B39]" />
              <span>Siphon aliran kaya amonia &rarr; menuju biofilter Kangkung (50 cm)</span>
            </div>
            <span className="font-medium text-[#9CA3AF]">Nitrifikasi</span>
          </div>

          {/* LEVEL 2: KANGKUNG */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
                    L2 &bull; 60 cm
                  </span>
                  <span className="text-xs font-semibold text-[#111827]">
                    Zona Biofilter
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Ipomoea aquatica</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Sayuran Kangkung Air &amp; Media Hydroton
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Perakaran padat mengikat koloni bakteri nitrifikasi untuk mengonversi amonia menjadi nitrat sebelum air masuk ke kolam dasar.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold shrink-0">
                100 Netpot
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">Bakteri Aktif</div>
                <div className="font-semibold text-[#111827] mt-0.5">Nitrosomonas</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Konversi NH3</div>
                <div className="font-semibold text-[#165B39] mt-0.5">94.2% Efektif</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">TDS Terukur</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedTDS === "--" ? "--" : `${formattedTDS} ppm`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Media Akar</div>
                <div className="font-semibold text-[#111827] mt-0.5">Clay Hydroton</div>
              </div>
            </div>
          </div>

          {/* FLOW 2 -> 1 */}
          <div className="flex items-center justify-between px-4 py-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#165B39]" />
              <span>Effluent jernih ber-DO rendah &rarr; kolam dasar Lele (50 cm)</span>
            </div>
            <span className="font-medium text-[#9CA3AF]">Air Terfiltrasi</span>
          </div>

          {/* LEVEL 1: LELE */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] text-[11px] font-semibold">
                    L1 &bull; 10 cm
                  </span>
                  <span className="text-xs font-semibold text-[#111827]">
                    Dasar Menara &amp; Sump Pump
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Clarias sp.</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Kolam Ikan Lele &amp; Pompa Lift 12V
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Organ arboresen membuat Lele toleran pada oksigen terlarut rendah. Kolam berfungsi sebagai sump suction pompa lift kembali ke puncak Level 4.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
                  120 Ekor
                </span>
                <button
                  type="button"
                  onClick={() => toggleActuator("waterPump")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border cursor-pointer ${
                    !edgeOnline
                      ? "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      : isPumpOn
                      ? "bg-[#165B39] text-white border-[#165B39]"
                      : "bg-[#F9FAFB] text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {!edgeOnline
                    ? `Pompa: Antrean ${isPumpOn ? "ON" : "OFF"}`
                    : isPumpOn
                    ? "Pompa: ON (45W)"
                    : "Pompa: OFF"}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">Toleransi DO</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&lt; 3.0 mg/L</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Biomassa Est.</div>
                <div className="font-semibold text-[#111827] mt-0.5">~18.5 kg</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Node Kontrol</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  {edgeOnline ? systemMeta.edgeNode : "ESP32 Offline"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Sirkulasi Lift</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&uarr; Ke Level 4</div>
              </div>
            </div>
          </div>

          {/* RETURN PIPE BAR */}
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <ArrowUp className="h-3.5 w-3.5 text-[#165B39] shrink-0" />
              <span>
                Pipa PVC 1/2&quot; mengangkat air nutrisi 150 cm dari Sump L1 kembali ke puncak L4.
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
              Resirkulasi 100%
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: BIOGEOCHEMICAL & PAIRING LOGIC */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Nitrogen Cycle */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#F3F4F6]">
              Siklus Nitrifikasi Biofilter
            </h3>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111827]">1. Amonia Terlarut (NH3)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold">
                    Ekskresi L3
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Limbah metabolisme insang dan sisa pakan Nila menghasilkan amonia sebagai bahan baku awal.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111827]">2. Oksidasi Nitrit (NO2-)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold">
                    Nitrosomonas
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Bakteri aerobik pada pori hydroton mengoksidasi amonia menjadi senyawa nitrit.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111827]">3. Asimilasi Nitrat (NO3-)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-semibold">
                    Diserap Akar
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Nitrobacter mengubah nitrit menjadi nitrat yang langsung diserap daun Pakcoy &amp; Kangkung.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Biological Pairing Rationale */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#F3F4F6]">
              Pasangan Hayati Adaptif Iklim
            </h3>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-3 space-y-1">
                <span className="font-semibold text-[#165B39] block">
                  Nila Merah &times; Pakcoy (L3–L4)
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Nila sensitif terhadap penurunan DO (&lt;3 mg/L), sehingga ditempatkan persis di bawah limpahan aerasi talang NFT Pakcoy.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="font-semibold text-[#165B39] block">
                  Ikan Lele &times; Kangkung (L1–L2)
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Lele bertahan pada air rendah DO di kolam dasar setelah akar masif kangkung menyaring amonia dan menyuplai air bersih ke sump.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
