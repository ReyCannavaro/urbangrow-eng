"use client";

import React from "react";
import { Download } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { downloadTelemetryCsv } from "@/lib/operationsApi";

export function AnalyticsHeader() {
  const { history } = useTelemetry();

  const handleExportCSV = async () => {
    await downloadTelemetryCsv(history);
  };

  return (
    <section
      style={{ "--ug-delay": "0ms" } as React.CSSProperties}
      className="ug-enter flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Analitik &amp; Deret Waktu IoT
        </h1>
        <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
          Evaluasi tren sensor, kestabilan kualitas air, dan efisiensi biofilter secara berkelanjutan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <span className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs text-[#4B5563] num-tabular">
          Buffer: <strong className="text-[#111827]">{history.length} Data</strong>
        </span>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full bg-[#165B39] hover:bg-[#124B2E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          title="Unduh Data Telemetri CSV"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </section>
  );
}
