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

function formatWibDateTime(iso: string | null): string {
  if (!iso) return "Belum ada paket";
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "Belum ada paket";
  return (
    new Date(ms).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB"
  );
}

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
      {/* 1. Clean Unboxed Page Header matching Dashboard & Prediksi AI */}
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

      {/* 2. Honest Compact Connectivity Strip (No Blue Hero Banner) */}
      {!systemMeta.edgeOnline ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-[#4B5563]">
            <div className="h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9CA3AF]" />
            </div>
            <span className="text-[#111827] leading-relaxed">
              <strong className="text-[#374151]">Aktuator Fisik Belum Terhubung ({systemMeta.edgeNode} Offline):</strong>{" "}
              Belum ada perangkat ESP32 yang menyambung ke server VPS. Saklar di bawah hanya mengatur target antrean perintah di server dan akan dieksekusi saat ESP32 online.
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] font-mono text-[10.5px] font-semibold text-[#4B5563] shrink-0">
            Command Queue Mode
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#165B39]/25 bg-white px-5 py-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-[#166534]">
            <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-[#165B39]" />
            </div>
            <span className="text-[#111827] leading-relaxed">
              <strong className="text-[#165B39]">{systemMeta.edgeNode} Terhubung:</strong>{" "}
              Sinkronisasi perintah relay aktif via HTTPS{" "}
              {typeof systemMeta.wifiSignalDbm === "number"
                ? `(Wi-Fi ${systemMeta.wifiSignalDbm} dBm) `
                : ""}
              dengan {activeCount}/{totalCount} kanal aktif.
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#166534]/15 font-mono text-[10.5px] font-semibold text-[#166534] shrink-0">
            {systemMeta.liveSensorCount}/6 Sensor Live
          </span>
        </div>
      )}

      {/* ===================================================================
          3. ASYMMETRIC 2-COLUMN MAIN CONSOLE:
             LEFT: RELAY CHANNELS & FEED PULSE
             RIGHT: SAFETY INTERLOCK, DYNAMIC SCHEDULES & ESP32 NODE INFO
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: RELAY SWITCHBOARD */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Kanal Relay Node ({systemMeta.edgeNode})
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {systemMeta.edgeOnline
                    ? "Klik saklar geser untuk mengubah status relay pada ESP32."
                    : "ESP32 sedang offline — klik saklar untuk mengatur target antrean perintah di server."}
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded border font-mono text-[10.5px] font-bold ${
                  systemMeta.edgeOnline
                    ? "bg-[#DCFCE7]/70 border-[#166534]/20 text-[#166534]"
                    : "bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                {systemMeta.edgeOnline ? "ACTIVE-LOW GPIO" : "QUEUE TARGET"}
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
          </div>

          <QuickFeedBanner
            onDispense={dispenseFeed}
            feedActive={feedActive}
            edgeOnline={systemMeta.edgeOnline}
            edgeNode={systemMeta.edgeNode}
          />
        </div>

        {/* RIGHT COLUMN: SAFETY INTERLOCKS, LIVE SCHEDULES & HARDWARE SPECS */}
        <div className="lg:col-span-5 space-y-4">
          <SafetyInterlockPanel
            sensors={sensors}
            actuators={actuators}
            edgeNode={systemMeta.edgeNode}
          />

          {/* 2. Dynamic Automation Schedules (Backed by SQLite /api/schedules) */}
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#165B39] uppercase tracking-wider block">
                  Jadwal Otomasi Database
                </span>
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wide mt-0.5">
                  Agenda Siklus &amp; Aturan Sensor (WIB)
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                  !systemMeta.edgeOnline
                    ? "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                    : enabledSchedulesCount > 0
                    ? "bg-[#DCFCE7] text-[#166534] border-[#166534]/15"
                    : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]"
                }`}
              >
                {!systemMeta.edgeOnline
                  ? `${enabledSchedulesCount} Siaga (Offline)`
                  : enabledSchedulesCount > 0
                  ? `${enabledSchedulesCount} Auto Aktif`
                  : "Semua Nonaktif"}
              </span>
            </div>

            {schedules.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs text-[#6B7280]">
                Belum ada jadwal otomasi tersimpan di SQLite. Tambah aturan baru lewat Dashboard.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {schedules.map((sched) => (
                  <div
                    key={sched.id}
                    className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-colors ${
                      sched.enabled
                        ? "bg-[#F8F9FA] border-[#E5E7EB]"
                        : "bg-[#F9FAFB]/60 border-[#E5E7EB]/60 opacity-65"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          sched.triggerType === "sensor_threshold"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : sched.enabled
                            ? "bg-[#165B39] text-white"
                            : "bg-[#D1D5DB] text-[#374151]"
                        }`}
                      >
                        {sched.triggerType === "time"
                          ? sched.scheduleTime || "--:--"
                          : `${sched.operator || ">"}${sched.thresholdValue ?? ""}`}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-[#111827] block text-[11px] truncate">
                          {sched.title}
                        </span>
                        <span className="text-[10px] text-[#6B7280] block truncate">
                          Target: {sched.actuatorId} &rarr;{" "}
                          {sched.targetState ? "ON" : "OFF"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleSchedule(sched.id)}
                      className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border transition-colors shrink-0 cursor-pointer ${
                        sched.enabled
                          ? "bg-white border-[#165B39]/30 text-[#165B39] hover:bg-[#DCFCE7]/50"
                          : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
                      }`}
                      title="Aktifkan/nonaktifkan aturan jadwal ini"
                    >
                      {sched.enabled ? "Aktif" : "Jeda"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#165B39] hover:underline"
              >
                <span>Tambah atau edit jadwal di Dashboard</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* 3. Honest ESP32 Node & Protocol Telemetry */}
          <div
            id="hardware-esp32"
            className="rounded-[20px] bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2 scroll-mt-4"
          >
            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              Diagnostik Node ESP32 &amp; Sinkronisasi
            </span>
            <div className="space-y-1.5 text-xs text-[#4B5563] font-mono">
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Node Target</span>
                <span className="font-bold text-[#111827]">
                  {systemMeta.edgeNode}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Status Koneksi</span>
                <span
                  className={`font-bold ${
                    systemMeta.edgeOnline ? "text-[#165B39]" : "text-[#6B7280]"
                  }`}
                >
                  {systemMeta.edgeOnline
                    ? `ONLINE (${systemMeta.liveSensorCount}/6 Sensor)`
                    : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Sinyal Wi-Fi</span>
                <span className="font-bold text-[#111827]">
                  {systemMeta.edgeOnline && typeof systemMeta.wifiSignalDbm === "number"
                    ? `${systemMeta.wifiSignalDbm} dBm`
                    : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Paket Terakhir</span>
                <span className="font-bold text-[#111827]">
                  {formatWibDateTime(systemMeta.lastTelemetryAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Logika Relay</span>
                <span className="font-bold text-[#111827]">Active-LOW (GPIO)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6B7280]">Sinkronisasi API</span>
                <span className="font-bold text-[#165B39]">HTTPS POST (~2.5s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
