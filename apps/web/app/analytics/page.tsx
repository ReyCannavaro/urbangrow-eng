"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Cpu, Wifi } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsBentoRow } from "@/components/analytics/AnalyticsBentoRow";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { ScientificInsightsGrid } from "@/components/analytics/ScientificInsightsGrid";
import { RevealOnView } from "@/components/motion/RevealOnView";

export default function AnalyticsPage() {
  const { history, sensors, backendConnected } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* 1. Header with Sample Counter & Export */}
      <AnalyticsHeader />

      {/* 2. 4-Metric Bento Row */}
      <AnalyticsBentoRow />

      {/* 3. Interactive Multi-Metric Spline Time-Series Chart */}
      <RevealOnView delayMs={0}>
        <TimeSeriesChart history={history} sensors={sensors} />
      </RevealOnView>

      {/* 4. Scientific Bioprocess Insights & Correlation Grid */}
      <RevealOnView delayMs={60}>
        <ScientificInsightsGrid />
      </RevealOnView>

      {/* 5. Edge Ingestion & Database Audit Banner */}
      <RevealOnView delayMs={90}>
        <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4EAB7C]" />
              <span className="text-xs font-mono font-bold text-[#68C194] uppercase tracking-wider">
                Telemetry Ingestion Pipeline • SQLite VPS
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Pipa Data Terintegrasi Waktu-Nyata
            </h3>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              Data telemetri disinkronkan dari sensor ESP32 ke backend ElysiaJS melalui WebSocket dan disimpan berkala ke database SQLite VPS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 font-mono text-xs space-y-0.5">
              <div className="text-[10px] text-white/50">Buffer Telemetri</div>
              <div className="font-bold text-[#68C194] flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                <span>{history.length} Sampel</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 font-mono text-xs space-y-0.5">
              <div className="text-[10px] text-white/50">Koneksi Backend</div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span>{backendConnected ? "Tersinkron" : "Menghubungkan"}</span>
              </div>
            </div>

            <Link
              href="/ecosystem"
              className="px-4 py-2 rounded-full bg-white text-[#165B39] hover:bg-[#F9FAFB] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs group"
            >
              <span>Lihat Aliran Kaskade</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </RevealOnView>
    </div>
  );
}
