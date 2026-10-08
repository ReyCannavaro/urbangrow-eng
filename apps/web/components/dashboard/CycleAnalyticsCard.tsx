"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function CycleAnalyticsCard() {
  const { sensors } = useTelemetry();

  // 7-day weekly telemetry data matching Donezo capsule chart
  const days = [
    { day: "S", height: "65%", isHatched: true, isSolid: false },
    { day: "M", height: "82%", isHatched: false, isSolid: false, color: "#4EAB7C", badge: "74%" },
    { day: "T", height: "95%", isHatched: false, isSolid: true, color: "#165B39" },
    { day: "W", height: "100%", isHatched: false, isSolid: true, color: "#165B39" },
    { day: "T", height: "70%", isHatched: true, isSolid: false },
    { day: "F", height: "60%", isHatched: true, isSolid: false },
    { day: "S", height: "75%", isHatched: true, isSolid: false },
  ];

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#111827]">
            Stabilitas Siklus Mingguan
          </span>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">
            Tren klorofil daun & saturasi oksigen
          </p>
        </div>
        <Link
          href="/analytics"
          className="h-7 w-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors"
          title="Buka Analitik"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 7-Day Capsule Bars (Matching Donezo Project Analytics) */}
      <div className="flex items-end justify-between h-36 px-2 pt-4">
        {days.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end relative group">
            {/* Tooltip Badge above Monday */}
            {item.badge && (
              <div className="absolute -top-3 z-10 px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#165B39] font-mono text-[9px] font-bold shadow-2xs whitespace-nowrap">
                {item.badge}
              </div>
            )}

            {/* Vertical Capsule Bar */}
            <div
              style={{
                height: item.height,
                backgroundColor: item.color || undefined,
              }}
              className={`w-7 rounded-full transition-all duration-300 ${
                item.isHatched ? "bg-hatched-diagonal border border-dashed border-[#CBD5E1]" : ""
              }`}
            />

            {/* Day Label */}
            <span className="text-[10px] font-mono font-medium text-[#9CA3AF] mt-1">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
