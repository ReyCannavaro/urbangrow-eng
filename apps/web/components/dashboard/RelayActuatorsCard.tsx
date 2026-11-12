"use client";

import React from "react";
import Link from "next/link";
import { Waves, Wind, Sun, Utensils } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function RelayActuatorsCard() {
  const { actuators, systemMeta, toggleActuator } = useTelemetry();
  const edgeOnline = systemMeta.edgeOnline;

  const actuatorMeta = [
    {
      id: "waterPump",
      name: "Pompa Sirkulasi 12V",
      role: "Kolam → Pakcoy",
      watt: 45,
      icon: Waves,
      iconBg: "bg-[#DCFCE7] text-[#166534]",
    },
    {
      id: "aerator",
      name: "Aerator Oksigen Nila",
      role: "Aerasi Kolam Nila",
      watt: 18,
      icon: Wind,
      iconBg: "bg-[#DCFCE7] text-[#166534]",
    },
    {
      id: "growLight",
      name: "Grow Light Fotosintesis",
      role: "Fotoperiode Fotosintesis",
      watt: 85,
      icon: Sun,
      iconBg: "bg-[#FEF3C7] text-[#B45309]",
    },
    {
      id: "feeder",
      name: "Auto-Feeder Dispenser",
      role: "Dispenser Pelet (3s)",
      watt: 12,
      icon: Utensils,
      iconBg: "bg-[#F3F4F6] text-[#111827]",
    },
  ];

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[280px]">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-[#111827] truncate">
            Aktuator Relay Edge
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold shrink-0 ${
              edgeOnline
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#F3F4F6] text-[#6B7280]"
            }`}
          >
            {edgeOnline ? "Live" : "Maaf, alat offline"}
          </span>
        </div>
        <Link
          href="/controls"
          className="px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-white text-[10px] font-bold text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors shrink-0"
        >
          + Kontrol
        </Link>
      </div>

      {/* 4 Hardware Relay Items */}
      <div className="space-y-2 py-1">
        {actuatorMeta.map((item) => {
          const act = actuators[item.id];
          const isWaterPump = item.id === "waterPump" || item.id === "pump";
          const isInstalled = isWaterPump;
          const isOn = act?.isOn ?? false;
          const Icon = item.icon;
          const subLabel = !isInstalled
            ? isOn
              ? "Menguji Alat... (Auto-OFF)"
              : "Tahap Pengembangan (Hardware belum ada)"
            : !edgeOnline
            ? isOn
              ? "Mencoba Sinyal... (Auto-OFF)"
              : "Maaf, alat sedang offline"
            : isOn
            ? `${act?.powerWatts ?? item.watt}W Aktif • GPIO 14 (Mengalir)`
            : `Standby (OFF) • ${item.role}`;

          return (
            <div
              key={item.id}
              onClick={() => toggleActuator(item.id)}
              title={
                !isInstalled
                  ? `Kanal ${item.name} masih dalam tahap pengembangan — mengklik akan mengirim sinyal uji dinamis ke ESP32 lalu otomatis kembali OFF.`
                  : edgeOnline
                  ? `Ubah status ${item.name}`
                  : `Maaf, alat sedang offline — saklar otomatis kembali OFF (${item.name})`
              }
              className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-[#F9FAFB] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111827] flex items-center gap-1.5 truncate">
                    <span>{item.name}</span>
                    {isInstalled ? (
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Terpasang
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                        Dev
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] font-mono truncate">
                    {subLabel}
                  </div>
                </div>
              </div>

              {/* Tactile Toggle Switch */}
              <div
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  !isInstalled
                    ? isOn
                      ? "bg-amber-500 animate-pulse"
                      : "bg-[#E5E7EB] border border-[#D1D5DB]"
                    : !edgeOnline
                    ? isOn
                      ? "bg-[#6B7280] animate-pulse"
                      : "bg-[#E5E7EB] border border-[#D1D5DB]"
                    : isOn
                    ? "bg-[#165B39] shadow-[0_0_8px_rgba(22,91,57,0.2)]"
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
