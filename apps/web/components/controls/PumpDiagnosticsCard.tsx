"use client";

import React from "react";
import {
  Waves,
  XCircle,
  ShieldAlert,
  Power,
  Wrench,
} from "lucide-react";
import { ActuatorState, SensorData } from "@/lib/types";

interface PumpDiagnosticsCardProps {
  sensors: SensorData;
  pump?: ActuatorState;
  edgeOnline: boolean;
  edgeNode: string;
  onTogglePump: () => void;
}

export function PumpDiagnosticsCard({
  sensors,
  pump,
  edgeOnline,
  edgeNode,
  onTogglePump,
}: PumpDiagnosticsCardProps) {
  const isPumpOn = Boolean(pump?.isOn);
  const waterLevel = sensors.waterLevel;
  const isWaterLevelLow = typeof waterLevel === "number" && waterLevel <= 20;

  // Evaluasi diagnosa status pompa
  let statusType: "active" | "standby" | "blocked" | "offline" = "standby";
  let title = "Pompa Siaga (Standby)";
  let explanation =
    "Semua interlock keamanan normal. Pompa siap dijalankan.";
  let solution: string | null = null;

  if (!edgeOnline) {
    statusType = "offline";
    title = "Node Hardware Sedang Offline";
    explanation = `Modul mikrokontroler ${edgeNode} belum terhubung ke jaringan Wi-Fi Quantum Leap. Saklar ditahan OFF demi proteksi perangkat.`;
    solution =
      "Pastikan board ESP32 terhubung dengan kabel USB/catu daya 12V dan Wi-Fi aktif.";
  } else if (isWaterLevelLow) {
    statusType = "blocked";
    title = "Interlock Keamanan Aktif: Level Air Kritis (≤ 20%)";
    explanation =
      "Sensor level mendeteksi tandon air surut. Proteksi Dry-Run aktif otomatis untuk mencegah motor pompa 12V terbakar.";
    solution =
      "Tambahkan air pada tandon nutrisi hingga minimal di atas 20% agar pompa dapat dinyalakan.";
  } else if (isPumpOn) {
    statusType = "active";
    title = "Pompa Sedang Beroperasi Normal";
    explanation =
      "Relay RELAY-01 (GPIO 14 Active-LOW) dalam posisi ON (Beban: 45W).";
    solution = null;
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
      {/* 1. Header: Icon, Name, Edge Pin & Action Button */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              statusType === "active"
                ? "bg-[#EDF3EC] border-[#165B39]/20 text-[#165B39]"
                : statusType === "blocked"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : statusType === "offline"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
            }`}
          >
            <Waves className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827] truncate">
                Pompa Sirkulasi 12V
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold uppercase ${
                  statusType === "active"
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : statusType === "blocked"
                    ? "bg-amber-100 text-amber-800"
                    : statusType === "offline"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-[#F3F4F6] text-[#4B5563]"
                }`}
              >
                {statusType === "active"
                  ? "RUNNING"
                  : statusType === "blocked"
                  ? "INTERLOCK"
                  : statusType === "offline"
                  ? "OFFLINE"
                  : "STANDBY"}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
              RELAY-01 &bull; GPIO 14 (Active-LOW) &bull; 45W
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onTogglePump}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5 ${
            isPumpOn
              ? "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              : "bg-[#165B39] text-white hover:bg-[#124B2E]"
          }`}
        >
          <Power className="h-3.5 w-3.5" />
          <span>{isPumpOn ? "Matikan" : "Nyalakan"}</span>
        </button>
      </div>

      {/* 2. Structured Telemetry Metrics Grid (Zero AI Fluff) */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <span className="text-[10px] text-[#6B7280] block font-mono">STATUS ALIRAN</span>
          <span
            className={`font-semibold text-xs mt-0.5 block ${
              isPumpOn ? "text-[#165B39]" : "text-[#6B7280]"
            }`}
          >
            {isPumpOn ? "Mengalir Normal" : "Mati (Standby)"}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <span className="text-[10px] text-[#6B7280] block font-mono">LEVEL AIR TANDON</span>
          <span
            className={`font-semibold text-xs mt-0.5 block ${
              isWaterLevelLow ? "text-amber-700 font-bold" : "text-[#111827]"
            }`}
          >
            {typeof waterLevel === "number" ? `${waterLevel}%` : "--"}{" "}
            <span className="text-[10px] font-normal text-[#6B7280]">
              {isWaterLevelLow ? "(Kritis)" : "(Aman)"}
            </span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <span className="text-[10px] text-[#6B7280] block font-mono">DAYA BEBAN</span>
          <span className="font-semibold text-xs text-[#111827] mt-0.5 block font-mono">
            {isPumpOn ? "45 Watt" : "0 Watt"}
          </span>
        </div>
      </div>

      {/* 3. Safety Notice (Hanya muncul jika tertahan Dry-Run atau Node Offline) */}
      {(statusType === "blocked" || statusType === "offline") && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            statusType === "blocked"
              ? "bg-amber-50/80 border-amber-200 text-amber-900"
              : "bg-rose-50/80 border-rose-200 text-rose-900"
          }`}
        >
          {statusType === "blocked" ? (
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 min-w-0 flex-1">
            <h4 className="font-bold text-[11.5px]">{title}</h4>
            <p className="text-[11px] opacity-90 leading-relaxed">{explanation}</p>
            {solution && (
              <div className="mt-1 pt-1 border-t border-current/15 text-[10.5px] font-medium flex items-center gap-1 opacity-90">
                <Wrench className="h-3 w-3 shrink-0" />
                <span>
                  <strong>Solusi:</strong> {solution}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
