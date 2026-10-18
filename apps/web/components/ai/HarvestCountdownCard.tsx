"use client";

import React from "react";
import { Sprout, Calendar, TrendingUp } from "lucide-react";

interface Props {
  cropName: string;
  daysToHarvest: number;
  accumulatedGdd: number;
  targetGdd: number;
  projectedBiomassGrams: number;
  growthStage: string;
}

export function HarvestCountdownCard({
  cropName,
  daysToHarvest,
  accumulatedGdd,
  targetGdd,
  projectedBiomassGrams,
  growthStage,
}: Props) {
  const progressPct = Math.min(100, Math.round((accumulatedGdd / targetGdd) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl transition duration-300 hover:border-emerald-500/30">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold capitalize text-slate-100">
              {cropName} (Level {cropName.toLowerCase() === "pakcoy" ? "4" : "2"})
            </h3>
            <p className="text-xs text-slate-400">{growthStage}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span>{daysToHarvest} Hari Lagi</span>
        </div>
      </div>

      <div className="my-5 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Akumulasi Termal GDD</span>
          <span className="font-mono text-slate-200 tabular-nums">
            {accumulatedGdd} / {targetGdd} °C·Hari
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-950/40 p-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span>Proyeksi Biomassa</span>
        </div>
        <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
          ~{projectedBiomassGrams} gram
        </span>
      </div>
    </div>
  );
}
