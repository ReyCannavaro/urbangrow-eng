"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0 shadow-2xs"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Historical Analytics &amp; Deret Waktu
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Analisis korelasi multi-metrik untuk evaluasi stabilitas air dan efisiensi biofilter.
          </p>
        </div>
      </div>

      {/* Right Sample Count & CSV Export Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0 font-mono text-[11px]">
        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563]">
          Buffer: <strong className="text-[#111827]">{history.length} Data</strong>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-full bg-[#165B39] hover:bg-[#124B2E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer font-sans"
          title="Unduh Data Telemetri CSV"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </section>
  );
}
