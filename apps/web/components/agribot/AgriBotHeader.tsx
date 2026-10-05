"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export function AgriBotHeader() {
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
            AgriBot AI Decision Support
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-10">
          Konsultasi biologis real-time berbasis model machine learning XGBoost & prinsip ilmiah ECAD
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        <span>Model AI: Online (v2.5)</span>
      </div>
    </div>
  );
}
