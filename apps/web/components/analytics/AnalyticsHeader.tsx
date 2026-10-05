"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export function AnalyticsHeader() {
  const handleExport = () => {
    alert("Laporan data telemetri historis diexport ke format CSV.");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--border-light)]">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="h-8 w-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Historical Analytics & Deret Waktu
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-10">
          Analisis korelasi multi-metrik deret waktu time-series untuk evaluasi stabilitas ekosistem pangan
        </p>
      </div>

      <button
        onClick={handleExport}
        className="px-4 py-2 rounded-full border border-stone-300 bg-white hover:border-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export Data CSV</span>
      </button>
    </div>
  );
}
