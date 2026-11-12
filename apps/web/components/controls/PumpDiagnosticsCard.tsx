"use client";

import React from "react";
import {
  Waves,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  ShieldAlert,
  Info,
  Wrench,
  Power,
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
  let title = "Pompa Sirkulasi 12V Standby (Siap Digunakan)";
  let explanation =
    "Sistem dalam kondisi normal. Semua parameter air dan interlock proteksi aman. Klik tombol untuk menyalakan pompa.";
  let solution: string | null = null;

  if (!edgeOnline) {
    statusType = "offline";
    title = "Pompa Tidak Dapat Dinyalakan: Node Hardware Sedang Offline";
    explanation = `Modul mikrokontroler ${edgeNode} belum terhubung ke jaringan Wi-Fi Quantum Leap atau belum mengirim telemetri. Saklar otomatis ditahan OFF demi keamanan.`;
    solution =
      "Pastikan board ESP32 terhubung dengan kabel USB/catu daya 12V, LED indikator menyala, dan Wi-Fi 'Quantum Leap' aktif.";
  } else if (isWaterLevelLow) {
    statusType = "blocked";
    title = "Pompa Ditahan Sistem Keamanan: Level Air Tandon Kritis (≤ 20%)";
    explanation =
      "Sensor level air mendeteksi tandon surut. Proteksi Dry-Run aktif secara otomatis untuk mencegah motor pompa 12V terbakar akibat berputar tanpa air.";
    solution =
      "Tambahkan air pada tandon nutrisi hingga minimal di atas 20% agar interlock keamanan melepaskan penahanan pompa.";
  } else if (isPumpOn) {
    statusType = "active";
    title = "Pompa Sirkulasi 12V Sedang Aktif (Mengalir Normal)";
    explanation =
      "Relay RELAY-01 (GPIO 14 Active-LOW) dalam posisi ON. Air bernutrisi bersirkulasi dari kolam ikan ke modul talang vertikal pakcoy & kangkung (Beban: 45 Watt).";
    solution = null;
  }

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs space-y-4">
      {/* Header Diagnostik Pompa */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              statusType === "active"
                ? "bg-[#DCFCE7] text-[#166534]"
                : statusType === "offline"
                ? "bg-rose-100 text-rose-700"
                : statusType === "blocked"
                ? "bg-amber-100 text-amber-700"
                : "bg-[#F3F4F6] text-[#4B5563]"
            }`}
          >
            <Waves className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              Diagnostik &amp; Kesiapan Pompa 12V
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              Monitoring interlock hardware &amp; pencegahan dry-run motor
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
            statusType === "active"
              ? "bg-[#DCFCE7] text-[#166534]"
              : statusType === "offline"
              ? "bg-rose-100 text-rose-700"
              : statusType === "blocked"
              ? "bg-amber-100 text-amber-700"
              : "bg-[#F3F4F6] text-[#4B5563]"
          }`}
        >
          {statusType === "active"
            ? "Aktif (Mengalir)"
            : statusType === "offline"
            ? "Offline"
            : statusType === "blocked"
            ? "Tertahan Keamanan"
            : "Siaga (Standby)"}
        </span>
      </div>

      {/* Status Box */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          statusType === "active"
            ? "bg-[#DCFCE7]/40 border-[#165B39]/20 text-[#166534]"
            : statusType === "offline"
            ? "bg-rose-50/80 border-rose-200 text-rose-800"
            : statusType === "blocked"
            ? "bg-amber-50/80 border-amber-200 text-amber-800"
            : "bg-[#F9FAFB] border-[#E5E7EB] text-[#374151]"
        }`}
      >
        <div className="flex items-start gap-3">
          {statusType === "active" ? (
            <CheckCircle2 className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
          ) : statusType === "offline" ? (
            <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          ) : statusType === "blocked" ? (
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-[#4B5563] shrink-0 mt-0.5" />
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-xs font-bold leading-snug">{title}</h4>
            <p className="text-[11.5px] leading-relaxed opacity-90">
              {explanation}
            </p>

            {solution && (
              <div className="mt-2 pt-2 border-t border-current/15 flex items-start gap-1.5 text-[11px] font-medium">
                <Wrench className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Solusi:</strong> {solution}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onTogglePump}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 ${
              isPumpOn
                ? "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                : "bg-[#165B39] text-white hover:bg-[#134e31]"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{isPumpOn ? "Matikan" : "Nyalakan"}</span>
          </button>
        </div>
      </div>

      {/* Matriks Kesiapan Perangkat Keras (Hardware Matrix) */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-[#165B39]" />
          <span>Matriks Kesiapan Hardware Aktuator (ESP32)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-emerald-900 block">
                Pompa Sirkulasi 12V
              </span>
              <span className="text-emerald-700 text-[10px]">
                Kanal RELAY-01 &bull; GPIO 14 Active-LOW
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md font-semibold text-[9.5px] bg-emerald-100 text-emerald-800 shrink-0">
              Terpasang Fisik
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-amber-200/60 bg-amber-50/30 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-900 block">
                Aerator Oksigen Nila
              </span>
              <span className="text-amber-700 text-[10px]">
                Hardware modul relay belum dipasang
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md font-medium text-[9.5px] bg-amber-100 text-amber-800 shrink-0">
              Tahap Pengembangan
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-amber-200/60 bg-amber-50/30 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-900 block">
                Grow Light Fotosintesis
              </span>
              <span className="text-amber-700 text-[10px]">
                Hardware modul driver LED belum dipasang
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md font-medium text-[9.5px] bg-amber-100 text-amber-800 shrink-0">
              Tahap Pengembangan
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-amber-200/60 bg-amber-50/30 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-amber-900 block">
                Auto-Feeder &amp; Dosing
              </span>
              <span className="text-amber-700 text-[10px]">
                Hardware servo &amp; pompa peristaltik belum ada
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md font-medium text-[9.5px] bg-amber-100 text-amber-800 shrink-0">
              Tahap Pengembangan
            </span>
          </div>
        </div>

        <p className="text-[10.5px] text-[#6B7280] leading-relaxed pt-1">
          <strong>Catatan Dinamis:</strong> Saklar aktuator yang berada dalam
          tahap pengembangan tetap dapat dinyalakan untuk menguji komunikasi ke
          alat. Alat ESP32 akan merespons penolakan hardware, dan saklar
          otomatis kembali ke posisi <strong>OFF</strong> disertai notifikasi
          penjelasan.
        </p>
      </div>
    </div>
  );
}

