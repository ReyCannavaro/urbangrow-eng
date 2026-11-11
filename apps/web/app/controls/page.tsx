"use client";

import React from "react";
import { AlertOctagon, X } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { ControlsHeader } from "@/components/controls/ControlsHeader";
import { RelaySwitchCard } from "@/components/controls/RelaySwitchCard";
import { QuickFeedBanner } from "@/components/controls/QuickFeedBanner";
import { SafetyInterlockPanel } from "@/components/controls/SafetyInterlockPanel";

export default function ControlsPage() {
  const {
    sensors,
    systemMeta,
    actuators,
    toggleActuator,
    dispenseFeed,
    feedActive,
    lastActuatorError,
    clearActuatorError,
  } = useTelemetry();

  const actuatorList = Object.values(actuators);
  const totalLoad = actuatorList.reduce(
    (acc, a) => acc + (a.isOn ? a.powerWatts : 0),
    0
  );
  const activeCount = actuatorList.filter((a) => a.isOn).length;
  const totalCount = actuatorList.length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Active Relay Telemetry */}
      <ControlsHeader
        totalLoadWatts={totalLoad}
        activeCount={activeCount}
        totalCount={totalCount}
      />

      {lastActuatorError && (
        <div className="flex items-center justify-between gap-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              <strong>Safety Interlock:</strong> {lastActuatorError}
            </span>
          </div>
          <button
            type="button"
            onClick={clearActuatorError}
            className="h-6 w-6 rounded-full hover:bg-rose-100 flex items-center justify-center text-rose-600 cursor-pointer"
            aria-label="Tutup peringatan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================
          2. INDUSTRIAL EDGE POWER & CIRCUIT HUD (Calm, Typography-Led)
          =================================================================== */}
      <div className="rounded-[20px] bg-[#1E293B] text-white p-5 sm:p-6 shadow-sm border border-[#334155]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
                EDGE POWER BUS &bull; HARDWARE INTERLOCK DECK
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Konsol Daya Catu Ganda 12V DC &amp; Saklar Optocoupler
            </h2>
            <p className="text-xs text-white/75 max-w-2xl leading-relaxed">
              Semua modul relay 4-channel dikendalikan via Active-Low logic dengan isolasi optocoupler PC817. Relay otomatis berpindah ke baterai SLA 12V 7Ah tanpa jeda (0ms transfer) saat suplai PLN terputus.
            </p>
          </div>

          {/* Integrated Circuit Telemetry Gauges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Total Beban</div>
              <div className="font-bold text-white text-sm num-tabular mt-0.5">
                <span className="text-[#F59E0B]">{totalLoad} W</span>
                <span className="text-[10px] text-white/40 ml-1">/ 180W</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Tegangan Bus</div>
              <div className="font-bold text-[#38BDF8] text-sm num-tabular mt-0.5">
                12.2 V DC
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[9.5px] uppercase tracking-wider text-white/50">Kanal Aktif</div>
              <div className="font-bold text-[#68C194] text-sm num-tabular mt-0.5">
                {activeCount} / {totalCount} ON
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. ASYMMETRIC 2-COLUMN MAIN CONSOLE:
             LEFT (60%): 4-BAY TACTICAL HARDWARE SWITCHBOARD
             RIGHT (40%): SAFETY INTERLOCK & SCHEDULED AUTOMATION
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 4-CHANNEL RELAY SWITCHBOARD */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Kanal Relay Fisik (Optoisolated 10A)
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Klik saklar geser untuk mengubah status kontak fisik relay seketika.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-mono text-[10.5px] font-bold">
                ACTIVE-LOW GPIO
              </span>
            </div>

            {/* List of 4-5 Relays in a Clean Single-Stack or 2-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {actuatorList.map((act) => (
                <RelaySwitchCard
                  key={act.id}
                  actuator={act}
                  onToggle={toggleActuator}
                />
              ))}
            </div>
          </div>

          {/* Quick Immediate Action Bar (Fish Feeder Pulse) */}
          <QuickFeedBanner onDispense={dispenseFeed} feedActive={feedActive} />
        </div>

        {/* RIGHT COLUMN: SAFETY INTERLOCKS & AUTOMATION TIMELINE */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Real-time Hardware Safety Interlock Bay */}
          <SafetyInterlockPanel
            sensors={sensors}
            actuators={actuators}
            edgeNode={systemMeta.edgeNode}
          />

          {/* 2. Scheduled Automation Timeline (ECAD Routine) */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#165B39] uppercase tracking-wider block">
                  Jadwal Otomasi
                </span>
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wide mt-0.5">
                  Agenda Siklus Harian (WIB)
                </h4>
              </div>
              <span className="text-[10px] font-mono font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                Auto Aktif
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#165B39] text-white font-mono text-[10px] font-bold">
                    07:00
                  </span>
                  <div>
                    <span className="font-bold text-[#111827] block text-[11px]">Pakan Pagi Nila &amp; Lele</span>
                    <span className="text-[10px] text-[#6B7280]">Dispense 35g pelet protein 32%</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#165B39] font-bold">Terjadwal</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#165B39] text-white font-mono text-[10px] font-bold">
                    16:30
                  </span>
                  <div>
                    <span className="font-bold text-[#111827] block text-[11px]">Pakan Sore Nila &amp; Lele</span>
                    <span className="text-[10px] text-[#6B7280]">Dispense 35g pelet sore</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#165B39] font-bold">Terjadwal</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FEF3C7]/40 border border-[#FDE68A]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#D97706] text-white font-mono text-[10px] font-bold">
                    18:00
                  </span>
                  <div>
                    <span className="font-bold text-[#92400E] block text-[11px]">Grow Light Fotoperiode</span>
                    <span className="text-[10px] text-[#B45309]">Siklus 12 Jam LED Full-Spectrum</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#B45309] font-bold">12 Jam</span>
              </div>
            </div>
          </div>

          {/* 3. Hardware Fail-Safe Specifications */}
          <div className="rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              Spesifikasi Sirkuit Relay ESP32
            </span>
            <div className="space-y-1.5 text-xs text-[#4B5563] font-mono">
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Trigger Koil</span>
                <span className="font-bold text-[#111827]">Active-LOW (0V)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Isolasi</span>
                <span className="font-bold text-[#111827]">PC817 Optocoupler</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Watchdog WDT</span>
                <span className="font-bold text-[#165B39]">8.000 ms</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6B7280]">Backup Baterai</span>
                <span className="font-bold text-[#0284C7]">SLA 12V 7Ah (0ms)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
