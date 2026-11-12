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
}: SafetyInterlockPanelProps) {
  const hasTemp = typeof sensors.waterTemperature === "number";
  const hasTds = typeof sensors.tds === "number";
  const hasPh = typeof sensors.ph === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const tempSafe =
    hasTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 28;
  const tdsSafe =
    hasTds && (sensors.tds as number) >= 400 && (sensors.tds as number) <= 800;
  const phSafe =
    hasPh && (sensors.ph as number) >= 6.4 && (sensors.ph as number) <= 7.6;
  const lightSafe =
    hasLux &&
    ((sensors.lightIntensity as number) >= 300 || Boolean(actuators.growLight?.isOn));

  const rules = [
    {
      id: "temp-guard",
      title: "Suhu Air DS18B20",
      live: hasTemp,
      ok: tempSafe,
      liveValue: hasTemp ? `${(sensors.waterTemperature as number).toFixed(1)}°C` : "--",
      threshold: "22 – 28°C • RELAY-02",
    },
    {
      id: "tds-balance",
      title: "Nutrisi TDS Kolam",
      live: hasTds,
      ok: tdsSafe,
      liveValue: hasTds ? `${Math.round(sensors.tds as number)} ppm` : "--",
      threshold: "400 – 800 ppm • RELAY-01",
    },
    {
      id: "ph-buffer",
      title: "Penyangga pH Air",
      live: hasPh,
      ok: phSafe,
      liveValue: hasPh ? `${(sensors.ph as number).toFixed(2)} pH` : "--",
      threshold: "6.4 – 7.6 pH • RELAY-05",
    },
    {
      id: "ldr-light",
      title: "Fotoperiode Sensor LDR",
      live: hasLux,
      ok: lightSafe,
      liveValue: hasLux ? `${Math.round(sensors.lightIntensity as number)} lux` : "--",
      threshold: "≥ 300 lux • RELAY-03",
    },
  ];

  const liveRulesCount = rules.filter((r) => r.live).length;
  const safeCount = rules.filter((r) => r.ok).length;

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
        <h3 className="font-bold text-sm text-[#111827]">
          Proteksi Interlock Sensor
        </h3>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            liveRulesCount === 0
              ? "bg-[#F3F4F6] text-[#6B7280]"
              : safeCount === liveRulesCount
              ? "bg-[#DCFCE7] text-[#166534]"
              : "bg-[#FEF3C7] text-[#B45309]"
          }`}
        >
          {liveRulesCount === 0
            ? "Sensor Offline"
            : `${safeCount}/${liveRulesCount} Aman`}
        </span>
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="py-3 first:pt-3 last:pb-0 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  !rule.live
                    ? "bg-[#D1D5DB]"
                    : rule.ok
                    ? "bg-[#165B39]"
                    : "bg-[#D97706]"
                }`}
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#111827] truncate">
                  {rule.title}
                </div>
                <div className="text-[11px] text-[#6B7280] truncate">
                  {rule.threshold}
                </div>
              </div>
            </div>

            <span className="text-sm font-bold text-[#111827] num-tabular shrink-0">
              {rule.liveValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
