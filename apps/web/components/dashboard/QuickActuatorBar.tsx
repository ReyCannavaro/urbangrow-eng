"use client";

import React from "react";
import { Power, Wind, Sun, AlertTriangle } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function QuickActuatorBar() {
  const { actuators, toggleActuator } = useTelemetry();

  const pump = actuators?.waterPump;
  const aerator = actuators?.aerator;
  const light = actuators?.growLight;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-xs backdrop-blur-xl">
      <div className="flex items-center gap-2 text-slate-300 font-semibold">
        <Power className="h-4 w-4 text-emerald-400" />
        <span>Kendali Cepat Aktuator</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Pump Switch */}
        <button
          onClick={() => toggleActuator("pump")}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-medium transition ${
            pump?.isOn
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-slate-800 bg-slate-950/60 text-slate-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              pump?.isOn ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
            }`}
          />
          <span>Pompa Sirkulasi</span>
        </button>

        {/* Aerator Switch */}
        <button
          onClick={() => toggleActuator("aerator")}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-medium transition ${
            aerator?.isOn
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
              : "border-slate-800 bg-slate-950/60 text-slate-400"
          }`}
        >
          <Wind className="h-3.5 w-3.5 text-cyan-400" />
          <span>Aerator O2</span>
        </button>

        {/* Grow Light Switch */}
        <button
          onClick={() => toggleActuator("light")}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-medium transition ${
            light?.isOn
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-slate-800 bg-slate-950/60 text-slate-400"
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span>LED Spektrum</span>
        </button>
      </div>
    </div>
  );
}
