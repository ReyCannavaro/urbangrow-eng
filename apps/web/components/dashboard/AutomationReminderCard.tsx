"use client";

import React from "react";
import { Send, Check, Clock, Gauge, SlidersHorizontal } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AutomationSchedule } from "@/lib/types";

interface AutomationReminderCardProps {
  schedules?: AutomationSchedule[];
  onManageSchedules?: () => void;
}

export function AutomationReminderCard({
  schedules = [],
  onManageSchedules,
}: AutomationReminderCardProps) {
  const { dispenseFeed, feedActive } = useTelemetry();

  const activeSchedules = schedules.filter((s) => s.enabled);
  const primarySchedule = activeSchedules[0];

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#111827]">
            Pengingat Otomasi ({activeSchedules.length} Aktif)
          </span>
          {onManageSchedules && (
            <button
              type="button"
              onClick={onManageSchedules}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] hover:border-[#D1D5DB] cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3 text-[#165B39]" />
              <span>Atur Jadwal</span>
            </button>
          )}
        </div>

        <div className="mt-3.5 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
          <h4 className="text-sm font-bold text-[#165B39] tracking-tight truncate">
            {primarySchedule
              ? primarySchedule.title
              : "Pemberian Pakan Terjadwal (35g)"}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-[#4B5563] mt-1.5 font-medium">
            {primarySchedule?.triggerType === "sensor_threshold" ? (
              <>
                <Gauge className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>
                  Trigger: {primarySchedule.sensorMetric} {primarySchedule.operator}{" "}
                  {primarySchedule.thresholdValue}
                </span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />
                <span>
                  Waktu : {primarySchedule?.scheduleTime || "07:00"} WIB (Otomatis Harian)
                </span>
              </>
            )}
          </div>
          <p className="text-[10.5px] text-[#6B7280] mt-2 leading-relaxed line-clamp-2">
            {primarySchedule?.notes ||
              "Pakan pelet apung protein 32% untuk kolam Ikan Nila L3 & Lele L1."}
          </p>
        </div>
      </div>

      {/* Primary CTA Button */}
      <button
        onClick={dispenseFeed}
        className={`w-full py-3 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
          feedActive
            ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/30"
            : "bg-[#165B39] hover:bg-[#124B2E] text-white"
        }`}
      >
        {feedActive ? (
          <>
            <Check className="h-4 w-4 stroke-[3]" />
            <span>35g Pakan Telah Didistribusikan!</span>
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            <span>+ Beri Pakan Sekarang</span>
          </>
        )}
      </button>
    </div>
  );
}
