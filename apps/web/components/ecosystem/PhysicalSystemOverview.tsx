"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, Droplets } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import {
  fetchAgriBotDiagnostics,
  getDefaultPredictionCohort,
  readStoredPredictionCohort,
} from "@/lib/aiApi";
import { PredictionCohortConfig } from "@/lib/types";

const DEFAULT_COHORT_SNAPSHOT = getDefaultPredictionCohort();
let cachedCohortRaw: string | null = null;
let cachedCohortSnapshot: PredictionCohortConfig = DEFAULT_COHORT_SNAPSHOT;
const cohortListeners = new Set<() => void>();

function subscribeCohortStorage(callback: () => void) {
  cohortListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "urbangrow_prediction_cohort_v1") {
      cachedCohortRaw = null;
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    cohortListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getCohortSnapshot(): PredictionCohortConfig {
  if (typeof window === "undefined") return DEFAULT_COHORT_SNAPSHOT;
  const raw = window.localStorage.getItem("urbangrow_prediction_cohort_v1");
  if (raw === cachedCohortRaw) {
    return cachedCohortSnapshot;
  }
  cachedCohortRaw = raw;
  cachedCohortSnapshot = readStoredPredictionCohort() ?? DEFAULT_COHORT_SNAPSHOT;
  return cachedCohortSnapshot;
}

function getServerCohortSnapshot(): PredictionCohortConfig {
  return DEFAULT_COHORT_SNAPSHOT;
}

function notifyCohortUpdated() {
  cachedCohortRaw = null;
  cohortListeners.forEach((fn) => fn());
}

export function PhysicalSystemOverview() {
  const { sensors, actuators, systemMeta, toggleActuator } = useTelemetry();
  const cohort = useSyncExternalStore(
    subscribeCohortStorage,
    getCohortSnapshot,
    getServerCohortSnapshot
  );

  useEffect(() => {
    let cancelled = false;
    void fetchAgriBotDiagnostics().then((diag) => {
      if (!cancelled && diag?.cohort) {
        notifyCohortUpdated();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;
  const edgeOnline = systemMeta.edgeOnline;

  const hasPh = typeof sensors.ph === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasHumidity = typeof sensors.humidity === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const formattedPH = hasPh ? (sensors.ph as number).toFixed(2) : "--";
  const formattedTDS = hasTds ? String(Math.round(sensors.tds as number)) : "--";
  const formattedTemp = hasTemp ? (sensors.waterTemperature as number).toFixed(1) : "--";
  const formattedAirTemp = hasAirTemp ? (sensors.airTemperature as number).toFixed(1) : "--";
  const formattedHumidity = hasHumidity ? String(Math.round(sensors.humidity as number)) : "--";
  const formattedLux = hasLux ? String(Math.round(sensors.lightIntensity as number)) : "--";

  const isPhOptimal = hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const isTdsOptimal = hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;

  const showNila = cohort.fishMode === "both" || cohort.fishMode === "nila";
  const showLele = cohort.fishMode === "both" || cohort.fishMode === "lele";
  const totalFishCount =
    (showNila ? cohort.nila.count : 0) + (showLele ? cohort.lele.count : 0);

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
              {!edgeOnline ? "Offline" : isPumpOn ? "Aktif" : "Standby"}
              {edgeOnline && (
                <span className="text-base font-normal text-white/75 ml-1.5">
                  {isPumpOn ? "45W" : "0W"}
                </span>
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
              Suhu Air &amp; Cahaya
            </span>
            <span className="text-[11px] text-[#6B7280] font-medium">
              Ideal 22–27°C
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
          2. CLOSED-LOOP CASCADE FLOW: KOLAM -> PAKCOY -> KANGKUNG -> KOLAM
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: HYDRAULIC CASCADE FLOW */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
            <h2 className="text-sm font-bold text-[#111827]">
              Alur Hidrolik Menara Kaskade
            </h2>
            <span className="text-xs text-[#6B7280]">
              Kolam Ikan &rarr; Pakcoy &rarr; Kangkung &rarr; Kolam Ikan
            </span>
          </div>

          {/* INLET BAR: DARI KOLAM NAIK KE PAKCOY */}
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <ArrowUp className="h-3.5 w-3.5 text-[#165B39] shrink-0" />
              <span>
                Pompa 12V (<span className="font-semibold text-[#111827]">RELAY-01</span>) menyedot air dari Kolam Ikan naik ke barisan Pakcoy.
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                !edgeOnline
                  ? "bg-[#F3F4F6] text-[#6B7280]"
                  : isPumpOn
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              {!edgeOnline
                ? "ESP32 Offline"
                : isPumpOn
                ? "Pompa Aktif"
                : "Pompa Standby"}
            </span>
          </div>

          {/* TAHAP 1: SAYURAN PAKCOY */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#165B39] text-white text-[11px] font-semibold">
                    Tahap 1 &bull; Atas
                  </span>
                  <span className="text-xs font-semibold text-[#165B39]">
                    Talang Hidroponik Hulu
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Brassica rapa</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Sayuran Pakcoy (Zonasi Pertama Air Pompa)
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Menerima suplai pertama air kaya nutrisi langsung dari pompa kolam ikan. Air melewati akar pakcoy secara merata lalu mengalir turun lewat kemiringan talang ke zona Kangkung.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold shrink-0">
                {cohort.pakcoy.plantCount} Netpot
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">pH Air (Probe)</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedPH === "--" ? "--" : `${formattedPH} pH`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Cahaya (LDR)</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedLux === "--" ? "--" : `${formattedLux} lux`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Kemiringan</div>
                <div className="font-semibold text-[#111827] mt-0.5">3% Gravitasi</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Aliran Berikutnya</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&darr; Ke Kangkung</div>
              </div>
            </div>
          </div>

          {/* FLOW PAKCOY -> KANGKUNG */}
          <div className="flex items-center justify-between px-4 py-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#165B39]" />
              <span>Air mengalir turun secara gravitasi dari Pakcoy &rarr; masuk ke Zona Kangkung</span>
            </div>
            <span className="font-medium text-[#9CA3AF]">0 Watt</span>
          </div>

          {/* TAHAP 2: SAYURAN KANGKUNG */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
                    Tahap 2 &bull; Tengah
                  </span>
                  <span className="text-xs font-semibold text-[#111827]">
                    Talang Hilir &amp; Biofilter
                  </span>
                  <span className="text-xs text-[#9CA3AF]">&bull;</span>
                  <span className="text-xs text-[#6B7280]">Ipomoea aquatica</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Sayuran Kangkung Air &amp; Media Hydroton
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Menampung limpahan air dari barisan Pakcoy. Perakaran rapat Kangkung dan substrat clay hydroton menyaring padatan serta mengikat bakteri pengurai amonia sebelum air jatuh kembali ke kolam ikan.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold shrink-0">
                {cohort.kangkung.plantCount} Netpot
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">TDS Nutrisi</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedTDS === "--" ? "--" : `${formattedTDS} ppm`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Iklim Mikro (DHT22)</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedAirTemp === "--" && formattedHumidity === "--"
                    ? "--"
                    : `${formattedAirTemp}°C • ${formattedHumidity}%`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Media Biofilter</div>
                <div className="font-semibold text-[#111827] mt-0.5">Clay Hydroton</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Aliran Berikutnya</div>
                <div className="font-semibold text-[#165B39] mt-0.5">&darr; Ke Kolam Ikan</div>
              </div>
            </div>
          </div>

          {/* FLOW KANGKUNG -> KOLAM IKAN */}
          <div className="flex items-center justify-between px-4 py-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-[#165B39]" />
              <span>Air tersaring turun kembali ke kolam ikan &rarr; menghasilkan percikan aerasi alami</span>
            </div>
            <span className="font-medium text-[#9CA3AF]">Kembali ke Kolam</span>
          </div>

          {/* TAHAP 3: KOLAM IKAN BERSEKAT (NILA & LELE + POMPA LIFT) */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] text-[11px] font-semibold">
                    Tahap 3 &bull; Kolam Dasar
                  </span>
                  <span className="text-xs font-semibold text-[#111827]">
                    Bak Budidaya Bersekat &amp; Sump Pompa
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111827] pt-0.5">
                  Kolam Ikan Bersekat (Nila Merah &amp; Lele)
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Air jernih hasil filtrasi akar Kangkung jatuh kembali ke kolam ikan. Kolam bersekat menampung budidaya ikan sekaligus menyediakan ruang hisap bagi Pompa 12V untuk mengangkat nutrisi balik ke Pakcoy.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold shrink-0">
                {totalFishCount} Ekor
              </span>
            </div>

            {/* Measured Pond Telemetry Strip */}
            <div className="pt-3.5 border-t border-[#F3F4F6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-[#6B7280]">Suhu Air (DS18B20)</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedTemp === "--" ? "--" : `${formattedTemp} °C`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">pH Kolam</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedPH === "--" ? "--" : `${formattedPH} pH`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">TDS Kolam</div>
                <div className="font-semibold text-[#111827] num-tabular mt-0.5">
                  {formattedTDS === "--" ? "--" : `${formattedTDS} ppm`}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7280]">Node Kontrol</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  {edgeOnline ? systemMeta.edgeNode : "ESP32 Offline"}
                </div>
              </div>
            </div>

            {/* Two Pond Partitions Separated Cleanly via Hairline Divider */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
              {/* Sekat 1: Ikan Nila */}
              <div className="p-4 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111827]">
                      Sekat 1 &bull; Ikan Nila Merah
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[10.5px] font-semibold text-[#166534]">
                      {showNila ? `${cohort.nila.count} Ekor` : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Berada tepat di area jatuhan air bersih dari Kangkung dengan dukungan Aerator (<span className="font-medium text-[#111827]">RELAY-02</span>).
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#6B7280]">
                    Pakan: <strong className="text-[#111827]">07:00 &bull; 16:30</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleActuator("aerator")}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border cursor-pointer ${
                      !edgeOnline
                        ? "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                        : isAeratorOn
                        ? "bg-[#165B39] text-white border-[#165B39]"
                        : "bg-white text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]"
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

              {/* Sekat 2: Ikan Lele & Sump Pump */}
              <div className="p-4 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111827]">
                      Sekat 2 &bull; Ikan Lele &amp; Pompa Lift
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[10.5px] font-semibold text-[#374151]">
                      {showLele ? `${cohort.lele.count} Ekor` : "Sump"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Menampung aliran antar-sekat menuju suction Pompa Lift 12V (<span className="font-medium text-[#111827]">RELAY-01</span>) untuk dipompa ulang ke Pakcoy.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#165B39] font-semibold">
                    &uarr; Lift Ke Pakcoy
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleActuator("waterPump")}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border cursor-pointer ${
                      !edgeOnline
                        ? "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                        : isPumpOn
                        ? "bg-[#165B39] text-white border-[#165B39]"
                        : "bg-white text-[#6B7280] border-[#D1D5DB] hover:bg-[#F3F4F6]"
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
            </div>
          </div>

          {/* RETURN PIPE BAR */}
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <ArrowUp className="h-3.5 w-3.5 text-[#165B39] shrink-0" />
              <span>
                Pipa riser PVC menaikkan air dari Kolam Ikan kembali ke Pakcoy &rarr; Kangkung &rarr; Kolam Ikan.
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold">
              Siklus Tertutup
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: BIOGEOCHEMICAL & LOOP RATIONALE */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Nitrogen Cycle */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#F3F4F6]">
              Siklus Nitrifikasi Biofilter
            </h3>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#111827]">1. Amonia Terlarut (NH3)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold shrink-0">
                    Dari Kolam Ikan
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Limbah metabolisme insang dan sisa pakan ikan Nila &amp; Lele di kolam menghasilkan amonia sebelum dipompa naik.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#111827]">2. Oksidasi Nitrit &amp; Nitrat</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold shrink-0">
                    Bakteri Biofilter
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Bakteri Nitrosomonas dan Nitrobacter pada zona akar serta media hydroton Kangkung mengubah amonia menjadi nitrat (NO3-).
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#111827]">3. Penyerapan &amp; Air Balik</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-semibold shrink-0">
                    Air Jernih
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Nitrat diserap langsung oleh daun Pakcoy dan Kangkung sehingga air yang turun kembali ke kolam lebih aman untuk ikan.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Cascade Sequence Summary */}
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#F3F4F6]">
              Urutan Simbiosis Menara
            </h3>

            <div className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-3 space-y-1">
                <span className="font-semibold text-[#165B39] block">
                  1. Kolam &rarr; Pakcoy (Pompa Lift 12V)
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Air bernutrisi dari kolam dinaikkan ke baris Pakcoy. Perakaran Pakcoy yang renggang menjaga aliran air tetap lancar ke hilir.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <span className="font-semibold text-[#165B39] block">
                  2. Pakcoy &rarr; Kangkung (Gravitasi 0W)
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Akar Kangkung yang lebih rapat bersama media hydroton menangkap sisa padatan dan nitrat sebelum air dibuang ke bawah.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="font-semibold text-[#165B39] block">
                  3. Kangkung &rarr; Kolam Ikan (Turun Ulang)
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Air tersaring terjun kembali mengisi kolam Nila Merah dan Lele, sekaligus memicu percikan oksigen alami di permukaan air.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
