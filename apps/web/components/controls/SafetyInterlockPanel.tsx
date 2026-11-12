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
  const hasWaterTemp = typeof sensors.waterTemperature === "number";
  const hasAirTemp = typeof sensors.airTemperature === "number";
  const hasPh = typeof sensors.ph === "number";
  const hasLux = typeof sensors.lightIntensity === "number";

  const waterTempSafe =
    hasWaterTemp &&
    (sensors.waterTemperature as number) >= 22 &&
    (sensors.waterTemperature as number) <= 28;
  const airTempSafe =
    hasAirTemp &&
    (sensors.airTemperature as number) >= 24 &&
    (sensors.airTemperature as number) <= 32;
  const phSafe =
    hasPh && (sensors.ph as number) >= 6.5 && (sensors.ph as number) <= 7.5;
  const lightSafe =
    hasLux &&
    ((sensors.lightIntensity as number) >= 300 || Boolean(actuators.growLight?.isOn));

  const rules = [
    {
      id: "ph-buffer",
      title: "pH Air Probe (Dalam Air)",
      live: hasPh,
      ok: phSafe,
      liveValue: hasPh ? `${(sensors.ph as number).toFixed(2)} pH` : "--",
      threshold: "6.5 – 7.5 pH • Biofilter",
    },
    {
      id: "temp-water",
      title: "Suhu Air DS18B20 (Dalam Air)",
      live: hasWaterTemp,
      ok: waterTempSafe,
      liveValue: hasWaterTemp ? `${(sensors.waterTemperature as number).toFixed(1)}°C` : "--",
      threshold: "22 – 28°C • RELAY-01",
    },
    {
      id: "temp-air",
      title: "Suhu Udara DHT22 (Luar Air)",
      live: hasAirTemp,
      ok: airTempSafe,
      liveValue: hasAirTemp ? `${(sensors.airTemperature as number).toFixed(1)}°C` : "--",
      threshold: "24 – 32°C • Mikroklimat",
    },
    {
      id: "ldr-light",
      title: "Fotoperiode Sensor LDR (Luar Air)",
      live: hasLux,
      ok: lightSafe,
      liveValue: hasLux ? `${Math.round(sensors.lightIntensity as number)} lux` : "--",
      threshold: "≥ 300 lux • Fotosintesis",
    },
  ];

  const liveRulesCount = rules.filter((r) => r.live).length;
  const safeCount = rules.filter((r) => r.ok).length;

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
        <div>
          <h3 className="font-bold text-sm text-[#111827]">
            Proteksi Interlock 4 Sensor
          </h3>
          <span className="text-[10px] text-[#6B7280]">
            2 dalam air (pH &amp; DS18B20) &bull; 2 luar air (DHT22 &amp; LDR)
          </span>
        </div>

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
            ? "Maaf, alat offline"
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
