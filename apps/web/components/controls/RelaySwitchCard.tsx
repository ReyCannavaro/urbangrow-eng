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
      className={`rounded-[24px] bg-white border p-5 transition-colors shadow-xs flex flex-col justify-between h-[136px] group ${
        isLiveOn
          ? "border-[#165B39]/40 hover:border-[#165B39]/70"
          : "border-[#E5E7EB] hover:border-[#D1D5DB]"
      }`}
    >
      {/* Top: Indicator Dot + Name + Role + Toggle Switch */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 transition-colors ${
              !edgeOnline
                ? "bg-[#D1D5DB]"
                : actuator.isOn
                ? "bg-[#165B39] ring-3 ring-[#DCFCE7]"
                : "bg-[#D1D5DB]"
            }`}
          />
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-[#111827] leading-snug truncate">
              {actuator.name}
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">{role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(actuator.id)}
          className="flex items-center gap-2 cursor-pointer shrink-0 pt-0.5"
          title={
            edgeOnline
              ? `Ubah status ${actuator.name}`
              : `ESP32 offline — atur target antrean ${actuator.name}`
          }
          aria-pressed={actuator.isOn}
        >
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
              !edgeOnline
                ? actuator.isOn
                  ? "bg-[#6B7280]"
                  : "bg-[#E5E7EB]"
                : actuator.isOn
                ? "bg-[#165B39]"
                : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                actuator.isOn ? "translate-x-5.5" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Bottom Hairline Metadata */}
      <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#6B7280]">
        <span className="truncate num-tabular">
          {actuator.code || "RELAY"} &bull; {actuator.mode === "auto" ? "Auto" : "Manual"} &bull;{" "}
          {edgeOnline
            ? actuator.isOn
              ? `${actuator.powerWatts}W`
              : "0W"
            : `Nom. ${actuator.powerWatts}W`}
        </span>

        <span
          className={`font-semibold shrink-0 ${
            !edgeOnline
              ? "text-[#4B5563]"
              : actuator.isOn
              ? "text-[#165B39]"
              : "text-[#6B7280]"
          }`}
        >
          {edgeOnline
            ? actuator.isOn
              ? "Aktif"
              : "Standby"
            : actuator.isOn
            ? "Antrean: ON"
            : "Antrean: OFF"}
        </span>
      </div>
    </div>
  );
}
