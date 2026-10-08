"use client";

import React from "react";
import {
  Zap,
  Cpu,
  BatteryCharging,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { ControlsHeader } from "@/components/controls/ControlsHeader";
import { RelaySwitchCard } from "@/components/controls/RelaySwitchCard";
import { QuickFeedBanner } from "@/components/controls/QuickFeedBanner";
import { AnomalySimulationSuite } from "@/components/controls/AnomalySimulationSuite";

export default function ControlsPage() {
  const {
    actuators,
    toggleActuator,
    dispenseFeed,
    feedActive,
    setAnomaly,
    anomalyMode,
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

      {/* 2. Donezo 4-Metric Bento Row (Identitas Visual Dashboard Utama) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HERO INVERTED CARD: Total Daya Beban Relay */}
        <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">
              Total Daya Beban Relay
            </span>
            <div
              className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
              title="Konsumsi Daya Aktif"
            >
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
              {totalLoad}
              <span className="text-xl font-normal text-white/80 ml-1">Watt</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
              <TrendingUp className="h-3 w-3 text-[#68C194]" />
              <span>Beban Operasional Terukur</span>
            </div>
          </div>
        </div>

        {/* 2. KANAL RELAY AKTIF */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Kanal Relay Aktif
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <Cpu className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              {activeCount}
              <span className="text-xl font-normal text-[#9CA3AF] ml-1">
                / {totalCount}
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
              <CheckCircle2 className="h-3 w-3" />
              <span>{activeCount} Aktif • {totalCount - activeCount} Siaga</span>
            </div>
          </div>
        </div>

        {/* 3. TEGANGAN CATU DAYA BUS */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Tegangan Catu Daya Bus
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <BatteryCharging className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
              12.2
              <span className="text-xl font-normal text-[#9CA3AF] ml-1">V DC</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[10px] font-medium text-[#0369A1]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Adaptor Primer + Backup 7Ah</span>
            </div>
          </div>
        </div>

        {/* 4. PROTEKSI OVERLOAD EDGE */}
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">
              Proteksi Sirkuit Relay
            </span>
            <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold tracking-tight text-[#111827]">
              Aman
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Optoisolator PC817 • Fuse 10A</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Container: 5 Hardware Relay Switches Grid */}
      <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold shadow-2xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  Kanal Relay Ekosistem (Active-Low Control)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#165B39] text-white font-mono text-[10px] font-bold">
                  5 Kanal
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Sentuh sakelar geser taktil untuk mengubah status aktuator relay secara instan (0ms delay).
              </p>
            </div>
          </div>

          <div className="text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] font-bold">
              OPTOISOLATED 250V AC / 30V DC 10A
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actuatorList.map((act) => (
            <RelaySwitchCard
              key={act.id}
              actuator={act}
              onToggle={toggleActuator}
            />
          ))}
        </div>
      </div>

      {/* 4. Manual Immediate Action Banner */}
      <QuickFeedBanner onDispense={dispenseFeed} feedActive={feedActive} />

      {/* 5. Environmental Anomaly Simulation Suite */}
      <AnomalySimulationSuite
        anomalyMode={anomalyMode}
        onSetAnomaly={setAnomaly}
      />

      {/* 6. Signature Wavy Ribbon Footer: Fail-safe Hardware Specs */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#68C194] animate-pulse" />
            <h3 className="text-sm font-bold tracking-tight text-white">
              Sistem Proteksi Catu Daya Ganda & Watchdog ESP32
            </h3>
          </div>
          <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
            Dilengkapi sirkuit dioda flyback peredam arus balik induktif relay, isolasi optocoupler PC817 terhadap noise sinyal ESP32, dan pemindahan daya otomatis 0ms jika adaptor utama terputus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-white">
            ISOLASI OPTOCOUPLER
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-mono font-bold text-[#68C194]">
            FAIL-SAFE 0MS
          </div>
        </div>
      </div>
    </div>
  );
}
