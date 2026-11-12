"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertOctagon, ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { ControlsHeader } from "@/components/controls/ControlsHeader";
import { RelaySwitchCard } from "@/components/controls/RelaySwitchCard";
import { QuickFeedBanner } from "@/components/controls/QuickFeedBanner";
import { SafetyInterlockPanel } from "@/components/controls/SafetyInterlockPanel";
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
  const queuedOnCount = actuatorList.filter((a) => a.isOn).length;
  const activeCount = systemMeta.edgeOnline ? queuedOnCount : 0;
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
        queuedCount={queuedOnCount}
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

      {/* Slim Single-Line Connectivity Strip */}
      <div
        className={`flex items-center gap-2.5 rounded-[18px] border px-4 py-2.5 text-xs ${
          systemMeta.edgeOnline
            ? "border-[#165B39]/20 bg-[#DCFCE7]/40 text-[#166534]"
            : "border-[#E5E7EB] bg-white text-[#4B5563]"
        }`}
      >
        {systemMeta.edgeOnline ? (
          <CheckCircle2 className="h-4 w-4 text-[#165B39] shrink-0" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[#9CA3AF] shrink-0" />
        )}
        <span>
          {systemMeta.edgeOnline
            ? `${systemMeta.edgeNode} terhubung — perintah relay aktif via HTTPS (${systemMeta.liveSensorCount}/6 sensor live).`
            : `Node ${systemMeta.edgeNode} sedang offline — saklar mengatur target antrean di server hingga perangkat menyambung.`}
        </span>
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
              {systemMeta.edgeOnline ? "Active-LOW GPIO" : "Antrean Perintah Server"}
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
