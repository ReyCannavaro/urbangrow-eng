"use client";

import React from "react";
import { Waves, Wind, Sun, Zap } from "lucide-react";
import { ActuatorState } from "@/lib/types";

interface RelaySwitchCardProps {
  actuator: ActuatorState;
  onToggle: (id: string) => void;
}

export function RelaySwitchCard({ actuator, onToggle }: RelaySwitchCardProps) {
  const renderIcon = () => {
    switch (actuator.type) {
      case "pump":
        return <Waves className="h-6 w-6" />;
      case "aerator":
        return <Wind className="h-6 w-6" />;
      case "light":
        return <Sun className="h-6 w-6" />;
      case "feeder":
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <div
      className={`rounded-[24px] bg-white border p-5 transition-all shadow-xs flex items-center justify-between ${
        actuator.isOn ? "border-[#165B39]/40 ring-1 ring-[#165B39]/20" : "border-[#E5E7EB]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
            actuator.isOn ? "bg-[#DCFCE7] text-[#166534]" : "bg-stone-100 text-stone-400"
          }`}
        >
          {renderIcon()}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[#111827]">{actuator.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-mono text-[#9CA3AF]">{actuator.code}</span>
            <span className="text-[11px] font-mono text-[#9CA3AF]">• {actuator.powerWatts} Watt</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                actuator.isOn ? "bg-[#DCFCE7] text-[#166534]" : "bg-stone-100 text-stone-500"
              }`}
            >
              {actuator.isOn ? "AKTIF" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Toggle Switch */}
      <button
        onClick={() => onToggle(actuator.id)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          actuator.isOn ? "bg-[#165B39]" : "bg-[#D1D5DB]"
        }`}
        aria-label={`Toggle ${actuator.name}`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
            actuator.isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
