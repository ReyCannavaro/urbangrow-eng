"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Palette,
  TrendingUp,
  PieChart as PieIcon,
  Radar as RadarIcon,
  ScatterChart as ScatterIcon,
  Grid3X3,
  Layers,
  Gauge,
} from "lucide-react";
import {
  AgriBotChartSpec,
  AgriBotChartTheme,
  AgriBotChartType,
} from "@/lib/types";

interface DynamicChartRendererProps {
  spec: AgriBotChartSpec;
}

interface ThemeTokens {
  label: string;
  container: string;
  titleText: string;
  subtitleText: string;
  gridColor: string;
  axisText: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  pillBg: string;
  pillText: string;
  defaultPalette: string[];
  glow?: boolean;
}

const THEME_MAP: Record<AgriBotChartTheme, ThemeTokens> = {
  light: {
    label: "Clean Light",
    container: "bg-white border border-[#E5E7EB] shadow-xs rounded-[22px]",
    titleText: "text-[#111827]",
    subtitleText: "text-[#6B7280]",
    gridColor: "#E5E7EB",
    axisText: "#6B7280",
    tooltipBg: "bg-white/95",
    tooltipBorder: "border-[#E5E7EB]",
    tooltipText: "text-[#111827]",
    pillBg: "bg-[#F3F4F6]",
    pillText: "text-[#374151]",
    defaultPalette: ["#165B39", "#0284C7", "#D97706", "#7C3AED", "#E11D48", "#059669"],
  },
  emerald: {
    label: "Botanical",
    container:
      "bg-gradient-to-br from-[#F8FCF9] via-white to-[#ECFDF5]/60 border border-[#D1FAE5] shadow-xs rounded-[22px]",
    titleText: "text-[#0B2C1B]",
    subtitleText: "text-[#4B6B58]",
    gridColor: "#D1FAE5",
    axisText: "#4B6B58",
    tooltipBg: "bg-white/95",
    tooltipBorder: "border-[#A7F3D0]",
    tooltipText: "text-[#0B2C1B]",
    pillBg: "bg-[#DCFCE7]",
    pillText: "text-[#166534]",
    defaultPalette: ["#165B39", "#4EAB7C", "#0284C7", "#D97706", "#0D9488", "#84CC16"],
  },
  dark: {
    label: "Dark Glass",
    container:
      "bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0B2C1B] border border-white/10 shadow-md rounded-[22px]",
    titleText: "text-white",
    subtitleText: "text-slate-300",
    gridColor: "rgba(148,163,184,0.18)",
    axisText: "#94A3B8",
    tooltipBg: "bg-slate-900/95",
    tooltipBorder: "border-slate-700",
    tooltipText: "text-slate-100",
    pillBg: "bg-white/10",
    pillText: "text-slate-200",
    defaultPalette: ["#34D399", "#38BDF8", "#FBBF24", "#A78BFA", "#FB7185", "#2DD4BF"],
  },
  neon: {
    label: "Cyber Neon",
    container:
      "bg-gradient-to-br from-[#060B18] via-[#0B1120] to-[#111827] border border-cyan-500/30 shadow-[0_0_24px_rgba(34,211,238,0.12)] rounded-[22px]",
    titleText: "text-cyan-50",
    subtitleText: "text-cyan-200/70",
    gridColor: "rgba(34,211,238,0.16)",
    axisText: "#67E8F9",
    tooltipBg: "bg-[#090F1E]/95",
    tooltipBorder: "border-cyan-400/40",
    tooltipText: "text-cyan-50",
    pillBg: "bg-cyan-500/15",
    pillText: "text-cyan-200",
    defaultPalette: ["#22D3EE", "#34D399", "#F472B6", "#FACC15", "#A78BFA", "#FB923C"],
    glow: true,
  },
  ocean: {
    label: "Aqua Ocean",
    container:
      "bg-gradient-to-br from-[#F0F9FF] via-white to-[#E0F2FE]/70 border border-[#BAE6FD] shadow-xs rounded-[22px]",
    titleText: "text-[#0C4A6E]",
    subtitleText: "text-[#0369A1]/80",
    gridColor: "#BAE6FD",
    axisText: "#0369A1",
    tooltipBg: "bg-white/95",
    tooltipBorder: "border-[#7DD3FC]",
    tooltipText: "text-[#0C4A6E]",
    pillBg: "bg-[#E0F2FE]",
    pillText: "text-[#0369A1]",
    defaultPalette: ["#0284C7", "#06B6D4", "#0D9488", "#2563EB", "#6366F1", "#165B39"],
  },
  sunset: {
    label: "Warm Sunset",
    container:
      "bg-gradient-to-br from-[#FFFBEB] via-white to-[#FFEDD5]/70 border border-[#FED7AA] shadow-xs rounded-[22px]",
    titleText: "text-[#7C2D12]",
    subtitleText: "text-[#9A3412]/80",
    gridColor: "#FED7AA",
    axisText: "#9A3412",
    tooltipBg: "bg-white/95",
    tooltipBorder: "border-[#FDBA74]",
    tooltipText: "text-[#7C2D12]",
    pillBg: "bg-[#FFEDD5]",
    pillText: "text-[#C2410C]",
    defaultPalette: ["#EA580C", "#D97706", "#E11D48", "#8B5CF6", "#0D9488", "#CA8A04"],
  },
  minimal: {
    label: "Minimalist",
    container: "bg-[#FAFAFA] border border-[#E5E5E5] rounded-[18px]",
    titleText: "text-[#171717]",
    subtitleText: "text-[#737373]",
    gridColor: "#E5E5E5",
    axisText: "#737373",
    tooltipBg: "bg-white",
    tooltipBorder: "border-[#D4D4D4]",
    tooltipText: "text-[#171717]",
    pillBg: "bg-[#EFEFEF]",
    pillText: "text-[#404040]",
    defaultPalette: ["#171717", "#525252", "#165B39", "#737373", "#A3A3A3", "#0284C7"],
  },
  brutalist: {
    label: "Brutalist",
    container:
      "bg-[#FEFCE8] border-2 border-[#111827] shadow-[4px_4px_0px_#111827] rounded-none font-mono",
    titleText: "text-[#111827] uppercase tracking-tight",
    subtitleText: "text-[#374151]",
    gridColor: "#CBD5E1",
    axisText: "#111827",
    tooltipBg: "bg-white",
    tooltipBorder: "border-2 border-[#111827]",
    tooltipText: "text-[#111827]",
    pillBg: "bg-[#111827]",
    pillText: "text-white",
    defaultPalette: ["#111827", "#165B39", "#EA580C", "#0284C7", "#E11D48", "#CA8A04"],
  },
};

const QUICK_CHART_SWITCHES: Array<{
  type: AgriBotChartType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: "line", label: "Garis", icon: TrendingUp },
  { type: "area", label: "Area", icon: Layers },
  { type: "bar", label: "Batang", icon: BarChart3 },
  { type: "horizontal_bar", label: "Bar-H", icon: BarChart3 },
  { type: "donut", label: "Donat", icon: PieIcon },
  { type: "radar", label: "Radar", icon: RadarIcon },
  { type: "radial", label: "Gauge", icon: Gauge },
  { type: "heatmap", label: "Matrix", icon: Grid3X3 },
];

const QUICK_THEME_CYCLE: AgriBotChartTheme[] = [
  "emerald",
  "dark",
  "neon",
  "ocean",
  "sunset",
  "minimal",
  "brutalist",
  "light",
];

function formatNumber(n: number, unit?: string): string {
  if (!Number.isFinite(n)) return "-";
  const abs = Math.abs(n);
  const numStr =
    abs >= 100 || Number.isInteger(n)
      ? Math.round(n).toLocaleString("id-ID")
      : n.toFixed(2).replace(/\.?0+$/, "");
  return unit ? `${numStr} ${unit}` : numStr;
}

function buildSplinePath(pts: Array<{ x: number; y: number }>, curve: "smooth" | "linear" | "step"): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  if (curve === "linear") {
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    return d;
  }
  if (curve === "step") {
    for (let i = 1; i < pts.length; i++) {
      d += ` H ${pts[i].x.toFixed(1)} V ${pts[i].y.toFixed(1)}`;
    }
    return d;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    d += ` C ${cpX.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

export function DynamicChartRenderer({ spec }: DynamicChartRendererProps) {
  const [activeType, setActiveType] = useState<AgriBotChartType>(spec.chartType);
  const [activeTheme, setActiveTheme] = useState<AgriBotChartTheme>(
    spec.style?.theme || "emerald"
  );
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const theme = THEME_MAP[activeTheme] || THEME_MAP.emerald;
  const palette = useMemo(
    () => (spec.style?.palette?.length ? spec.style.palette : theme.defaultPalette),
    [spec.style?.palette, theme.defaultPalette]
  );
  const curve = spec.style?.curve || "smooth";
  const showGrid = spec.style?.showGrid ?? true;
  const showLegend = spec.style?.showLegend ?? true;

  const seriesWithColors = useMemo(
    () =>
      spec.series.map((s, idx) => ({
        ...s,
        values:
          s.values && s.values.length > 0
            ? s.values
            : s.points?.map((p) => p.y) ?? [],
        color: s.color || palette[idx % palette.length],
        unit: s.unit ?? spec.style?.unit,
      })),
    [spec.series, spec.style?.unit, palette]
  );

  // Detect mixed magnitude across multiple series so pH (~7) stays visible beside TDS (~540)
  const usePerSeriesNormalization = useMemo(() => {
    if (seriesWithColors.length <= 1) return false;
    const maxes = seriesWithColors.map((s) => Math.max(0.0001, ...s.values.map(Math.abs)));
    const highest = Math.max(...maxes);
    const lowest = Math.min(...maxes);
    const units = new Set(seriesWithColors.map((s) => s.unit || ""));
    return highest / Math.max(0.0001, lowest) > 5 || units.size > 1;
  }, [seriesWithColors]);

  const pointCount = useMemo(() => {
    if (activeType === "scatter") {
      return seriesWithColors[0]?.points?.length || spec.labels.length || 0;
    }
    return Math.max(
      spec.labels.length,
      ...seriesWithColors.map((s) => s.values.length),
      0
    );
  }, [activeType, seriesWithColors, spec.labels.length]);

  const labels = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < pointCount; i++) {
      out.push(spec.labels[i] ?? `#${i + 1}`);
    }
    return out;
  }, [pointCount, spec.labels]);

  const handleCycleTheme = () => {
    const idx = QUICK_THEME_CYCLE.indexOf(activeTheme);
    setActiveTheme(QUICK_THEME_CYCLE[(idx + 1) % QUICK_THEME_CYCLE.length]);
  };

  const handleExportCsv = () => {
    const headers = ["Label", ...seriesWithColors.map((s) => (s.unit ? `${s.name} (${s.unit})` : s.name))];
    const rows = labels.map((lbl, rIdx) => [
      JSON.stringify(lbl),
      ...seriesWithColors.map((s) => s.values[rIdx] ?? ""),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(spec.id || "urbangrow-chart").replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cycleTypes = useMemo(() => {
    if (spec.chartType === "scatter") {
      return [
        { type: "scatter" as AgriBotChartType, label: "Scatter", icon: ScatterIcon },
        ...QUICK_CHART_SWITCHES.slice(0, 4),
      ];
    }
    return QUICK_CHART_SWITCHES;
  }, [spec.chartType]);

  // --- SVG CARTESIAN RENDERER (line | area | bar | composed) ---
  const renderCartesian = () => {
    const W = 680;
    const H = 250;
    const padL = 48;
    const padR = 18;
    const padT = 22;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const allVals = seriesWithColors.flatMap((s) => s.values);
    const globalMinRaw = allVals.length ? Math.min(...allVals) : 0;
    const globalMaxRaw = allVals.length ? Math.max(...allVals) : 100;
    const globalMin =
      activeType === "bar" || activeType === "composed"
        ? Math.min(0, globalMinRaw)
        : globalMinRaw;
    const globalSpan = Math.max(0.01, globalMaxRaw - globalMin);

    const getNormalizedY = (val: number, sIdx: number) => {
      if (!usePerSeriesNormalization) {
        const padLow = activeType === "bar" || activeType === "composed" ? globalMin : globalMin - globalSpan * 0.08;
        const padHigh = globalMaxRaw + globalSpan * 0.08;
        const ratio = (val - padLow) / Math.max(0.001, padHigh - padLow);
        return padT + (1 - Math.max(0, Math.min(1, ratio))) * plotH;
      }
      const sVals = seriesWithColors[sIdx].values;
      if (sVals.length === 0) return padT + plotH / 2;
      const sMin = activeType === "bar" ? 0 : Math.min(...sVals);
      const sMax = Math.max(...sVals);
      const sSpan = Math.max(0.001, sMax - sMin);
      const ratio = sMax === sMin ? 0.5 : (val - sMin) / sSpan;
      return padT + (0.08 + (1 - Math.max(0, Math.min(1, ratio))) * 0.84) * plotH;
    };

    const getX = (idx: number) =>
      pointCount <= 1 ? padL + plotW / 2 : padL + (idx / (pointCount - 1)) * plotW;

    const labelStep = Math.max(1, Math.ceil(pointCount / 6));
    const slotW = plotW / Math.max(1, pointCount);

    const barSeries = seriesWithColors.filter((s, sIdx) => {
      if (activeType === "bar") return true;
      if (activeType === "composed") return s.type === "bar" || (s.type === undefined && sIdx === 0);
      return false;
    });

    return (
      <div className="relative select-none">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[220px] sm:h-[250px] overflow-visible"
          onMouseMove={(e) => {
            if (pointCount < 1) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * W;
            const ratio = Math.max(0, Math.min(1, (relX - padL) / plotW));
            const idx =
              activeType === "bar" || activeType === "composed"
                ? Math.min(pointCount - 1, Math.max(0, Math.floor(ratio * pointCount)))
                : Math.round(ratio * Math.max(0, pointCount - 1));
            setHoverIdx(idx);
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {seriesWithColors.map((s, idx) => (
              <linearGradient key={idx} id={`ag-grad-${spec.id}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={theme.glow ? 0.48 : 0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
              </linearGradient>
            ))}
            {theme.glow && (
              <filter id={`ag-glow-${spec.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Horizontal Grid + Y Axis Labels */}
          {showGrid &&
            [0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padT + t * plotH;
              const tickVal = usePerSeriesNormalization
                ? `${Math.round((1 - t) * 100)}%`
                : formatNumber(
                    (activeType === "bar" || activeType === "composed"
                      ? globalMin
                      : globalMin - globalSpan * 0.08) +
                      (1 - t) *
                        (globalMaxRaw +
                          globalSpan * 0.08 -
                          (activeType === "bar" || activeType === "composed"
                            ? globalMin
                            : globalMin - globalSpan * 0.08))
                  );
              return (
                <g key={t}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke={theme.gridColor}
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={theme.axisText}
                    fontSize="9.5"
                    className="font-mono"
                  >
                    {tickVal}
                  </text>
                </g>
              );
            })}

          {/* Bar Series Layer */}
          {barSeries.map((s) => {
            const bIdx = barSeries.indexOf(s);
            const sOrigIdx = seriesWithColors.indexOf(s);
            const groupPad = Math.min(10, slotW * 0.22);
            const barWidth = Math.max(
              5,
              Math.min(34, (slotW - groupPad) / Math.max(1, barSeries.length) - 2)
            );
            return s.values.map((val, idx) => {
              const baseX = padL + idx * slotW + slotW / 2;
              const groupOffset =
                (bIdx - (barSeries.length - 1) / 2) * (barWidth + 2);
              const x = baseX + groupOffset - barWidth / 2;
              const y = getNormalizedY(val, sOrigIdx);
              const barH = Math.max(3, padT + plotH - y);
              const isHov = hoverIdx === idx;
              return (
                <rect
                  key={`bar-${sOrigIdx}-${idx}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={activeTheme === "brutalist" ? 0 : 4}
                  fill={s.color}
                  opacity={hoverIdx === null || isHov ? 0.92 : 0.45}
                  filter={theme.glow ? `url(#ag-glow-${spec.id})` : undefined}
                />
              );
            });
          })}

          {/* Line / Area Series Layer */}
          {seriesWithColors.map((s, sIdx) => {
            const isBarSeries =
              activeType === "bar" ||
              (activeType === "composed" && (s.type === "bar" || (s.type === undefined && sIdx === 0)));
            if (isBarSeries) return null;

            const pts = s.values.map((v, i) => ({
              x:
                activeType === "composed"
                  ? padL + i * slotW + slotW / 2
                  : getX(i),
              y: getNormalizedY(v, sIdx),
              v,
            }));

            const linePath = buildSplinePath(pts, curve);
            const showFill = activeType === "area" || s.type === "area";
            const areaPath =
              pts.length > 0
                ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${padT + plotH} L ${pts[0].x.toFixed(1)} ${padT + plotH} Z`
                : "";

            return (
              <g key={`line-${sIdx}`}>
                {showFill && areaPath && (
                  <path d={areaPath} fill={`url(#ag-grad-${spec.id}-${sIdx})`} />
                )}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={theme.glow ? `url(#ag-glow-${spec.id})` : undefined}
                  />
                )}
                {pts.map((pt, i) => {
                  const isHov = hoverIdx === i;
                  if (pts.length > 14 && !isHov && i !== pts.length - 1) return null;
                  return (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHov ? 5 : 3}
                      fill={activeTheme === "dark" || activeTheme === "neon" ? "#0F172A" : "#FFFFFF"}
                      stroke={s.color}
                      strokeWidth={2.2}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {labels.map((lbl, idx) => {
            if (idx % labelStep !== 0 && idx !== pointCount - 1) return null;
            const maxChars = pointCount <= 6 ? 18 : 11;
            const x =
              activeType === "bar" || activeType === "composed"
                ? padL + idx * slotW + slotW / 2
                : getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={H - 8}
                textAnchor="middle"
                fill={theme.axisText}
                fontSize="9.5"
                className="font-mono"
              >
                {lbl.length > maxChars ? `${lbl.slice(0, maxChars - 1)}…` : lbl}
              </text>
            );
          })}

          {/* Crosshair Guide */}
          {hoverIdx !== null && hoverIdx < pointCount && (
            <line
              x1={
                activeType === "bar" || activeType === "composed"
                  ? padL + hoverIdx * slotW + slotW / 2
                  : getX(hoverIdx)
              }
              y1={padT}
              x2={
                activeType === "bar" || activeType === "composed"
                  ? padL + hoverIdx * slotW + slotW / 2
                  : getX(hoverIdx)
              }
              y2={padT + plotH}
              stroke={theme.axisText}
              strokeDasharray="3 3"
              strokeWidth={1.2}
              opacity={0.7}
            />
          )}
        </svg>

        {/* Interactive Hover Readout */}
        {hoverIdx !== null && hoverIdx < pointCount && (
          <div
            className={`mt-2 px-3 py-2 rounded-xl border text-[11px] font-mono flex flex-wrap items-center gap-x-4 gap-y-1 ${theme.tooltipBg} ${theme.tooltipBorder} ${theme.tooltipText}`}
          >
            <span className="font-bold opacity-80">{labels[hoverIdx]}</span>
            {seriesWithColors.map((s, sIdx) => (
              <span key={sIdx} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="opacity-75">{s.name}:</span>
                <strong>{formatNumber(s.values[hoverIdx] ?? 0, s.unit)}</strong>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- HORIZONTAL BAR RENDERER ---
  const renderHorizontalBars = () => {
    const primary = seriesWithColors[0];
    const items = labels.map((lbl, idx) => ({
      label: lbl,
      val: primary?.values[idx] ?? 0,
      color: palette[idx % palette.length],
    }));
    const maxVal = Math.max(0.001, ...items.map((it) => Math.abs(it.val)));

    return (
      <div className="space-y-2.5 py-1">
        {items.map((item, idx) => {
          const pct = Math.max(4, Math.min(100, (Math.abs(item.val) / maxVal) * 100));
          return (
            <div key={idx} className="space-y-1">
              <div className={`flex items-center justify-between text-xs ${theme.titleText}`}>
                <span className="font-medium truncate pr-3">{item.label}</span>
                <span className="font-mono font-bold shrink-0">
                  {formatNumber(item.val, primary?.unit)}
                </span>
              </div>
              <div
                className={`h-2.5 w-full overflow-hidden ${
                  activeTheme === "brutalist" ? "rounded-none border border-[#111827]" : "rounded-full"
                } ${activeTheme === "dark" || activeTheme === "neon" ? "bg-white/10" : "bg-black/5"}`}
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    activeTheme === "brutalist" ? "rounded-none" : "rounded-full"
                  }`}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                    boxShadow: theme.glow ? `0 0 10px ${item.color}` : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- PIE / DONUT RENDERER ---
  const renderPieOrDonut = (isDonut: boolean) => {
    const primary = seriesWithColors[0];
    const rawItems = labels.map((lbl, idx) => ({
      label: lbl,
      value: Math.max(0, primary?.values[idx] ?? 0),
      color: palette[idx % palette.length],
    }));
    const total = rawItems.reduce((acc, it) => acc + it.value, 0) || 1;
    const cx = 105;
    const cy = 105;
    const r = 82;
    const innerR = isDonut ? 48 : 0;

    let cumAngle = -Math.PI / 2;
    const slices = rawItems.map((it, idx) => {
      const sliceAngle = (it.value / total) * Math.PI * 2;
      const startAngle = cumAngle;
      const endAngle = cumAngle + sliceAngle;
      cumAngle = endAngle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      let d: string;
      if (sliceAngle >= Math.PI * 1.999) {
        d = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
      } else if (isDonut) {
        const ix1 = cx + innerR * Math.cos(endAngle);
        const iy1 = cy + innerR * Math.sin(endAngle);
        const ix2 = cx + innerR * Math.cos(startAngle);
        const iy2 = cy + innerR * Math.sin(startAngle);
        d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`;
      } else {
        d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      }

      return {
        ...it,
        idx,
        pct: Math.round((it.value / total) * 100),
        d,
      };
    });

    const activeSlice = hoverIdx !== null && slices[hoverIdx] ? slices[hoverIdx] : null;

    return (
      <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
        <svg viewBox="0 0 210 210" className="w-[180px] h-[180px] shrink-0">
          {slices.map((s) => (
            <path
              key={s.idx}
              d={s.d}
              fill={s.color}
              stroke={activeTheme === "dark" || activeTheme === "neon" ? "#0F172A" : "#FFFFFF"}
              strokeWidth={2}
              opacity={hoverIdx === null || hoverIdx === s.idx ? 1 : 0.45}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoverIdx(s.idx)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
          {isDonut && (
            <g textAnchor="middle">
              <text
                x={cx}
                y={cy - 2}
                fill={activeTheme === "dark" || activeTheme === "neon" ? "#F8FAFC" : "#111827"}
                fontSize="16"
                fontWeight="700"
                className="font-mono"
              >
                {activeSlice ? `${activeSlice.pct}%` : formatNumber(total, primary?.unit)}
              </text>
              <text
                x={cx}
                y={cy + 14}
                fill={theme.axisText}
                fontSize="9.5"
                className="font-mono"
              >
                {activeSlice ? activeSlice.label.slice(0, 14) : "Total"}
              </text>
            </g>
          )}
        </svg>

        <div className="flex-1 w-full grid grid-cols-1 gap-1.5">
          {slices.map((s) => (
            <div
              key={s.idx}
              onMouseEnter={() => setHoverIdx(s.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                hoverIdx === s.idx ? theme.pillBg : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className={`truncate font-medium ${theme.titleText}`}>{s.label}</span>
              </div>
              <span className={`font-mono text-[11px] font-bold shrink-0 ml-2 ${theme.subtitleText}`}>
                {formatNumber(s.value, primary?.unit)} ({s.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- RADAR / SPIDER RENDERER ---
  const renderRadar = () => {
    const axesCount = Math.max(3, labels.length);
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 92;

    const maxAll = Math.max(
      100,
      ...seriesWithColors.flatMap((s) => s.values.map((v) => Math.abs(v)))
    );

    const getPolar = (axisIdx: number, valRatio: number) => {
      const angle = (axisIdx / axesCount) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * radius * valRatio,
        y: cy + Math.sin(angle) * radius * valRatio,
      };
    };

    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-[240px] h-[240px] shrink-0 mx-auto">
          {[0.25, 0.5, 0.75, 1].map((ring) => {
            const polyPts = Array.from({ length: axesCount }, (_, i) => {
              const p = getPolar(i, ring);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }).join(" ");
            return (
              <polygon
                key={ring}
                points={polyPts}
                fill="none"
                stroke={theme.gridColor}
                strokeWidth={1}
              />
            );
          })}
          {Array.from({ length: axesCount }, (_, i) => {
            const p = getPolar(i, 1);
            const pLbl = getPolar(i, 1.2);
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={theme.gridColor} strokeWidth={1} />
                <text
                  x={pLbl.x}
                  y={pLbl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme.axisText}
                  fontSize="9.5"
                  className="font-mono font-semibold"
                >
                  {(labels[i] || `Axis ${i + 1}`).slice(0, 12)}
                </text>
              </g>
            );
          })}
          {seriesWithColors.map((s, sIdx) => {
            const sMax = Math.max(0.0001, ...s.values.map((v) => Math.abs(v)));
            const denom = usePerSeriesNormalization ? sMax : maxAll;
            const pts = Array.from({ length: axesCount }, (_, i) => {
              const raw = Math.abs(s.values[i] ?? 0);
              const ratio = Math.max(0.1, Math.min(1, raw / denom));
              return getPolar(i, ratio);
            });
            return (
              <g key={sIdx}>
                <polygon
                  points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                  fill={s.color}
                  fillOpacity={sIdx === 0 ? 0.25 : 0.12}
                  stroke={s.color}
                  strokeWidth={2}
                />
                {pts.map((p, pIdx) => (
                  <circle key={pIdx} cx={p.x} cy={p.y} r={3} fill={s.color} />
                ))}
              </g>
            );
          })}
        </svg>

        <div className="flex-1 w-full space-y-1.5 text-xs">
          {labels.map((lbl, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border ${theme.tooltipBorder}`}
            >
              <span className={`font-medium ${theme.titleText}`}>{lbl}</span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                {seriesWithColors.map((s, sIdx) => (
                  <span key={sIdx} style={{ color: s.color }} className="font-bold">
                    {formatNumber(s.values[idx] ?? 0, s.unit)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- SCATTER PLOT RENDERER ---
  const renderScatter = () => {
    const W = 620;
    const H = 230;
    const padL = 48;
    const padR = 20;
    const padT = 20;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const allPoints = seriesWithColors.flatMap((s, sIdx) => {
      const pts =
        s.points && s.points.length > 0
          ? s.points
          : s.values.map((y, idx) => ({ x: idx + 1, y, label: labels[idx] }));
      return pts.map((p, idx) => ({ ...p, color: s.color, sName: s.name, unit: s.unit, idx, sIdx }));
    });

    const xs = allPoints.map((p) => p.x);
    const ys = allPoints.map((p) => p.y);
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 10;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 10;
    const spanX = Math.max(0.01, maxX - minX);
    const spanY = Math.max(0.01, maxY - minY);

    const mapX = (x: number) => padL + ((x - minX) / spanX) * plotW;
    const mapY = (y: number) => padT + (1 - (y - minY) / spanY) * plotH;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
          {showGrid &&
            [0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padT + t * plotH;
              return (
                <g key={t}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke={theme.gridColor}
                    strokeDasharray="4 4"
                  />
                  <text x={padL - 6} y={y + 3} textAnchor="end" fill={theme.axisText} fontSize="9.5" className="font-mono">
                    {formatNumber(minY + (1 - t) * spanY)}
                  </text>
                </g>
              );
            })}

          {[0, 0.5, 1].map((t) => (
            <text
              key={t}
              x={padL + t * plotW}
              y={H - 8}
              textAnchor="middle"
              fill={theme.axisText}
              fontSize="9.5"
              className="font-mono"
            >
              {formatNumber(minX + t * spanX)}
            </text>
          ))}

          {allPoints.map((pt, i) => (
            <circle
              key={i}
              cx={mapX(pt.x)}
              cy={mapY(pt.y)}
              r={hoverIdx === i ? 7 : 5}
              fill={pt.color}
              fillOpacity={0.85}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
        </svg>

        {hoverIdx !== null && allPoints[hoverIdx] && (
          <div className={`mt-1 px-3 py-1.5 rounded-xl border text-[11px] font-mono ${theme.tooltipBg} ${theme.tooltipBorder} ${theme.tooltipText}`}>
            {allPoints[hoverIdx].label ? `${allPoints[hoverIdx].label} • ` : ""}
            X: <strong>{formatNumber(allPoints[hoverIdx].x)}</strong> | Y:{" "}
            <strong>{formatNumber(allPoints[hoverIdx].y, allPoints[hoverIdx].unit)}</strong>
          </div>
        )}
      </div>
    );
  };

  // --- RADIAL GAUGE RINGS ---
  const renderRadial = () => {
    const primary = seriesWithColors[0];
    const maxRef = Math.max(100, ...(primary?.values || [100]));
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-1">
        {labels.map((lbl, idx) => {
          const val = primary?.values[idx] ?? 0;
          const pct = Math.max(0, Math.min(100, Math.round((val / maxRef) * 100)));
          const r = 30;
          const circ = 2 * Math.PI * r;
          const dashOffset = circ * (1 - pct / 100);
          const col = palette[idx % palette.length];
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center ${theme.tooltipBorder}`}
            >
              <svg viewBox="0 0 80 80" className="w-16 h-16">
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke={theme.gridColor}
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke={col}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="44"
                  textAnchor="middle"
                  fill={activeTheme === "dark" || activeTheme === "neon" ? "#F8FAFC" : "#111827"}
                  fontSize="12"
                  fontWeight="700"
                  className="font-mono"
                >
                  {formatNumber(val)}
                </text>
              </svg>
              <span className={`text-[11px] font-semibold mt-1 truncate max-w-full ${theme.titleText}`}>
                {lbl}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // --- MATRIX HEATMAP ---
  const renderHeatmap = () => {
    return (
      <div className="overflow-x-auto py-1">
        <table className="w-full text-[11px] font-mono border-separate border-spacing-1">
          <thead>
            <tr>
              <th className={`text-left px-2 py-1 ${theme.subtitleText}`}>Metrik</th>
              {labels.map((lbl, i) => (
                <th key={i} className={`px-2 py-1 font-normal ${theme.subtitleText}`}>
                  {lbl.slice(0, 8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seriesWithColors.map((s, sIdx) => {
              const sMin = Math.min(...s.values);
              const sMax = Math.max(...s.values);
              const span = Math.max(0.001, sMax - sMin);
              return (
                <tr key={sIdx}>
                  <td className={`px-2 py-1.5 font-semibold whitespace-nowrap ${theme.titleText}`}>
                    {s.name}
                  </td>
                  {labels.map((_, idx) => {
                    const val = s.values[idx] ?? 0;
                    const norm = sMax === sMin ? 0.6 : (val - sMin) / span;
                    const opacity = (0.18 + norm * 0.72).toFixed(2);
                    return (
                      <td
                        key={idx}
                        className="px-2 py-1.5 rounded-lg text-center font-bold"
                        style={{
                          backgroundColor: `${s.color}`,
                          color: norm > 0.48 ? "#FFFFFF" : "#111827",
                          opacity: Number(opacity),
                        }}
                      >
                        {formatNumber(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`p-4 sm:p-5 space-y-3 my-3 ${theme.container}`}>
      {/* Header Row with Title & Interactive Style/Type Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-bold tracking-tight ${theme.titleText}`}>
              {spec.title}
            </h4>
            {usePerSeriesNormalization &&
              (activeType === "line" ||
                activeType === "area" ||
                activeType === "bar" ||
                activeType === "composed") && (
                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold ${theme.pillBg} ${theme.pillText}`}>
                  Skala Normalisasi
                </span>
              )}
          </div>
          {spec.subtitle && (
            <p className={`text-[11px] mt-0.5 ${theme.subtitleText}`}>{spec.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleCycleTheme}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer ${theme.pillBg} ${theme.pillText} hover:opacity-85`}
            title="Ganti gaya / tema grafik"
          >
            <Palette className="h-3 w-3" />
            <span>{theme.label}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer ${theme.pillBg} ${theme.pillText} hover:opacity-85`}
            title="Unduh data grafik CSV"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Chart Type Quick-Switcher */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {cycleTypes.map((opt) => {
          const Icon = opt.icon;
          const isSelected = activeType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => {
                setHoverIdx(null);
                setActiveType(opt.type);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium transition cursor-pointer shrink-0 ${
                isSelected
                  ? `${theme.pillBg} ${theme.pillText} font-bold ring-1 ring-current/25`
                  : `${theme.subtitleText} hover:opacity-100 opacity-75`
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chart Canvas */}
      <div>
        {(activeType === "line" ||
          activeType === "area" ||
          activeType === "bar" ||
          activeType === "composed") &&
          renderCartesian()}
        {activeType === "horizontal_bar" && renderHorizontalBars()}
        {activeType === "pie" && renderPieOrDonut(false)}
        {activeType === "donut" && renderPieOrDonut(true)}
        {activeType === "radar" && renderRadar()}
        {activeType === "scatter" && renderScatter()}
        {activeType === "radial" && renderRadial()}
        {activeType === "heatmap" && renderHeatmap()}
      </div>

      {/* Series Legend */}
      {showLegend && seriesWithColors.length > 0 && activeType !== "pie" && activeType !== "donut" && (
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-current/10 text-[10.5px] font-mono">
          {seriesWithColors.map((s, idx) => (
            <span key={idx} className={`inline-flex items-center gap-1.5 ${theme.subtitleText}`}>
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span>
                {s.name}
                {s.unit ? ` (${s.unit})` : ""}
              </span>
            </span>
          ))}
        </div>
      )}

      {spec.summaryNote && (
        <p className={`text-[11px] italic ${theme.subtitleText}`}>{spec.summaryNote}</p>
      )}
    </div>
  );
}
