"use client";

import React from "react";
import { Send, Check, Clock } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AutomationReminderCard() {
  const { dispenseFeed, feedActive } = useTelemetry();

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]">
      <div>
        <span className="text-xs font-semibold text-[#111827]">
          Pengingat Otomasi
        </span>
        <div className="mt-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
          <h4 className="text-sm font-bold text-[#165B39] tracking-tight">
            Pemberian Pakan Terjadwal (35g)
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-[#4B5563] mt-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <span>Waktu : 14.00 WIB (Siklus Siang)</span>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-2 leading-relaxed">
            Pakan apung protein 32% untuk 85 ekor Ikan Nila L3.
          </p>
        </div>
      </div>

      {/* Primary CTA Button (Matching + Start Meeting in Donezo) */}
      <button
        onClick={dispenseFeed}
        className={`w-full py-3 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
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
