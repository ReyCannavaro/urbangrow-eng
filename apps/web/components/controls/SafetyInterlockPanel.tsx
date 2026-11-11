"use client";

import React from "react";
import { ActuatorState, SensorData } from "@/lib/types";

interface SafetyInterlockPanelProps {
  sensors: SensorData;
  actuators: Record<string, ActuatorState>;
  edgeNode?: string;
}

export function SafetyInterlockPanel({
  sensors,
  actuators,
  edgeNode = "ESP32-GROW-01",
}: SafetyInterlockPanelProps) {
  const tempSafe = sensors.waterTemperature >= 22 && sensors.waterTemperature <= 28;
  const tdsSafe = sensors.tds >= 400 && sensors.tds <= 800;
  const phSafe = sensors.ph >= 6.4 && sensors.ph <= 7.6;
  const lightSafe = sensors.lightIntensity >= 300 || Boolean(actuators.growLight?.isOn);

  const interlockCount = [tempSafe, tdsSafe, phSafe, lightSafe].filter(Boolean).length;

  const rules = [
    {
      id: "temp-guard",
      title: "Suhu Air DS18B20",
      ok: tempSafe,
      okLabel: "Optimal",
      warnLabel: "Cek Suhu",
      liveValue: `${sensors.waterTemperature.toFixed(1)}°C`,
      threshold: "22 – 28°C • RELAY-02",
    },
    {
      id: "tds-balance",
      title: "Nutrisi TDS Kolam",
      ok: tdsSafe,
      okLabel: "Seimbang",
      warnLabel: "Pantau TDS",
      liveValue: `${Math.round(sensors.tds)} ppm`,
      threshold: "400 – 800 ppm • RELAY-01",
    },
    {
      id: "ph-buffer",
      title: "Penyangga pH Air",
      ok: phSafe,
      okLabel: "Stabil",
      warnLabel: "Buffer Check",
      liveValue: `${sensors.ph.toFixed(2)} pH`,
      threshold: "6.4 – 7.6 pH • RELAY-05",
    },
    {
      id: "ldr-light",
      title: "Fotoperiode LDR (L4)",
      ok: lightSafe,
      okLabel: "Cukup",
      warnLabel: "Butuh LED",
      liveValue: `${Math.round(sensors.lightIntensity)} lux`,
      threshold: "≥ 300 lux • RELAY-03",
    },
  ];

  return (
    <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#165B39] block">
            Node: {edgeNode} &bull; Fail-Safe
          </span>
          <h3 className="font-bold text-sm text-[#111827] mt-0.5">
            Aturan Otomasi &amp; Proteksi Interlock Hardware
          </h3>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold ${
            interlockCount === 4
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/15"
              : "bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/25"
          }`}
        >
          {interlockCount}/4 AMAN
        </span>
      </div>

      {/* 4 Live Hardware Interlock Rule Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-3 rounded-xl border flex flex-col justify-between min-h-[96px] transition-colors font-mono ${
                rule.ok
                  ? "bg-[#F8F9FA] border-[#E5E7EB]"
                  : "bg-[#FEF3C7]/40 border-[#F59E0B]/30"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10.5px] font-sans font-bold text-[#111827] truncate">
                  {rule.title}
                </span>
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    rule.ok ? "bg-[#165B39]" : "bg-[#D97706]"
                  }`}
                />
              </div>

              <div className="pt-2">
                <div className="text-base font-bold text-[#111827] num-tabular">
                  {rule.liveValue}
                </div>
                <div className="text-[9.5px] text-[#6B7280] truncate mt-0.5">
                  {rule.threshold}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
