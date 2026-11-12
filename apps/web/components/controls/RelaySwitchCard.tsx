"use client";

import React from "react";
import { Waves, Wind, Sun, Utensils, Droplets } from "lucide-react";
import { ActuatorState } from "@/lib/types";

interface RelaySwitchCardProps {
  actuator: ActuatorState;
  edgeOnline: boolean;
  onToggle: (id: string) => void;
}

const ACTUATOR_CONFIG: Record<
  string,
  {
    name: string;
    role: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
  }
> = {
  waterPump: {
    name: "Pompa Sirkulasi 12V",
    role: "Sirkulasi Kolam → Pakcoy",
    icon: Waves,
    iconBg: "bg-[#DCFCE7] text-[#166534]",
  },
  aerator: {
    name: "Aerator Oksigen Nila",
    role: "Aerasi Kolam Ikan Nila",
    icon: Wind,
    iconBg: "bg-[#DCFCE7] text-[#166534]",
  },
  growLight: {
    name: "Grow Light Fotosintesis",
    role: "Fotoperiode Pakcoy & Kangkung",
    icon: Sun,
    iconBg: "bg-[#FEF3C7] text-[#B45309]",
  },
  feeder: {
    name: "Auto-Feeder Dispenser",
    role: "Dispenser Pelet Pakan (3s)",
    icon: Utensils,
    iconBg: "bg-[#F3F4F6] text-[#111827]",
  },
  dosingPump: {
    name: "Pompa Dosing Buffer pH",
    role: "Stabilisasi Larutan Buffer pH",
    icon: Droplets,
    iconBg: "bg-[#DCFCE7] text-[#165B39]",
  },
};

export function RelaySwitchCard({
  actuator,
  edgeOnline,
  onToggle,
}: RelaySwitchCardProps) {
  const conf = ACTUATOR_CONFIG[actuator.id] ?? {
    name: actuator.name,
    role: "Kontrol Aktuator",
    icon: Droplets,
    iconBg: "bg-[#F3F4F6] text-[#111827]",
  };

  const displayName = conf.name;
  const role = conf.role;
  const Icon = conf.icon;
  const isLiveOn = edgeOnline && actuator.isOn;

  return (
    <div
      className={`rounded-[24px] bg-white border p-5 transition-colors shadow-xs flex flex-col justify-between h-[142px] group ${
        isLiveOn
          ? "border-[#165B39]/40 hover:border-[#165B39]/70"
          : "border-[#E5E7EB] hover:border-[#D1D5DB]"
      }`}
    >
      {/* Top: Icon Badge + Name + Role + Tactile Switch */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${conf.iconBg}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-[#111827] leading-snug truncate">
              {displayName}
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
              ? `Ubah status ${displayName}`
              : `Maaf, alat sedang offline — saklar otomatis kembali OFF jika dinyalakan (${displayName})`
          }
          aria-pressed={actuator.isOn}
        >
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
              !edgeOnline
                ? actuator.isOn
                  ? "bg-[#6B7280] animate-pulse"
                  : "bg-[#E5E7EB]"
                : actuator.isOn
                ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.2)]"
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
              ? actuator.isOn
                ? "text-[#B45309]"
                : "text-[#6B7280]"
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
            ? "Mencoba Sinyal..."
            : "Maaf, alat offline"}
        </span>
      </div>
    </div>
  );
}
