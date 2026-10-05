"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function EcosystemHeader() {
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
            Ekosistem Bertingkat 4-Level
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-10">
          Arsitektur aliran gravitasi tertutup dengan optimasi Oksigen Terlarut (DO) & penguraian limbah organik
        </p>
      </div>

      <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-semibold text-emerald-800">
        Efisiensi Air 98% • Zero Waste
      </div>
    </div>
  );
}
