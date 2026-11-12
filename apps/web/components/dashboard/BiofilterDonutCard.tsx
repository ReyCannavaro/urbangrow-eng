"use client";

import React, { useEffect, useId, useState } from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { useInViewOnce } from "@/components/motion/RevealOnView";

function polarPoint(cx: number, cy: number, radius: number, progressDeg: number) {
  const clamped = Math.max(-20, Math.min(200, progressDeg));
  const rad = (clamped * Math.PI) / 180;
  return {
    x: Number((cx - radius * Math.cos(rad)).toFixed(3)),
    y: Number((cy - radius * Math.sin(rad)).toFixed(3)),
  };
}

function describeClockwiseArc(
  cx: number,
  cy: number,
  radius: number,
  fromDeg: number,
  toDeg: number
) {
  if (toDeg <= fromDeg + 0.05) return "";
  const start = polarPoint(cx, cy, radius, fromDeg);
  const end = polarPoint(cx, cy, radius, toDeg);
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function BiofilterDonutCard() {
  const uid = useId().replace(/:/g, "");
  const clipId = `nitrification-clip-${uid}`;
  const hatchId = `residu-hatch-${uid}`;
  const { sensors, actuators } = useTelemetry();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    const durationMs = 880;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (prefersReduced) {
        setSweep(1);
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth quintic deceleration
      const eased = 1 - Math.pow(1 - t, 3);
      setSweep(eased);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView]);

  const hasBiofilterSensors =
    typeof sensors.ph === "number" ||
    typeof sensors.waterTemperature === "number";

  // Compute nitrification breakdown strictly within [60%, 98.5%] when live ESP32 sensors exist
  const phDeviation =
    typeof sensors.ph === "number" ? Math.abs(sensors.ph - 7.0) : 0;
  const tempDeviation =
    typeof sensors.waterTemperature === "number"
      ? Math.abs(sensors.waterTemperature - 25.0)
      : 0;
  const pumpBonus = actuators.waterPump?.isOn ? 0 : 8.5;

  const totalEfficiency = hasBiofilterSensors
    ? Number(
        Math.max(
          62,
          Math.min(
            98.5,
            97.2 - phDeviation * 5.2 - Math.max(0, tempDeviation - 2) * 1.6 - pumpBonus
          )
        ).toFixed(1)
      )
    : 0;

  // Split decomposed ammonia into Nitrat absorbed by crops vs active Nitrifikasi conversion
  const nitrateRatio =
    typeof sensors.tds === "number" && sensors.tds >= 400 && sensors.tds <= 800
      ? 0.768
      : 0.72;
  const nitratePct = hasBiofilterSensors
    ? Number((totalEfficiency * nitrateRatio).toFixed(1))
    : 0;
  const nitrificationPct = hasBiofilterSensors
    ? Number((totalEfficiency - nitratePct).toFixed(1))
    : 0;
  const residuePct = hasBiofilterSensors
    ? Number((100 - totalEfficiency).toFixed(1))
    : 0;

  // Exact concentric semicircular gauge geometry (cx=100, cy=94, r=74, strokeWidth=18)
  const cx = 100;
  const cy = 94;
  const rMid = 74;
  const rInner = 65;
  const rOuter = 83;
  const rCap = 9;

  // Exact closed rounded-end semicircle path (matches both background track and clipPath)
  const pillTrackPath = [
    `M ${cx - rOuter} ${cy}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${cx + rOuter} ${cy}`,
    `A ${rCap} ${rCap} 0 0 1 ${cx + rInner} ${cy}`,
    `A ${rInner} ${rInner} 0 0 0 ${cx - rInner} ${cy}`,
    `A ${rCap} ${rCap} 0 0 1 ${cx - rOuter} ${cy}`,
    "Z",
  ].join(" ");

  const nitrateEndDeg = (nitratePct / 100) * 180;
  const nitrificationEndDeg = ((nitratePct + nitrificationPct) / 100) * 180;

  // Progressive clockwise sweep cursor (-14° over left cap -> 194° past right cap)
  const sweepCursor = -14 + sweep * 208;
  const animNitratePath = describeClockwiseArc(
    cx,
    cy,
    rMid,
    -14,
    Math.min(nitrateEndDeg + 0.35, sweepCursor)
  );
  const animNitrificationPath =
    sweepCursor > nitrateEndDeg
      ? describeClockwiseArc(
          cx,
          cy,
          rMid,
          nitrateEndDeg,
          Math.min(nitrificationEndDeg + 0.35, sweepCursor)
        )
      : "";
  const animResiduePath =
    sweepCursor > nitrificationEndDeg
      ? describeClockwiseArc(
          cx,
          cy,
          rMid,
          nitrificationEndDeg,
          Math.min(194, sweepCursor)
        )
      : "";

  const animatedEfficiency = (totalEfficiency * sweep).toFixed(1);

  return (
    <div
      ref={ref}
      className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[300px]"
    >
      <div>
        <span className="text-xs font-semibold text-[#111827]">
          Efisiensi Siklus Nitrifikasi
        </span>
        <p className="text-[10px] text-[#9CA3AF]">
          Perombakan limbah amonia menjadi nutrisi tanaman
        </p>
      </div>

      {/* Concentric Semicircular Gauge with Clockwise Motion & Exact Polar Angles */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <svg viewBox="0 0 200 110" className="w-56 overflow-visible" role="img" aria-label={`Efisiensi siklus nitrifikasi ${totalEfficiency}%`}>
          <defs>
            <clipPath id={clipId}>
              <path d={pillTrackPath} />
            </clipPath>
            <pattern
              id={hatchId}
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#EEF2F6" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#CBD5E1" strokeWidth="2.2" />
            </pattern>
          </defs>

          {/* Clipped concentric track segments */}
          <g clipPath={`url(#${clipId})`}>
            {/* Subtle base track */}
            <path d={pillTrackPath} fill="#F1F5F9" />

            {/* Segment 3: Residu (hatched, right remainder) */}
            {animResiduePath && (
              <path
                d={animResiduePath}
                fill="none"
                stroke={`url(#${hatchId})`}
                strokeWidth="22"
                strokeLinecap="butt"
              />
            )}

            {/* Segment 2: Active Nitrifikasi */}
            {animNitrificationPath && (
              <path
                d={animNitrificationPath}
                fill="none"
                stroke="#4EAB7C"
                strokeWidth="22"
                strokeLinecap="butt"
              />
            )}

            {/* Segment 1: Deep Pine Nitrat Absorbed */}
            {animNitratePath && (
              <path
                d={animNitratePath}
                fill="none"
                stroke="#165B39"
                strokeWidth="22"
                strokeLinecap="butt"
              />
            )}
          </g>
        </svg>

        {/* Center Readout aligned cleanly inside inner radius */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none">
          <span className="text-3xl font-bold tracking-tight text-[#111827] num-tabular leading-none">
            {hasBiofilterSensors ? animatedEfficiency : "--"}
            <span className="text-lg font-normal text-[#9CA3AF]">%</span>
          </span>
          <span className="text-[10px] font-medium text-[#9CA3AF] mt-1">
            {hasBiofilterSensors ? "Amonia Terurai" : "Menunggu Sensor"}
          </span>
        </div>
      </div>

      {/* Exact Data-Synced Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#E5E7EB] text-[10px] text-[#4B5563]">
        <div className="flex items-center gap-1.5" title={hasBiofilterSensors ? `${nitratePct}% terserap tanaman` : "Sensor offline"}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#165B39] shrink-0" />
          <span>Nitrat <strong className="font-mono text-[#111827]">{hasBiofilterSensors ? `${nitratePct}%` : "--"}</strong></span>
        </div>
        <div className="flex items-center gap-1.5" title={hasBiofilterSensors ? `${nitrificationPct}% proses biofilter` : "Sensor offline"}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#4EAB7C] shrink-0" />
          <span>Nitrifikasi <strong className="font-mono text-[#111827]">{hasBiofilterSensors ? `${nitrificationPct}%` : "--"}</strong></span>
        </div>
        <div className="flex items-center gap-1.5" title={hasBiofilterSensors ? `${residuePct}% residu` : "Sensor offline"}>
          <span className="h-2.5 w-2.5 rounded-full bg-hatched-diagonal border border-[#9CA3AF] shrink-0" />
          <span>Residu <strong className="font-mono text-[#111827]">{hasBiofilterSensors ? `${residuePct}%` : "--"}</strong></span>
        </div>
      </div>
    </div>
  );
}
