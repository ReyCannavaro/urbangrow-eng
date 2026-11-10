"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  CalendarClock,
  Plus,
  Trash2,
  Clock,
  Gauge,
  Check,
} from "lucide-react";
import { AutomationSchedule } from "@/lib/types";
import {
  createAutomationScheduleItem,
  deleteAutomationScheduleItem,
  toggleAutomationScheduleItem,
} from "@/lib/operationsApi";

interface AutomationScheduleModalProps {
  isOpen: boolean;
  schedules: AutomationSchedule[];
  onSchedulesChange: (updated: AutomationSchedule[]) => void;
  onClose: () => void;
}

const ACTUATOR_LABELS: Record<string, string> = {
  feeder: "Auto-Feeder Ikan (35g)",
  growLight: "LED Grow Light (RELAY-03)",
  aerator: "Aerator Oksigen (RELAY-02)",
  waterPump: "Pompa Sirkulasi 12V (RELAY-01)",
  dosingPump: "Pompa Buffer pH (RELAY-04)",
};

const METRIC_LABELS: Record<string, string> = {
  dissolvedOxygen: "Oksigen Terlarut DO (mg/L)",
  waterTemperature: "Suhu Air Kolam (°C)",
  ph: "pH Air Kolam",
  lightIntensity: "Intensitas Cahaya LDR (lux)",
  waterLevel: "Level Air Tandon (%)",
};

export function AutomationScheduleModal({
  isOpen,
  schedules,
  onSchedulesChange,
  onClose,
}: AutomationScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [triggerType, setTriggerType] = useState<"time" | "sensor_threshold">("time");
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [sensorMetric, setSensorMetric] = useState("dissolvedOxygen");
  const [operator, setOperator] = useState<"<" | ">">("<");
  const [thresholdValue, setThresholdValue] = useState("5.5");
  const [actuatorId, setActuatorId] = useState("feeder");
  const [targetState, setTargetState] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setSubmitting(true);
    try {
      const updated = await createAutomationScheduleItem({
        title: cleanTitle,
        triggerType,
        scheduleTime: triggerType === "time" ? scheduleTime : undefined,
        sensorMetric: triggerType === "sensor_threshold" ? sensorMetric : undefined,
        operator: triggerType === "sensor_threshold" ? operator : undefined,
        thresholdValue:
          triggerType === "sensor_threshold" ? Number(thresholdValue) || 5.5 : undefined,
        actuatorId,
        targetState: actuatorId === "feeder" ? true : targetState,
        notes,
      });
      onSchedulesChange(updated);
      setTitle("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    const updated = await toggleAutomationScheduleItem(id);
    onSchedulesChange(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteAutomationScheduleItem(id);
    onSchedulesChange(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-3 sm:p-5 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#165B39]/10 text-[#165B39]">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="schedule-modal-title"
                className="text-base font-bold tracking-tight text-[#111827] sm:text-lg"
              >
                Jadwal Otomasi &amp; Aturan Aktuator
              </h2>
              <p className="text-xs text-[#6B7280]">
                Tersimpan permanen di database backend dan dieksekusi otomatis oleh sistem ECAD.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal jadwal otomasi"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Create Form */}
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]/80 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#111827]">
                Tambah Jadwal / Aturan Baru
              </span>
              <div className="inline-flex rounded-full border border-[#E5E7EB] bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTriggerType("time")}
                  className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer ${
                    triggerType === "time"
                      ? "bg-[#165B39] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Jadwal Jam (WIB)
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerType("sensor_threshold")}
                  className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer ${
                    triggerType === "sensor_threshold"
                      ? "bg-[#165B39] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Trigger Sensor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="font-medium text-[#374151]">Nama Jadwal / Aturan</span>
                <input
                  type="text"
                  required
                  placeholder={
                    triggerType === "time"
                      ? "Contoh: Pakan Siang Kolam Nila"
                      : "Contoh: Pendinginan Air Otomatis"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-medium text-[#374151]">Aktuator Target</span>
                <select
                  value={actuatorId}
                  onChange={(e) => setActuatorId(e.target.value)}
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                >
                  {Object.entries(ACTUATOR_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {triggerType === "time" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span className="font-medium text-[#374151]">Waktu Eksekusi (WIB)</span>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                  />
                </label>

                {actuatorId !== "feeder" && (
                  <label className="space-y-1 text-xs">
                    <span className="font-medium text-[#374151]">Aksi Relay</span>
                    <select
                      value={targetState ? "on" : "off"}
                      onChange={(e) => setTargetState(e.target.value === "on")}
                      className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                    >
                      <option value="on">Nyalakan (ON)</option>
                      <option value="off">Matikan (OFF)</option>
                    </select>
                  </label>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-xs">
                  <span className="font-medium text-[#374151]">Parameter Sensor</span>
                  <select
                    value={sensorMetric}
                    onChange={(e) => setSensorMetric(e.target.value)}
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                  >
                    {Object.entries(METRIC_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-medium text-[#374151]">Kondisi Ambang</span>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as "<" | ">")}
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                  >
                    <option value="<">Kurang dari (&lt;)</option>
                    <option value=">">Lebih dari (&gt;)</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-medium text-[#374151]">Nilai Ambang</span>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Catatan singkat (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs text-[#111827] focus:border-[#165B39] focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#165B39] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#124B2E] disabled:opacity-60 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{submitting ? "Menyimpan..." : "Simpan Jadwal"}</span>
              </button>
            </div>
          </form>

          {/* Saved Schedules List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111827]">
                Daftar Jadwal &amp; Aturan Tersimpan ({schedules.length})
              </h3>
              <span className="text-[11px] text-[#6B7280]">SQLite Persisted</span>
            </div>

            <div className="space-y-2">
              {schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3.5 transition-colors hover:border-[#D1D5DB]"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#111827]">
                        {sched.title}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#374151]">
                        {sched.triggerType === "time" ? (
                          <>
                            <Clock className="h-3 w-3 text-[#165B39]" />
                            {sched.scheduleTime} WIB
                          </>
                        ) : (
                          <>
                            <Gauge className="h-3 w-3 text-amber-600" />
                            {sched.sensorMetric} {sched.operator} {sched.thresholdValue}
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      Target: <strong>{ACTUATOR_LABELS[sched.actuatorId] || sched.actuatorId}</strong>
                      {sched.notes ? ` • ${sched.notes}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleToggle(sched.id)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        sched.enabled
                          ? "border-[#165B39]/25 bg-[#165B39]/10 text-[#165B39]"
                          : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
                      }`}
                    >
                      {sched.enabled && <Check className="h-3 w-3" />}
                      {sched.enabled ? "Aktif" : "Nonaktif"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(sched.id)}
                      aria-label={`Hapus jadwal ${sched.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

