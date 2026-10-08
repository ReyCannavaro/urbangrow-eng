"use client";

import React, { useState, useRef } from "react";
import {
  Activity,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SensorData, HistorySample } from "@/lib/types";

interface TimeSeriesChartProps {
  history: HistorySample[];
  sensors: SensorData;
}

type MetricKey = "all" | "ph" | "temp" | "tds" | "do";

interface MetricConfig {
  key: keyof SensorData;
  label: string;
  unit: string;
  color: string;
  fillId: string;
  min: number;
  max: number;
  bandIndex: number;
  format: (v: number) => string;
}

const METRICS: Record<"ph" | "temp" | "tds" | "do", MetricConfig> = {
  do: {
    key: "dissolvedOxygen",
    label: "Oksigen (DO)",
    unit: "mg/L",
    color: "#4EAB7C", // Sage Mint
    fillId: "gradient-do",
    min: 4.5,
    max: 9.5,
    bandIndex: 0,
    format: (v) => `${v.toFixed(2)} mg/L`,
  },
  temp: {
    key: "waterTemperature",
    label: "Suhu Air",
    unit: "°C",
    color: "#0284C7", // Bio Cyan
    fillId: "gradient-temp",
    min: 20.0,
    max: 30.0,
    bandIndex: 1,
    format: (v) => `${v.toFixed(1)}°C`,
  },
  ph: {
    key: "ph",
    label: "pH Air",
    unit: "pH",
    color: "#165B39", // Deep Forest Pine
    fillId: "gradient-ph",
    min: 6.0,
    max: 8.5,
    bandIndex: 2,
    format: (v) => v.toFixed(2),
  },
  tds: {
    key: "tds",
    label: "TDS Nutrisi",
    unit: "ppm",
    color: "#D97706", // Amber
    fillId: "gradient-tds",
    min: 350,
    max: 750,
    bandIndex: 3,
    format: (v) => `${Math.round(v)} ppm`,
  },
};

export function TimeSeriesChart({ history, sensors }: TimeSeriesChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("all");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dataSamples = history && history.length >= 2 ? history : [];

  // Compute min/max stats for each metric in the current sliding window
  const getStats = (key: keyof SensorData) => {
    if (dataSamples.length === 0) return { min: 0, max: 0, current: 0 };
    const vals = dataSamples.map((d) => d.sensors[key] ?? 0);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      current: vals[vals.length - 1],
    };
  };

  const phStats = getStats("ph");
  const tempStats = getStats("waterTemperature");
  const tdsStats = getStats("tds");
  const doStats = getStats("dissolvedOxygen");

  // Chart dimensions inside SVG viewBox
  const width = 900;
  const height = 280;
  const paddingX = 45;
  const paddingY = 25;

  // Generate smooth cubic Bézier spline curve
  const getCurvedPath = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const pCurrent = points[i];
      const pNext = points[i + 1];
      const cpX = (pCurrent.x + pNext.x) / 2;
      d += ` C ${cpX.toFixed(1)} ${pCurrent.y.toFixed(1)}, ${cpX.toFixed(1)} ${pNext.y.toFixed(1)}, ${pNext.x.toFixed(1)} ${pNext.y.toFixed(1)}`;
    }
    return d;
  };

  // Render a specific metric curve
  const renderLine = (config: MetricConfig, isHighlighted: boolean) => {
    if (dataSamples.length < 2) return null;

    const vals = dataSamples.map((pt) => pt.sensors[config.key] ?? config.min);
    const valMin = Math.min(...vals);
    const valMax = Math.max(...vals);
    const span = Math.max(0.01, valMax - valMin);

    // Altitude Bands for Multi-Trace SCADA Mode
    // DO (band 0): 0.05 - 0.23
    // Temp (band 1): 0.28 - 0.46
    // pH (band 2): 0.51 - 0.69
    // TDS (band 3): 0.74 - 0.92
    const bandBases = [0.05, 0.28, 0.51, 0.74];
    const bandHeight = 0.19;

    const points = dataSamples.map((pt, idx) => {
      const x = paddingX + (idx / (dataSamples.length - 1)) * (width - 2 * paddingX);
      const val = pt.sensors[config.key] ?? config.min;
      const normalizedLocal = (val - valMin) / span;

      let normY = 0.5;
      if (selectedMetric === "all") {
        const base = bandBases[config.bandIndex] ?? 0.5;
        normY = base + (1 - normalizedLocal) * bandHeight;
      } else {
        // Zoom in to full height with 15% top/bottom margin
        normY = 0.1 + (1 - normalizedLocal) * 0.8;
      }

      const y = paddingY + normY * (height - 2 * paddingY);
      return { x, y, val };
    });

    const dPath = getCurvedPath(points);
    const baselineY =
      selectedMetric === "all"
        ? paddingY + ((bandBases[config.bandIndex] ?? 0) + bandHeight) * (height - 2 * paddingY)
        : height - paddingY;
    const dArea = `${dPath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;

    const lastPoint = points[points.length - 1];
    const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

    return (
      <g key={config.key}>
        {/* Soft Gradient Area Fill */}
        <path
          d={dArea}
          fill={`url(#${config.fillId})`}
          opacity={isHighlighted ? 0.35 : 0.14}
          className="transition-opacity duration-300"
        />

        {/* Spline Path */}
        <path
          d={dPath}
          fill="none"
          stroke={config.color}
          strokeWidth={isHighlighted ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Active Live Node (Rightmost endpoint) */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={isHighlighted ? 5 : 4}
          fill={config.color}
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={8}
          fill={config.color}
          opacity={0.3}
          className="animate-pulse"
        />

        {/* Hovered node point */}
        {hoveredPoint && (
          <circle
            cx={hoveredPoint.x}
            cy={hoveredPoint.y}
            r={6}
            fill="#FFFFFF"
            stroke={config.color}
            strokeWidth={2.5}
          />
        )}
      </g>
    );
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || dataSamples.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - 25) / (rect.width - 50)));
    const targetIdx = Math.round(ratio * (dataSamples.length - 1));
    setHoverIndex(targetIdx);
  };

  const activeSample =
    hoverIndex !== null && dataSamples[hoverIndex]
      ? dataSamples[hoverIndex]
      : dataSamples[dataSamples.length - 1] ?? null;

  // Selected single metric stats for scale ticks
  const activeSingleConfig = selectedMetric !== "all" ? METRICS[selectedMetric] : null;
  const activeSingleStats =
    selectedMetric !== "all" && activeSingleConfig
      ? getStats(activeSingleConfig.key)
      : null;

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header with Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base text-[#111827] tracking-tight">
              Kurva Fluktuasi Telemetri (Real-time Sliding Window)
            </h3>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 ml-9">
            Multi-trace telemetri SCADA dengan interpolasi spline kontinu 60 sampel live.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full border border-[#E5E7EB] bg-[#F8F9FA] text-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedMetric("all")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
              selectedMetric === "all"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
            }`}
          >
            Semua Kanal
          </button>
          <button
            onClick={() => setSelectedMetric("ph")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
              selectedMetric === "ph"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
            }`}
          >
            pH Air
          </button>
          <button
            onClick={() => setSelectedMetric("temp")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
              selectedMetric === "temp"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
            }`}
          >
            Suhu Air
          </button>
          <button
            onClick={() => setSelectedMetric("tds")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
              selectedMetric === "tds"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
            }`}
          >
            TDS Nutrisi
          </button>
          <button
            onClick={() => setSelectedMetric("do")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
              selectedMetric === "do"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-white"
            }`}
          >
            DO Oksigen
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Chips Bar (Donezo Metric Strip) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* pH Chip */}
        <button
          onClick={() => setSelectedMetric(selectedMetric === "ph" ? "all" : "ph")}
          className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
            selectedMetric === "ph"
              ? "border-[#165B39] bg-[#DCFCE7]/30 shadow-xs ring-1 ring-[#165B39]"
              : "border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#D1D5DB]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#165B39]" />
              pH Air
            </span>
            <span className="font-mono text-[10px] text-[#9CA3AF]">
              {dataSamples.length > 0 ? `${phStats.min.toFixed(2)}-${phStats.max.toFixed(2)}` : "6.5-7.5"}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight text-[#111827] num-tabular mt-1">
            {typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : sensors.ph}
            <span className="text-xs font-normal text-[#6B7280] ml-1">pH</span>
          </div>
        </button>

        {/* Suhu Chip */}
        <button
          onClick={() => setSelectedMetric(selectedMetric === "temp" ? "all" : "temp")}
          className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
            selectedMetric === "temp"
              ? "border-[#0284C7] bg-[#E0F2FE]/40 shadow-xs ring-1 ring-[#0284C7]"
              : "border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#D1D5DB]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
              Suhu Air
            </span>
            <span className="font-mono text-[10px] text-[#9CA3AF]">
              {dataSamples.length > 0 ? `${tempStats.min.toFixed(1)}-${tempStats.max.toFixed(1)}°C` : "24-28°C"}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight text-[#111827] num-tabular mt-1">
            {typeof sensors.waterTemperature === "number"
              ? sensors.waterTemperature.toFixed(1)
              : sensors.waterTemperature}
            <span className="text-xs font-normal text-[#6B7280] ml-1">°C</span>
          </div>
        </button>

        {/* TDS Chip */}
        <button
          onClick={() => setSelectedMetric(selectedMetric === "tds" ? "all" : "tds")}
          className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
            selectedMetric === "tds"
              ? "border-[#D97706] bg-[#FEF3C7]/40 shadow-xs ring-1 ring-[#D97706]"
              : "border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#D1D5DB]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              TDS Nutrisi
            </span>
            <span className="font-mono text-[10px] text-[#9CA3AF]">
              {dataSamples.length > 0 ? `${Math.round(tdsStats.min)}-${Math.round(tdsStats.max)}` : "400-800"}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight text-[#111827] num-tabular mt-1">
            {typeof sensors.tds === "number" ? Math.round(sensors.tds) : sensors.tds}
            <span className="text-xs font-normal text-[#6B7280] ml-1">ppm</span>
          </div>
        </button>

        {/* DO Chip */}
        <button
          onClick={() => setSelectedMetric(selectedMetric === "do" ? "all" : "do")}
          className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
            selectedMetric === "do"
              ? "border-[#4EAB7C] bg-[#DCFCE7]/40 shadow-xs ring-1 ring-[#4EAB7C]"
              : "border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:border-[#D1D5DB]"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#4EAB7C]" />
              DO Oksigen
            </span>
            <span className="font-mono text-[10px] text-[#9CA3AF]">
              {dataSamples.length > 0 ? `${doStats.min.toFixed(2)}-${doStats.max.toFixed(2)}` : "6.5-8.0"}
            </span>
          </div>
          <div className="text-xl font-bold tracking-tight text-[#111827] num-tabular mt-1">
            {typeof sensors.dissolvedOxygen === "number"
              ? sensors.dissolvedOxygen.toFixed(2)
              : sensors.dissolvedOxygen}
            <span className="text-xs font-normal text-[#6B7280] ml-1">mg/L</span>
          </div>
        </button>
      </div>

      {/* 3. The SVG Chart Canvas */}
      <div
        ref={containerRef}
        className="relative h-[290px] w-full rounded-[22px] bg-[#F8F9FA] border border-[#E5E7EB] p-2 overflow-hidden select-none"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="gradient-ph" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#165B39" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#165B39" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-temp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-tds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-do" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4EAB7C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4EAB7C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted Grid Horizontal Guides */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <line
              key={ratio}
              x1={paddingX}
              y1={paddingY + ratio * (height - 2 * paddingY)}
              x2={width - paddingX}
              y2={paddingY + ratio * (height - 2 * paddingY)}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ))}

          {/* Single-metric mode Y-axis labels */}
          {activeSingleStats && activeSingleConfig && (
            <g className="font-mono text-[9px] fill-[#9CA3AF]">
              <text x={8} y={paddingY + 0.15 * (height - 2 * paddingY)}>
                {activeSingleConfig.format(activeSingleStats.max)}
              </text>
              <text x={8} y={paddingY + 0.5 * (height - 2 * paddingY)}>
                {activeSingleConfig.format((activeSingleStats.max + activeSingleStats.min) / 2)}
              </text>
              <text x={8} y={paddingY + 0.88 * (height - 2 * paddingY)}>
                {activeSingleConfig.format(activeSingleStats.min)}
              </text>
            </g>
          )}

          {/* Time-series Splines */}
          {(selectedMetric === "all" || selectedMetric === "do") &&
            renderLine(METRICS.do, selectedMetric === "do")}
          {(selectedMetric === "all" || selectedMetric === "temp") &&
            renderLine(METRICS.temp, selectedMetric === "temp")}
          {(selectedMetric === "all" || selectedMetric === "ph") &&
            renderLine(METRICS.ph, selectedMetric === "ph")}
          {(selectedMetric === "all" || selectedMetric === "tds") &&
            renderLine(METRICS.tds, selectedMetric === "tds")}

          {/* Interactive Crosshair Line on Hover */}
          {hoverIndex !== null && dataSamples.length >= 2 && (
            <line
              x1={paddingX + (hoverIndex / (dataSamples.length - 1)) * (width - 2 * paddingX)}
              y1={paddingY}
              x2={paddingX + (hoverIndex / (dataSamples.length - 1)) * (width - 2 * paddingX)}
              y2={height - paddingY}
              stroke="#111827"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={0.6}
            />
          )}
        </svg>

        {/* Hover Crosshair Tooltip Floating Card */}
        {activeSample && hoverIndex !== null && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-[#E5E7EB] rounded-[16px] p-3 shadow-md text-xs font-mono space-y-1.5 pointer-events-none z-10 min-w-[190px]">
            <div className="flex items-center justify-between text-[#6B7280] pb-1 border-b border-[#F3F4F6]">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3" />
                {activeSample.timestamp.includes("T")
                  ? activeSample.timestamp.split("T")[1]?.slice(0, 8)
                  : activeSample.timestamp}
              </span>
              <span className="text-[10px] text-[#166534] bg-[#DCFCE7] px-1.5 py-0.2 rounded-full font-bold">
                T-{Math.max(0, (dataSamples.length - 1 - hoverIndex) * 1.5).toFixed(0)}s
              </span>
            </div>
            <div className="flex items-center justify-between text-[#111827]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#165B39]" /> pH:
              </span>
              <span className="font-bold">{activeSample.sensors.ph.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[#111827]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7]" /> Suhu:
              </span>
              <span className="font-bold">{activeSample.sensors.waterTemperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between text-[#111827]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> TDS:
              </span>
              <span className="font-bold">{Math.round(activeSample.sensors.tds)} ppm</span>
            </div>
            <div className="flex items-center justify-between text-[#111827]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4EAB7C]" /> DO:
              </span>
              <span className="font-bold">{activeSample.sensors.dissolvedOxygen.toFixed(2)} mg/L</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Timeline Axis Markers & Telemetry Health Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280] font-mono pt-1 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-6">
          <span className="text-[#9CA3AF]">-60 Detik</span>
          <span className="text-[#9CA3AF]">-45s</span>
          <span className="text-[#9CA3AF] hidden sm:inline">-30s</span>
          <span className="text-[#9CA3AF]">-15s</span>
          <span className="font-bold text-[#165B39] flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#165B39] animate-pulse" />
            Live Sekarang
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#166534]" />
          <span className="text-[11px] text-[#374151]">
            Window 60 Sampel • Frekuensi Ingesti 1500ms
          </span>
        </div>
      </div>
    </div>
  );
}
