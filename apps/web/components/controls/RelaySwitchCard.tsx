"use client";

import React from "react";
import { Waves, Wind, Sun, Zap, FlaskConical } from "lucide-react";
import { ActuatorState } from "@/lib/types";

interface RelaySwitchCardProps {
  actuator: ActuatorState;
  onToggle: (id: string) => void;
}

export function RelaySwitchCard({ actuator, onToggle }: RelaySwitchCardProps) {
  const getActuatorMeta = () => {
    switch (actuator.type) {
      case "pump":
        return {
          icon: Waves,
          bg: "bg-[#E0F2FE] text-[#0284C7]",
          badge: "bg-[#E0F2FE] text-[#0369A1]",
          role: "Sirkulasi Tertutup Lift 12V",
        };
      case "aerator":
        return {
          icon: Wind,
          bg: "bg-[#DCFCE7] text-[#166534]",
          badge: "bg-[#DCFCE7] text-[#166534]",
          role: "Injeksi Oksigen DO Nila",
        };
      case "light":
        return {
          icon: Sun,
          bg: "bg-[#FEF3C7] text-[#D97706]",
          badge: "bg-[#FEF3C7] text-[#B45309]",
          role: "Fotoperiode LED Tanaman",
        };
      case "feeder":
        return {
          icon: Zap,
          bg: "bg-[#F3E8FF] text-[#7E22CE]",
          badge: "bg-[#F3E8FF] text-[#7E22CE]",
          role: "Solenoid Pelet Otomatis",
        };
      case "dosing":
      default:
        return {
          icon: FlaskConical,
          bg: "bg-[#FCE7F3] text-[#BE185D]",
          badge: "bg-[#FCE7F3] text-[#BE185D]",
          role: "Koreksi Larutan Buffer pH",
        };
    }
  };

  const meta = getActuatorMeta();
  const Icon = meta.icon;
  const amperage = (actuator.powerWatts / 12).toFixed(1);

  return (
    <div
      className={`rounded-[24px] bg-white border p-5 transition-all shadow-xs flex flex-col justify-between h-[180px] group ${
        actuator.isOn
          ? "border-[#165B39]/50 ring-1 ring-[#165B39]/20"
          : "border-[#E5E7EB] hover:border-[#CBD5E1]"
      }`}
    >
      {/* Top Header: Icon, Name & Tactile Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${meta.bg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#165B39] transition-colors">
                {actuator.name}
              </h3>
            </div>
            <div className="text-[11px] text-[#6B7280]">
              {meta.role}
            </div>
          </div>
        </div>

        {/* Donezo Tactile Toggle Switch */}
        <div
          onClick={() => onToggle(actuator.id)}
          className="flex items-center gap-2 cursor-pointer"
          title={`Toggle ${actuator.name}`}
        >
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-[#4B5563]">
            {actuator.isOn ? "ON" : "OFF"}
          </span>
          <div
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
              actuator.isOn
                ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.35)]"
                : "bg-[#E5E7EB] border border-[#D1D5DB]"
            }`}
          >
            <span
              className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                actuator.isOn ? "translate-x-5.5" : "translate-x-1"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Middle: 3 Hardware Telemetry Chips */}
      <div className="grid grid-cols-3 gap-2 my-2">
        <div className="bg-[#F8F9FA] p-2 rounded-xl border border-[#E5E7EB] text-center">
          <div className="text-[9px] text-[#9CA3AF] font-medium">Beban Listrik</div>
          <div className="text-xs font-bold text-[#111827] num-tabular">
            {actuator.isOn ? `${actuator.powerWatts} Watt` : "0 Watt"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-xl border border-[#E5E7EB] text-center">
          <div className="text-[9px] text-[#9CA3AF] font-medium">Arus DC</div>
          <div className="text-xs font-bold text-[#111827] num-tabular">
            {actuator.isOn ? `${amperage} A` : "0.0 A"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-xl border border-[#E5E7EB] text-center">
          <div className="text-[9px] text-[#9CA3AF] font-medium">Kanal Relay</div>
          <div className="text-xs font-bold text-[#165B39] font-mono">
            {actuator.code || "RELAY"}
          </div>
        </div>
      </div>

      {/* Bottom: Status & Indicator */}
      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono">
        <span className="flex items-center gap-1.5 text-[#4B5563]">
          <span
            className={`h-2 w-2 rounded-full ${
              actuator.isOn
                ? "bg-[#165B39] shadow-[0_0_6px_rgba(22,91,57,0.6)] animate-pulse"
                : "bg-[#9CA3AF]"
            }`}
          />
          {actuator.isOn ? "AKTIF BEROPERASI" : "STANDBY TERPUTUS"}
        </span>
        <span className="text-[#9CA3AF]">
          12V DC Switcher
        </span>
      </div>
    </div>
  );
}
