"use client";

import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  Bell,
  CheckCircle2,
  Cpu,
} from "lucide-react";

interface AlertsBentoRowProps {
  activeCount: number;
  warningCount: number;
  resolvedCount: number;
  edgeOnline: boolean;
  liveSensorCount: number;
  edgeNode: string;
}

export function AlertsBentoRow({
  activeCount,
  warningCount,
  resolvedCount,
  edgeOnline,
  liveSensorCount,
  edgeNode,
}: AlertsBentoRowProps) {
  const integrityScore = !edgeOnline
    ? "--"
    : warningCount === 0
      ? "100"
      : String(Math.max(40, 100 - warningCount * 10));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD */}
      <div
        style={{ "--ug-delay": "60ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-[#165B39] hover:bg-[#145233] text-white p-5 shadow-xs flex flex-col justify-between h-[170px] relative overflow-hidden transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Integritas Keamanan Sistem
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39]"
            title="Sistem Keamanan ECAD"
          >
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white">
            {integrityScore}
            <span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>
              {!edgeOnline
                ? "Menunggu Koneksi ESP32"
                : warningCount === 0
                  ? "0 Anomali Kritis • Sensor Live"
                  : `${warningCount} Peringatan Anomali`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. LOG PERINGATAN TERCATAT */}
      <div
        style={{ "--ug-delay": "115ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Log Peringatan Aktif
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Bell className="h-4 w-4 text-[#D97706]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {activeCount}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Log</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#B45309]">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {warningCount > 0 ? `${warningCount} Anomali Tercatat` : "Sensor Telemetri & Relay"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TINGKAT RESOLUSI & AUDIT DATABASE */}
      <div
        style={{ "--ug-delay": "170ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Riwayat Audit &amp; Resolusi
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <CheckCircle2 className="h-4 w-4 text-[#165B39]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {resolvedCount}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Entri</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {resolvedCount > 0 ? "Tersimpan di Database SQLite" : "Belum ada riwayat aksi"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. NODE TELEMETRI HARDWARE */}
      <div
        style={{ "--ug-delay": "225ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] p-5 shadow-xs flex flex-col justify-between h-[170px] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Node Hardware ESP32
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Cpu className={`h-4 w-4 ${edgeOnline ? "text-[#165B39]" : "text-[#6B7280]"}`} />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827]">
            {edgeOnline ? liveSensorCount : 0} / 4
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Fisik</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
              edgeOnline && liveSensorCount === 4
                ? "bg-[#DCFCE7] text-[#166534]"
                : edgeOnline
                  ? "bg-[#FEF3C7] text-[#B45309]"
                  : "bg-[#F3F4F6] text-[#4B5563]"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {edgeOnline ? `${edgeNode} (${liveSensorCount}/4 Live)` : "Maaf, alat sedang offline"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
