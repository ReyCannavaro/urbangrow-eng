"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertOctagon, ArrowUpRight, X } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { ControlsHeader } from "@/components/controls/ControlsHeader";
import { RelaySwitchCard } from "@/components/controls/RelaySwitchCard";
import { QuickFeedBanner } from "@/components/controls/QuickFeedBanner";
import { SafetyInterlockPanel } from "@/components/controls/SafetyInterlockPanel";
import { PumpDiagnosticsCard } from "@/components/controls/PumpDiagnosticsCard";
import {
  fetchAutomationSchedules,
  toggleAutomationScheduleItem,
} from "@/lib/operationsApi";
import { AutomationSchedule } from "@/lib/types";

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

  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchAutomationSchedules().then((items) => {
      if (!cancelled) setSchedules(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleSchedule = async (id: string) => {
    const updated = await toggleAutomationScheduleItem(id);
    setSchedules(updated);
  };

  const actuatorList = Object.values(actuators);
  const activeCount = systemMeta.edgeOnline ? actuatorList.filter((a) => a.isOn).length : 0;
  const totalLoad = systemMeta.edgeOnline
    ? actuatorList.reduce((acc, a) => acc + (a.isOn ? a.powerWatts : 0), 0)
    : 0;
  const totalCount = actuatorList.length;
  const enabledSchedulesCount = schedules.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <ControlsHeader
        edgeOnline={systemMeta.edgeOnline}
        edgeNode={systemMeta.edgeNode}
        totalLoadWatts={totalLoad}
        activeCount={activeCount}
        totalCount={totalCount}
      />

      {lastActuatorError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-xs text-[#111827] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-rose-900 block leading-tight">
                Interlock Keamanan Aktuator
              </span>
              <span className="text-[11.5px] text-[#4B5563] leading-relaxed">
                {lastActuatorError}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearActuatorError}
            className="h-6 w-6 rounded-lg hover:bg-rose-100 flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup peringatan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hardware Telemetry & Edge Protocol Strip (Studio Minimalist) */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Live Node Identity & Protocol */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              {systemMeta.edgeOnline ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#165B39]"></span>
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#9CA3AF]" />
              )}
              <span className="font-mono text-xs font-semibold text-[#111827]">
                {systemMeta.edgeNode}
              </span>
            </div>

            <span className="hidden sm:inline-block h-3.5 w-px bg-[#E5E7EB]" />

            <div className="text-[11.5px] text-[#4B5563] truncate">
              {systemMeta.edgeOnline ? (
                <span>
                  Gateway REST API <span className="text-[#9CA3AF]">&bull;</span> Perintah relay tersinkronisasi via HTTPS
                </span>
              ) : (
                <span className="text-amber-800 font-medium">
                  Modul hardware belum terhubung &bull; Saklar otomatis kembali OFF demi proteksi perangkat
                </span>
              )}
            </div>
          </div>

          {/* Right: Technical Badges */}
          <div className="flex items-center gap-2 shrink-0 text-[11px]">
            <span
              className={`px-2.5 py-0.5 rounded-lg font-mono font-medium border ${
                systemMeta.edgeOnline
                  ? "bg-[#F0FDF4] border-emerald-200 text-[#166534]"
                  : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              {systemMeta.edgeOnline
                ? `${systemMeta.liveSensorCount}/4 SENSOR LIVE`
                : "OFFLINE"}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] font-mono">
              ACTIVE-LOW
            </span>
          </div>
        </div>
      </div>

      {/* Main Switchboard + Right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: FLAT RELAY SWITCHBOARD */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-[#111827]">
              Kanal Relay ({systemMeta.edgeNode})
            </h2>
            <span className="text-xs text-[#6B7280]">
              {systemMeta.edgeOnline ? "Active-LOW GPIO" : "Maaf, alat sedang offline"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {actuatorList.map((act) => (
              <RelaySwitchCard
                key={act.id}
                actuator={act}
                edgeOnline={systemMeta.edgeOnline}
                onToggle={toggleActuator}
              />
            ))}
          </div>

          <QuickFeedBanner
            onDispense={dispenseFeed}
            feedActive={feedActive}
            edgeOnline={systemMeta.edgeOnline}
            edgeNode={systemMeta.edgeNode}
          />
        </div>

        {/* RIGHT COLUMN: INTERLOCKS & SCHEDULES */}
        <div className="lg:col-span-5 space-y-4">
          <PumpDiagnosticsCard
            sensors={sensors}
            pump={actuators.waterPump}
            edgeOnline={systemMeta.edgeOnline}
            edgeNode={systemMeta.edgeNode}
            onTogglePump={() => void toggleActuator("waterPump")}
          />

          <SafetyInterlockPanel
            sensors={sensors}
            actuators={actuators}
            edgeNode={systemMeta.edgeNode}
          />

          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-bold text-[#111827]">
                Jadwal Otomasi (WIB)
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  !systemMeta.edgeOnline
                    ? "bg-[#F3F4F6] text-[#6B7280]"
                    : enabledSchedulesCount > 0
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {!systemMeta.edgeOnline
                  ? `${enabledSchedulesCount} Siaga`
                  : enabledSchedulesCount > 0
                  ? `${enabledSchedulesCount} Aktif`
                  : "Nonaktif"}
              </span>
            </div>

            {schedules.length === 0 ? (
              <p className="py-4 text-xs text-[#6B7280]">
                Belum ada jadwal tersimpan. Tambah aturan baru lewat Dashboard.
              </p>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {schedules.map((sched) => (
                  <div
                    key={sched.id}
                    className={`py-3 flex items-center justify-between gap-2.5 ${
                      sched.enabled ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold num-tabular shrink-0 ${
                          sched.triggerType === "sensor_threshold"
                            ? "bg-[#FEF3C7] text-[#B45309]"
                            : sched.enabled
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {sched.triggerType === "time"
                          ? sched.scheduleTime || "--:--"
                          : `${sched.operator || ">"}${sched.thresholdValue ?? ""}`}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#111827] block text-xs truncate">
                          {sched.title}
                        </span>
                        <span className="text-[11px] text-[#6B7280] block truncate">
                          {sched.actuatorId} &rarr; {sched.targetState ? "ON" : "OFF"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleSchedule(sched.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors shrink-0 cursor-pointer ${
                        sched.enabled
                          ? "bg-white border-[#165B39]/30 text-[#165B39] hover:bg-[#DCFCE7]/50"
                          : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      {sched.enabled ? "Aktif" : "Jeda"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#F3F4F6] flex justify-end">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#165B39] hover:underline"
              >
                <span>Kelola jadwal di Dashboard</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
