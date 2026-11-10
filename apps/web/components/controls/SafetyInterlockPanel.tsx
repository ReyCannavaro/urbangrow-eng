"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, Droplets, Sun, Waves, Wind } from "lucide-react";
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
  const sumpSafe = sensors.waterLevel > 20;
  const doSafe = sensors.dissolvedOxygen >= 5.0;
  const phSafe = sensors.ph >= 6.4 && sensors.ph <= 7.6;
  const lightSafe = sensors.lightIntensity >= 300 || Boolean(actuators.growLight?.isOn);

  const interlockCount = [sumpSafe, doSafe, phSafe, lightSafe].filter(Boolean).length;

  const rules = [
    {
      id: "dry-run",
      title: "Proteksi Dry-Run Pompa (L1)",
      icon: Waves,
      iconColor: "text-[#0284C7]",
      iconBg: "bg-[#E0F2FE]",
      ok: sumpSafe,
      okLabel: "Aman",
      warnLabel: "Pompa Terkunci",
      liveValue: `Level Air ${sensors.waterLevel.toFixed(1)}%`,
      threshold: "Ambang Minimal > 20% • RELAY-01",
    },
    {
      id: "do-guard",
      title: "Aerator DO Booster (Nila L3)",
      icon: Wind,
      iconColor: "text-[#165B39]",
      iconBg: "bg-[#DCFCE7]",
      ok: doSafe,
      okLabel: "Oksigen Optimal",
      warnLabel: "Auto-Aerasi Aktif",
      liveValue: `DO ${sensors.dissolvedOxygen.toFixed(2)} mg/L`,
      threshold: "Target Aman ≥ 5.0 mg/L • RELAY-02",
    },
    {
      id: "ph-buffer",
      title: "Penyangga pH Nitrifikasi (L2)",
      icon: Droplets,
      iconColor: "text-[#165B39]",
      iconBg: "bg-[#DCFCE7]",
      ok: phSafe,
      okLabel: "Buffer Stabil",
      warnLabel: "Koreksi pH Siaga",
      liveValue: `pH Air ${sensors.ph.toFixed(2)}`,
      threshold: "Zona Ideal 6.4 - 7.6 pH • RELAY-05",
    },
    {
      id: "ldr-light",
      title: "Kompensasi Cahaya LDR (L4)",
      icon: Sun,
      iconColor: "text-[#D97706]",
      iconBg: "bg-[#FEF3C7]",
      ok: lightSafe,
      okLabel: "Fotosintesis Cukup",
      warnLabel: "Butuh Grow Light",
      liveValue: `LDR ${Math.round(sensors.lightIntensity)} lux`,
      threshold: "Target PAR ≥ 300 lux • RELAY-03",
    },
  ];

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#DCFCE7] text-[#165B39] flex items-center justify-center font-bold shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#111827]">
              Aturan Otomasi &amp; Proteksi Interlock Hardware (ECAD)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Evaluasi batas aman sensor node <strong>{edgeNode}</strong> secara real-time untuk menjaga pompa, ikan, dan tanaman:
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold shadow-2xs ${
            interlockCount === 4
              ? "bg-[#DCFCE7] text-[#166534] border border-[#166534]/20"
              : "bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/30"
          }`}
        >
          {interlockCount}/4 PARAMETER AMAN
        </span>
      </div>

      {/* 4 Live Hardware Interlock Rule Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[108px] transition-colors ${
                rule.ok
                  ? "bg-[#F8F9FA] border-[#E5E7EB]"
                  : "bg-[#FEF3C7]/45 border-[#F59E0B]/35"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`h-7 w-7 rounded-lg ${rule.iconBg} ${rule.iconColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-xs text-[#111827] truncate">
                    {rule.title}
                  </span>
                </div>
                {rule.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-[#165B39] shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0" />
                )}
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#111827] num-tabular">
                    {rule.liveValue}
                  </span>
                  <span
                    className={`font-semibold ${
                      rule.ok ? "text-[#166534]" : "text-[#B45309]"
                    }`}
                  >
                    {rule.ok ? rule.okLabel : rule.warnLabel}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#6B7280]">
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
