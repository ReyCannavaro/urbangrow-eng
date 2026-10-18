"use client";

import React from "react";
import { ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { ClimateScoreData } from "../../lib/aiApi";

interface Props {
  data: ClimateScoreData;
}

export function ClimateScoreCard({ data }: Props) {
  const score = data.climate_adaptation_score;
  const isHealthy = score >= 75;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl transition duration-300 hover:border-emerald-500/30">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Climate Adaptation Score
            </h3>
            <p className="text-xs text-slate-400">ECAD Index (0 - 100)</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isHealthy
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}
        >
          {isHealthy ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {data.resilience_grade}
        </span>
      </div>

      <div className="my-6 flex items-baseline gap-2">
        <span className="font-mono text-5xl font-bold tracking-tight text-slate-100 tabular-nums">
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-slate-400">/ 100</span>
      </div>

      {/* Sub Scores Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
        <div className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-3">
          <span className="text-slate-400">Suhu Air</span>
          <p className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
            {data.sub_scores.temperature_stability}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-3">
          <span className="text-slate-400">Kualitas pH/TDS</span>
          <p className="font-mono text-sm font-semibold text-cyan-400 tabular-nums">
            {data.sub_scores.water_quality}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-3">
          <span className="text-slate-400">Oksigen Terlarut</span>
          <p className="font-mono text-sm font-semibold text-blue-400 tabular-nums">
            {data.sub_scores.dissolved_oxygen}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/50 bg-slate-950/40 p-3">
          <span className="text-slate-400">Fotoperiode LED</span>
          <p className="font-mono text-sm font-semibold text-amber-400 tabular-nums">
            {data.sub_scores.photoperiod_consistency}%
          </p>
        </div>
      </div>
    </div>
  );
}
