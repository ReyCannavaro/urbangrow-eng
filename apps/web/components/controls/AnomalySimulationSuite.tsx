"use client";

import React from "react";
import { Sliders, CheckCircle2, Droplets, Sun, Activity } from "lucide-react";

interface AnomalySimulationSuiteProps {
  anomalyMode: string;
  onSetAnomaly: (mode: string) => void;
}

export function AnomalySimulationSuite({
  anomalyMode,
  onSetAnomaly,
}: AnomalySimulationSuiteProps) {
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "ph_drop":
        return "ANOMALI: DROP pH (5.8)";
      case "heatwave":
        return "ANOMALI: HEATWAVE (30.2°C)";
      case "tds_spike":
        return "ANOMALI: TDS SPIKE (1120 PPM)";
      case "none":
      default:
        return "NORMAL (OPTIMAL)";
    }
  };

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center font-bold shadow-2xs">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#111827]">
              Simulasi Uji Stres & Anomali Lingkungan
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Uji respons otomatisasi sistem peringatan dini (*early warning*) dengan menyuntikkan skenario tiruan:
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold shadow-2xs ${
            anomalyMode === "none"
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/20"
              : "bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/30 animate-pulse"
          }`}
        >
          {getModeLabel(anomalyMode)}
        </span>
      </div>

      {/* 4 Simulation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* 1. KONDISI NORMAL */}
        <button
          onClick={() => onSetAnomaly("none")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[95px] ${
            anomalyMode === "none"
              ? "bg-[#165B39] text-white border-[#165B39] shadow-sm"
              : "bg-white border-[#E5E7EB] hover:border-[#165B39]/50 text-[#111827]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Kondisi Normal</span>
            <CheckCircle2
              className={`h-4 w-4 ${
                anomalyMode === "none" ? "text-[#68C194]" : "text-[#9CA3AF]"
              }`}
            />
          </div>
          <div
            className={`text-[10px] font-mono ${
              anomalyMode === "none" ? "text-white/80" : "text-[#6B7280]"
            }`}
          >
            pH 7.0 • 24.5°C • TDS 540
          </div>
        </button>

        {/* 2. DROP PH */}
        <button
          onClick={() => onSetAnomaly("ph_drop")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[95px] ${
            anomalyMode === "ph_drop"
              ? "bg-[#E11D48] text-white border-[#E11D48] shadow-sm"
              : "bg-white border-[#E5E7EB] hover:border-[#E11D48]/50 text-[#111827]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Drop pH Air (5.8)</span>
            <Droplets
              className={`h-4 w-4 ${
                anomalyMode === "ph_drop" ? "text-white" : "text-[#E11D48]"
              }`}
            />
          </div>
          <div
            className={`text-[10px] font-mono ${
              anomalyMode === "ph_drop" ? "text-white/80" : "text-[#6B7280]"
            }`}
          >
            Pemicu Dosing Buffer Aktif
          </div>
        </button>

        {/* 3. GELOMBANG PANAS */}
        <button
          onClick={() => onSetAnomaly("heatwave")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[95px] ${
            anomalyMode === "heatwave"
              ? "bg-[#D97706] text-white border-[#D97706] shadow-sm"
              : "bg-white border-[#E5E7EB] hover:border-[#D97706]/50 text-[#111827]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Heatwave (30.2°C)</span>
            <Sun
              className={`h-4 w-4 ${
                anomalyMode === "heatwave" ? "text-white" : "text-[#D97706]"
              }`}
            />
          </div>
          <div
            className={`text-[10px] font-mono ${
              anomalyMode === "heatwave" ? "text-white/80" : "text-[#6B7280]"
            }`}
          >
            Pemicu Aerasi Booster
          </div>
        </button>

        {/* 4. LONJAKAN TDS */}
        <button
          onClick={() => onSetAnomaly("tds_spike")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[95px] ${
            anomalyMode === "tds_spike"
              ? "bg-[#0284C7] text-white border-[#0284C7] shadow-sm"
              : "bg-white border-[#E5E7EB] hover:border-[#0284C7]/50 text-[#111827]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Lonjakan TDS (1120)</span>
            <Activity
              className={`h-4 w-4 ${
                anomalyMode === "tds_spike" ? "text-white" : "text-[#0284C7]"
              }`}
            />
          </div>
          <div
            className={`text-[10px] font-mono ${
              anomalyMode === "tds_spike" ? "text-white/80" : "text-[#6B7280]"
            }`}
          >
            Pemicu Sirkulasi Filter
          </div>
        </button>
      </div>
    </div>
  );
}
