"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { useInViewOnce } from "@/components/motion/RevealOnView";

export function CycleAnalyticsCard() {
  const { sensors, history } = useTelemetry();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);

  const liveStability = Math.max(
    55,
    Math.min(
      98,
      Math.round(
        100 -
          Math.abs((sensors.ph ?? 7.0) - 7.0) * 14 -
          Math.abs((sensors.waterTemperature ?? 24.5) - 24.5) * 2
      )
    )
  );

  // Compute real stability percentages from recent database history points when available
  const recentScores = history.slice(-3).map((sample) =>
    Math.max(
      55,
      Math.min(
        98,
        Math.round(
          100 -
            Math.abs((sample.sensors.ph ?? 7.0) - 7.0) * 14 -
            Math.abs((sample.sensors.waterTemperature ?? 24.5) - 24.5) * 2
        )
      )
    )
  );

  const monPct = recentScores[0] ?? 74;
  const tuePct = recentScores[1] ?? 91;
  const wedPct = recentScores[2] ?? liveStability;

  // 7-day weekly telemetry data matching Donezo capsule chart
  const days = [
    { day: "S", height: "65%", isHatched: true, isSolid: false },
    { day: "M", height: `${Math.min(100, monPct)}%`, isHatched: false, isSolid: false, color: "#4EAB7C", badge: `${monPct}%` },
    { day: "T", height: `${Math.min(100, tuePct)}%`, isHatched: false, isSolid: true, color: "#165B39" },
    { day: "W", height: `${Math.min(100, wedPct)}%`, isHatched: false, isSolid: true, color: "#165B39" },
    { day: "T", height: "70%", isHatched: true, isSolid: false },
    { day: "F", height: "60%", isHatched: true, isSolid: false },
    { day: "S", height: "75%", isHatched: true, isSolid: false },
  ];

  return (
    <div
      ref={ref}
      className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#111827]">
            Stabilitas Siklus Mingguan
          </span>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">
            Tren stabilitas pH, nutrisi TDS &amp; cahaya
          </p>
        </div>
        <Link
          href="/analytics"
          className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors group"
          title="Buka Analitik"
        >
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-45" />
        </Link>
      </div>

      {/* 7-Day Capsule Bars (Animated upward wave when scrolled into view) */}
      <div className="flex items-end justify-between h-36 px-2 pt-4">
        {days.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end relative group">
            {/* Tooltip Badge above Monday */}
            {item.badge && (
              <div
                style={{ transitionDelay: inView ? "360ms" : "0ms" }}
                className={`absolute -top-3 z-10 px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#165B39] font-mono text-[9px] font-bold shadow-2xs whitespace-nowrap transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {item.badge}
              </div>
            )}

            {/* Vertical Capsule Bar */}
            <div
              style={{
                height: item.height,
                backgroundColor: item.color || undefined,
                transform: inView ? "scaleY(1)" : "scaleY(0.06)",
                opacity: inView ? 1 : 0.15,
                transitionDelay: inView ? `${idx * 65}ms` : "0ms",
              }}
              className={`w-7 rounded-full origin-bottom transition-[transform,opacity,height] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
