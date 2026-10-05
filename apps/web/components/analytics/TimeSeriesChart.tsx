"use client";

import React, { useState } from "react";
import { PieChart } from "lucide-react";
import { SensorData, HistorySample } from "@/lib/types";

interface TimeSeriesChartProps {
  history: HistorySample[];
  sensors: SensorData;
}

export function TimeSeriesChart({ history, sensors }: TimeSeriesChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<"all" | "ph" | "temp" | "tds" | "do">("all");

  const renderAnalyticsChart = () => {
    if (!history || history.length < 2) return null;
    const width = 860;
    const height = 240;
    const paddingX = 30;
    const paddingY = 25;

    const renderLine = (metric: keyof SensorData, stroke: string, min: number, max: number) => {
      const points = history.map((pt, idx) => {
        const x = paddingX + (idx / (history.length - 1)) * (width - 2 * paddingX);
        const val = pt.sensors[metric] ?? min;
        const normalizedY = 1 - Math.max(0, Math.min(1, (val - min) / (max - min)));
        const y = paddingY + normalizedY * (height - 2 * paddingY);
        return { x, y, val };
      });

      const d = points.reduce(
        (acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
        ""
      );
      const dArea = `${d} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${points[0].x.toFixed(1)} ${height - paddingY} Z`;

      return (
        <g key={metric}>
          <path d={dArea} fill={stroke} opacity={0.12} />
          <path
            d={dLine(points)}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={stroke} />
        </g>
      );
    };

    const dLine = (pts: { x: number; y: number }[]) =>
      pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, "");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <line
          x1={paddingX}
          y1={height * 0.25}
          x2={width - paddingX}
          y2={height * 0.25}
          stroke="#f1f5f9"
          strokeDasharray="3 3"
        />
        <line
          x1={paddingX}
          y1={height * 0.5}
          x2={width - paddingX}
          y2={height * 0.5}
          stroke="#f1f5f9"
          strokeDasharray="3 3"
        />
        <line
          x1={paddingX}
          y1={height * 0.75}
          x2={width - paddingX}
          y2={height * 0.75}
          stroke="#f1f5f9"
          strokeDasharray="3 3"
        />

        {(selectedMetric === "all" || selectedMetric === "ph") && renderLine("ph", "#10b981", 5.0, 9.0)}
        {(selectedMetric === "all" || selectedMetric === "temp") &&
          renderLine("waterTemperature", "#0ea5e9", 18.0, 32.0)}
        {(selectedMetric === "all" || selectedMetric === "tds") && renderLine("tds", "#f59e0b", 300, 1100)}
        {(selectedMetric === "all" || selectedMetric === "do") &&
          renderLine("dissolvedOxygen", "#64748b", 3.0, 9.5)}
      </svg>
    );
  };

  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-[var(--accent-yellow-deep)]" />
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">
            Kurva Fluktuasi Telemetri (Real-time Sliding Window)
          </h3>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full border border-stone-200 bg-stone-50 text-xs">
          {(["all", "ph", "temp", "tds", "do"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1 rounded-full capitalize font-medium transition cursor-pointer ${
                selectedMetric === m ? "bg-[var(--bg-charcoal)] text-white font-semibold" : "text-stone-600 hover:text-black"
              }`}
            >
              {m === "all" ? "Semua Kanal" : m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full rounded-2xl bg-stone-50 border border-stone-200/60 p-2 relative overflow-hidden">
        {renderAnalyticsChart()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] pt-2 font-mono">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          pH Air ({sensors.ph})
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          Suhu Air ({sensors.waterTemperature}°C)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          TDS Nutrisi ({sensors.tds} ppm)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          Dissolved Oxygen ({sensors.dissolvedOxygen} mg/L)
        </span>
      </div>
    </div>
  );
}
