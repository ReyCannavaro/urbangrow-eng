"use client";

import React from "react";
import { ActuatorState } from "@/lib/types";

interface RelaySwitchCardProps {
  actuator: ActuatorState;
  onToggle: (id: string) => void;
}

export function RelaySwitchCard({ actuator, onToggle }: RelaySwitchCardProps) {
  const getActuatorRole = () => {
    switch (actuator.type) {
      case "pump":
        return "Sirkulasi Lift 12V DC";
      case "aerator":
        return "Injeksi Aerasi Nila";
      case "light":
        return "Fotoperiode LED 12V";
      case "feeder":
        return "Solenoid Pelet 35g";
      case "dosing":
      default:
        return "Buffer Larutan pH";
    }
  };

  const role = getActuatorRole();
  const amperage = (actuator.powerWatts / 12).toFixed(1);

  return (
    <div
      className={`rounded-[20px] bg-white border p-4 sm:p-5 transition-colors shadow-xs flex flex-col justify-between h-[165px] group ${
        actuator.isOn
          ? "border-[#165B39]/40 hover:bg-[#F9FAFB]/70 hover:border-[#165B39]/60"
          : "border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
      }`}
    >
      {/* Top Header: Physical LED Status Dot, Name & Tactile Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
              actuator.isOn
                ? "bg-[#165B39] ring-3 ring-[#DCFCE7]"
                : "bg-stone-300"
            }`}
          />
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#165B39] transition-colors leading-tight truncate">
              {actuator.name}
            </h3>
            <div className="text-[10.5px] font-mono text-[#6B7280] mt-0.5 truncate">
              {role}
            </div>
          </div>
        </div>

        {/* Tactile Toggle Switch */}
        <button
          type="button"
          onClick={() => onToggle(actuator.id)}
          className="flex items-center gap-2 cursor-pointer shrink-0"
          title={`Toggle ${actuator.name}`}
          aria-pressed={actuator.isOn}
        >
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-[#4B5563]">
            {actuator.isOn ? "ON" : "OFF"}
          </span>
          <div
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
              actuator.isOn
                ? "bg-[#165B39]"
                : "bg-[#E5E7EB] border border-[#D1D5DB]"
            }`}
          >
            <span
              className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                actuator.isOn ? "translate-x-5.5" : "translate-x-1"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Middle: 3 Hardware Telemetry Chips (Pure Typography & Units) */}
      <div className="grid grid-cols-3 gap-2 my-1 font-mono text-center">
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">Beban</div>
          <div className="text-xs font-bold text-[#111827] num-tabular">
            {actuator.isOn ? `${actuator.powerWatts}W` : "0W"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">Arus DC</div>
          <div className="text-xs font-bold text-[#111827] num-tabular">
            {actuator.isOn ? `${amperage}A` : "0.0A"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">Kanal</div>
          <div className="text-xs font-bold text-[#165B39]">
            {actuator.code || "RELAY"}
          </div>
        </div>
      </div>

      {/* Bottom: Status & Indicator */}
      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#4B5563]">
          {actuator.isOn ? "KONTAK TERTUTUP (ENGAGED)" : "STANDBY TERPUTUS"}
        </span>
        <span className="text-[#9CA3AF]">
          10A 250V AC / 30V DC
        </span>
      </div>
    </div>
  );
}
