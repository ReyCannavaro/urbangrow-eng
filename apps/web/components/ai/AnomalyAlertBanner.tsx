"use client";

import React from "react";
import { AlertOctagon, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnomalyPrediction } from "../../lib/aiApi";

interface Props {
  anomaly: AnomalyPrediction | null;
}

export function AnomalyAlertBanner({ anomaly }: Props) {
  if (!anomaly || !anomaly.is_anomaly) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3.5 text-xs backdrop-blur-md">
        <div className="flex items-center gap-3 text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Ekosistem Seimbang:</strong> Seluruh 6 parameter air (pH, TDS, DO, Suhu, RH, Lux) beroperasi pada rentang adaptasi iklim terbaik.
          </span>
        </div>
        <Link
          href="/ai-insights"
          className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition"
        >
          Lihat AI Insights <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const isCritical = anomaly.risk_level === "CRITICAL";

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-xs backdrop-blur-md ${
        isCritical
          ? "border-rose-500/50 bg-rose-950/40 text-rose-200"
          : "border-amber-500/50 bg-amber-950/40 text-amber-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5">
          <span
            className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
              isCritical ? "bg-rose-500" : "bg-amber-500"
            }`}
          />
          <AlertOctagon
            className={`relative h-4 w-4 shrink-0 ${
              isCritical ? "text-rose-400" : "text-amber-400"
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

      <Link
        href="/controls"
        className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 font-semibold text-white shadow-xs transition ${
          isCritical
            ? "bg-rose-600 hover:bg-rose-500"
            : "bg-amber-600 hover:bg-amber-500"
        }`}
      >
        Tindakan Mitigasi <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
