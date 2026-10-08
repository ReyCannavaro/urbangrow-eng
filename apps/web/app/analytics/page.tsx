"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Wifi,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsBentoRow } from "@/components/analytics/AnalyticsBentoRow";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { ScientificInsightsGrid } from "@/components/analytics/ScientificInsightsGrid";

export default function AnalyticsPage() {
  const { history, sensors, backendConnected } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* 1. Header with Status & Export */}
      <AnalyticsHeader />

      {/* 2. Donezo 4-Metric Bento Row (Pine Inverted Hero + 3 White Bento Cards) */}
      <AnalyticsBentoRow />

      {/* 3. Interactive Multi-Metric Spline Time-Series Chart */}
      <TimeSeriesChart history={history} sensors={sensors} />

      {/* 4. Scientific Bioprocess Insights & Correlation Grid */}
      <ScientificInsightsGrid />

      {/* 5. Edge Ingestion & Sliding Buffer Audit Banner */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4EAB7C] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#68C194] uppercase tracking-wider">
              Telemetry Ingestion Pipeline • Sliding FIFO Buffer
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              60 Samples Window
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Pipa Data Terintegrasi Waktu-Nyata (1500ms Cadence)
          </h3>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            Data telemetri disinkronkan langsung dari sensor mikro ESP32 melalui WebSocket/SSE backend Elysia. Seluruh titik deret waktu diakumulasi ke dalam buffer memori tanpa latensi rendering.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 font-mono text-xs space-y-0.5">
            <div className="text-[10px] text-white/50">Status Buffer</div>
            <div className="font-bold text-[#68C194] flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>{history.length} / 60 Sampel</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 font-mono text-xs space-y-0.5">
            <div className="text-[10px] text-white/50">Koneksi Backend</div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>{backendConnected ? "Tersinkron" : "Lokal Mode"}</span>
            </div>
          </div>

          <Link
            href="/ecosystem"
            className="px-4 py-2 rounded-full bg-white text-[#165B39] hover:bg-[#F3F4F6] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Lihat Aliran Kaskade</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
