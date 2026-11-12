"use client";

import React from "react";
import { ActuatorState } from "@/lib/types";

interface RelaySwitchCardProps {
  actuator: ActuatorState;
  edgeOnline: boolean;
  onToggle: (id: string) => void;
}

export function RelaySwitchCard({
  actuator,
  edgeOnline,
  onToggle,
}: RelaySwitchCardProps) {
  const getActuatorRole = () => {
    switch (actuator.type) {
      case "pump":
        return "Sirkulasi Kaskade (L1 → L4)";
      case "aerator":
        return "Aerasi Oksigen Nila (L3)";
      case "light":
        return "Fotoperiode Tanaman (L4)";
      case "feeder":
        return "Dispenser Pelet (Pulse 3s)";
      case "dosing":
      default:
        return "Buffer Larutan pH";
    }
  };

  const role = getActuatorRole();
  const isLiveOn = edgeOnline && actuator.isOn;

  return (
    <div
      className={`rounded-[20px] bg-white border p-4 sm:p-5 transition-colors shadow-xs flex flex-col justify-between h-[168px] group ${
        isLiveOn
          ? "border-[#165B39]/45 hover:bg-[#F9FAFB]/70 hover:border-[#165B39]/70"
          : "border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
      }`}
    >
      {/* Top Header: Connection/State Dot, Name & Tactile Toggle Switch */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
              !edgeOnline
                ? "bg-[#D1D5DB]"
                : actuator.isOn
                ? "bg-[#165B39] ring-3 ring-[#DCFCE7]"
                : "bg-[#D1D5DB]"
            }`}
            title={
              !edgeOnline
                ? "ESP32 Offline"
                : actuator.isOn
                ? "Relay Aktif"
                : "Relay Standby"
            }
          />
          <div className="min-w-0">
            <h3
              className={`font-bold text-sm text-[#111827] transition-colors leading-tight truncate ${
                edgeOnline ? "group-hover:text-[#165B39]" : ""
              }`}
            >
              {actuator.name}
            </h3>
            <div className="text-[10.5px] font-mono text-[#6B7280] mt-0.5 truncate">
              {role}
            </div>
          </div>
        </div>

        {/* Tactile Toggle Switch (Queued Target when Offline, Live Relay Control when Online) */}
        <button
          type="button"
          onClick={() => onToggle(actuator.id)}
          className="flex items-center gap-2 cursor-pointer shrink-0"
          title={
            edgeOnline
              ? `Ubah status ${actuator.name}`
              : `ESP32 offline — ubah antrean target perintah ${actuator.name} di server`
          }
          aria-pressed={actuator.isOn}
        >
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-[#6B7280]">
            {edgeOnline
              ? actuator.isOn
                ? "ON"
                : "OFF"
              : actuator.isOn
              ? "TARGET ON"
              : "OFF"}
          </span>
          <div
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
              !edgeOnline
                ? actuator.isOn
                  ? "bg-[#6B7280]"
                  : "bg-[#E5E7EB] border border-[#D1D5DB]"
                : actuator.isOn
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

      {/* Middle: 3 Honest Hardware / Queue Chips */}
      <div className="grid grid-cols-3 gap-2 my-1 font-mono text-center">
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">
            {edgeOnline ? "Est. Beban" : "Beban Aktual"}
          </div>
          <div
            className={`text-xs font-bold num-tabular ${
              edgeOnline ? "text-[#111827]" : "text-[#9CA3AF]"
            }`}
          >
            {edgeOnline ? (actuator.isOn ? `${actuator.powerWatts}W` : "0W") : "--"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">Mode</div>
          <div className="text-xs font-bold text-[#111827] capitalize">
            {actuator.mode === "auto" ? "Auto" : "Manual"}
          </div>
        </div>
        <div className="bg-[#F8F9FA] p-2 rounded-lg border border-[#E5E7EB]">
          <div className="text-[9px] text-[#9CA3AF]">Kanal</div>
          <div
            className={`text-xs font-bold ${
              isLiveOn ? "text-[#165B39]" : "text-[#4B5563]"
            }`}
          >
            {actuator.code || "RELAY"}
          </div>
        </div>
      </div>

      {/* Bottom: Honest Connectivity & Queue Footer */}
      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono">
        {edgeOnline ? (
          <>
            <span className={actuator.isOn ? "text-[#166534] font-semibold" : "text-[#6B7280]"}>
              {actuator.isOn ? "TERHUBUNG • AKTIF" : "TERHUBUNG • STANDBY"}
            </span>
            <span className="text-[#9CA3AF]">
              Nom. {actuator.powerWatts}W • {actuator.voltage || "12V DC"}
            </span>
          </>
        ) : (
          <>
            <span className="text-[#9CA3AF]">HARDWARE OFFLINE</span>
            <span className="text-[#4B5563] font-semibold">
              Antrean: {actuator.isOn ? "ON" : "OFF"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
