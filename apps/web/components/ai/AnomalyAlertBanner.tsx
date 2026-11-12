"use client";

import React from "react";
import { AlertOctagon, CheckCircle2, ArrowRight, ArrowUpRight, Bot, X } from "lucide-react";
import Link from "next/link";
import { AnomalyPrediction } from "../../lib/aiApi";
import { useTelemetry } from "@/lib/telemetryContext";

interface Props {
  anomaly: AnomalyPrediction | null;
}

export function AnomalyAlertBanner({ anomaly }: Props) {
  const { lastActuatorError, clearActuatorError, systemMeta } = useTelemetry();
  const isOffline =
    !systemMeta.edgeOnline &&
    systemMeta.liveSensorCount === 0 &&
    (!anomaly || anomaly.offline || anomaly.risk_level === "OFFLINE");

  return (
    <div className="space-y-2.5">
      {lastActuatorError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-xs text-[#111827] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-rose-900 block leading-tight">
                Interlock Keamanan Aktuator
              </span>
              <span className="text-[11.5px] text-[#4B5563] leading-relaxed">
                {lastActuatorError}
              </span>
            </div>
          </div>
          <button
            onClick={clearActuatorError}
            className="h-6 w-6 rounded-lg hover:bg-rose-100 flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup peringatan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isOffline || anomaly?.risk_level === "OFFLINE" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-[#4B5563]">
            <div className="h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9CA3AF]" />
            </div>
            <span className="text-[#111827]">
              <strong className="text-[#374151]">Maaf, alat sedang offline:</strong>{" "}
              {anomaly?.recommended_action ||
                "Node edge ESP32 belum mengirimkan paket 4 sensor fisik ke server VPS. Hubungkan perangkat ke Wi-Fi untuk pemantauan live."}
            </span>
          </div>
          <Link
            href="/controls"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] px-3.5 py-1.5 font-semibold text-[#111827] transition-colors group"
          >
            <span>Status Node IoT</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-45" />
          </Link>
        </div>
      ) : !anomaly || !anomaly.is_anomaly ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-[#166534]">
            <div className="h-7 w-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-[#165B39]" />
            </div>
            <span className="text-[#111827]">
              <strong className="text-[#165B39]">Ekosistem Seimbang:</strong>{" "}
              {systemMeta.liveSensorCount > 0
                ? `${systemMeta.liveSensorCount} kanal sensor aktif dari ${systemMeta.edgeNode} beroperasi dalam zona adaptasi iklim optimal.`
                : "Parameter sensor aktif berada dalam zona adaptasi iklim optimal."}
            </span>
          </div>
          <Link
            href="/agribot"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] px-3.5 py-1.5 font-semibold text-[#165B39] transition-colors group"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Konsultasi AgriBot</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-45" />
          </Link>
        </div>
      ) : (
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[20px] border px-5 py-4 text-xs shadow-xs ${
            anomaly.risk_level === "CRITICAL"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5">
              <span
                className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                  anomaly.risk_level === "CRITICAL" ? "bg-rose-400" : "bg-amber-400"
                }`}
              />
              <AlertOctagon
                className={`relative h-4 w-4 shrink-0 ${
                  anomaly.risk_level === "CRITICAL" ? "text-rose-600" : "text-amber-600"
                }`}
              />
            </div>
            <div>
              <span className="font-bold tracking-wide uppercase mr-2">
                [{anomaly.risk_level} ALERT]
              </span>
              <span>{anomaly.recommended_action}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/agribot"
              className="inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white px-3 py-1.5 font-semibold text-[#111827] hover:bg-[#F9FAFB] transition"
            >
              <Bot className="h-3.5 w-3.5 text-[#165B39]" />
              Diagnosis AI
            </Link>
            <Link
              href="/controls"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-white shadow-xs transition ${
                anomaly.risk_level === "CRITICAL"
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              Mitigasi <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
