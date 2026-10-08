"use client";

import React from "react";
import Link from "next/link";
import { Waves, Wind, Sun, Utensils, Check } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function RelayActuatorsCard() {
  const { actuators, toggleActuator } = useTelemetry();

  const actuatorMeta = [
    {
      id: "waterPump",
      name: "Pompa Sirkulasi 12V",
      sub: "45 Watt • Kaskade 24/7",
      icon: Waves,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "aerator",
      name: "Aerator Oksigen Nila",
      sub: "18 Watt • DO Booster L3",
      icon: Wind,
      iconBg: "bg-teal-50 text-teal-600",
    },
    {
      id: "growLight",
      name: "Grow Light Fotosintesis",
      sub: "32 Watt • Spektrum L4",
      icon: Sun,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "feeder",
      name: "Auto-Feeder Dispenser",
      sub: "12V DC • Solenoid Pakan",
      icon: Utensils,
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
        <span className="text-xs font-semibold text-[#111827]">
          Aktuator Relay Edge
        </span>
        <Link
          href="/controls"
          className="px-2.5 py-1 rounded-full border border-[#E5E7EB] text-[10px] font-bold text-[#111827] hover:bg-[#F8F9FA] transition-colors"
        >
          + Kontrol
        </Link>
      </div>

      {/* 4 Hardware Relay Items (Matching Donezo Project List) */}
      <div className="space-y-2 py-1">
        {actuatorMeta.map((item) => {
          const act = actuators[item.id];
          const isOn = act?.isOn ?? false;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => toggleActuator(item.id)}
              className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-[#F8F9FA] cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111827] group-hover:text-[#165B39] transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] font-mono">
                    {item.sub}
                  </div>
                </div>
              </div>

              {/* Tactile Toggle Switch (Nyala / Mati) */}
              <div
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  isOn
                    ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.25)]"
                    : "bg-[#E5E7EB] border border-[#D1D5DB]"
                }`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                    isOn ? "translate-x-5.5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
