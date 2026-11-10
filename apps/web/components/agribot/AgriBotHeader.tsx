"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Sun, RefreshCw } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { EcosystemDiagnosticReport } from "@/lib/types";

interface AgriBotHeaderProps {
  activeAiInfo?: {
    provider: string;
    model: string;
    latencyMs?: number;
  };
  diagnostics?: EcosystemDiagnosticReport | null;
  loadingDiagnostics?: boolean;
  onRefreshDiagnostics?: () => void;
}

export function AgriBotHeader({
  activeAiInfo,
  diagnostics,
  loadingDiagnostics,
  onRefreshDiagnostics,
}: AgriBotHeaderProps) {
  const { sensors, sensorSources, backendConnected } = useTelemetry();

  const isLdrLive =
    (diagnostics?.sensorSources?.lightIntensity ?? sensorSources.lightIntensity) === "live_iot";
  const currentLux = Math.round(diagnostics?.sensors?.lightIntensity ?? sensors.lightIntensity);
  const providerLabel =
    activeAiInfo?.provider === "ecad_local_fallback"
      ? "ECAD Local Rule Engine"
      : activeAiInfo?.provider === "offline_fallback"
      ? "Offline Guard"
      : `Gemini AI • ${activeAiInfo?.model || "gemini-3.5-flash-lite"}`;

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
                AgriBot AI Decision Support
              </h1>
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                Gemini ECAD • v2.0
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Copilot diagnosis kondisi tumbuhan, air &amp; ikan serta prediksi tren air, gejala dini, dan estimasi panen berbasis data sensor live + auto-dummy.
            </p>
          </div>
        </div>
      </div>

      {/* Right Badges */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 md:pl-0">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono font-semibold shadow-2xs ${
            backendConnected
              ? "bg-[#DCFCE7] border-[#166534]/20 text-[#166534]"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {providerLabel}
            {activeAiInfo?.latencyMs ? ` • ${activeAiInfo.latencyMs}ms` : ""}
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono shadow-2xs ${
            isLdrLive
              ? "bg-[#ECFDF5] border-[#165B39]/30 text-[#165B39] font-semibold"
              : "bg-white border-[#E5E7EB] text-[#111827]"
          }`}
          title="Status sensor fisik LDR ESP32 vs Auto-Dummy sensor lain"
        >
          {isLdrLive ? (
            <span className="h-2 w-2 rounded-full bg-[#165B39] animate-pulse" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-[#D97706]" />
          )}
          <span>
            {isLdrLive ? "LDR Live ESP32" : "Auto-Dummy"}: <strong>{currentLux} lux</strong>
          </span>
        </div>

        {onRefreshDiagnostics && (
          <button
            onClick={onRefreshDiagnostics}
            disabled={loadingDiagnostics}
            className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] text-[#4B5563] hover:text-[#111827] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Segarkan Diagnosis & Prediksi"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingDiagnostics ? "animate-spin text-[#165B39]" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
