"use client";

import React from "react";
import { Sliders } from "lucide-react";

interface AnomalySimulationSuiteProps {
  anomalyMode: string;
  onSetAnomaly: (mode: string) => void;
}

export function AnomalySimulationSuite({ anomalyMode, onSetAnomaly }: AnomalySimulationSuiteProps) {
  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">
            Simulasi Uji Stres & Anomali Lingkungan
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-[var(--accent-yellow-deep)]">
          Mode Aktif: {anomalyMode.toUpperCase()}
        </span>
      </div>

      <p className="text-xs text-[var(--text-secondary)]">
        Uji respon otomatisasi sistem peringatan dini (*early warning*) dengan menyuntikkan gangguan cuaca/air tiruan:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onSetAnomaly("none")}
          className={`py-2.5 px-4 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
            anomalyMode === "none"
              ? "bg-[var(--bg-charcoal)] text-white border-transparent shadow-sm"
              : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
          }`}
        >
          Kondisi Normal
        </button>
        <button
          onClick={() => onSetAnomaly("ph_drop")}
          className={`py-2.5 px-4 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
            anomalyMode === "ph_drop"
              ? "bg-rose-600 text-white border-transparent shadow-sm"
              : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
          }`}
        >
          Simulasi Drop pH (5.8)
        </button>
        <button
          onClick={() => onSetAnomaly("heatwave")}
          className={`py-2.5 px-4 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
            anomalyMode === "heatwave"
              ? "bg-amber-500 text-white border-transparent shadow-sm"
              : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
          }`}
        >
          Gelombang Panas (30°C)
        </button>
        <button
          onClick={() => onSetAnomaly("tds_spike")}
          className={`py-2.5 px-4 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
            anomalyMode === "tds_spike"
              ? "bg-blue-600 text-white border-transparent shadow-sm"
              : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
          }`}
        >
          Lonjakan TDS Nutrisi
        </button>
      </div>
    </div>
  );
}
