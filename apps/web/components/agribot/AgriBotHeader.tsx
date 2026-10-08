"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Cpu, Activity } from "lucide-react";

export function AgriBotHeader() {
  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
                AgriBot AI Decision Support
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                XGBoost ML • v2.5
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Konsultasi biologis real-time berbasis model machine learning prediktif, analisis telemetri sensor, dan prinsip adaptasi iklim ECAD.
            </p>
          </div>
        </div>
      </div>

      {/* Right Badges */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/20 text-[11px] font-mono font-semibold text-[#166534] shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-[#166534]" />
          <span>Inferensi AI: Online • 18ms</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#111827] shadow-2xs">
          <Cpu className="h-3.5 w-3.5 text-[#0284C7]" />
          <span>Model: <strong>XGBoost Regressor</strong></span>
        </div>
      </div>
    </div>
  );
}
