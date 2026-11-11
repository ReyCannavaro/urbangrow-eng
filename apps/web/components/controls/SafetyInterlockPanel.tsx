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
      title: "Fotoperiode LDR (L4)",
      live: hasLux,
      ok: lightSafe,
      liveValue: hasLux ? `${Math.round(sensors.lightIntensity as number)} lux` : "--",
      threshold: "≥ 300 lux • RELAY-03",
    },
  ];

  const liveRulesCount = rules.filter((r) => r.live).length;
  const safeCount = rules.filter((r) => r.ok).length;

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
            liveRulesCount === 0
              ? "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
              : safeCount === liveRulesCount
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/15"
              : "bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/25"
          }`}
        >
          {liveRulesCount === 0
            ? "0/4 SENSOR OFFLINE"
            : `${safeCount}/${liveRulesCount} AMAN`}
        </span>
      </div>

      {/* 4 Live Hardware Interlock Rule Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-3 rounded-xl border flex flex-col justify-between min-h-[96px] transition-colors font-mono ${
                !rule.live
                  ? "bg-[#F9FAFB] border-[#E5E7EB]"
                  : rule.ok
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
                    !rule.live
                      ? "bg-[#9CA3AF]"
                      : rule.ok
                      ? "bg-[#165B39]"
                      : "bg-[#D97706]"
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
