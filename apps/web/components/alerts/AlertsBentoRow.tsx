"use client";

import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  Bell,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
} from "lucide-react";

interface AlertsBentoRowProps {
  activeCount: number;
}

export function AlertsBentoRow({ activeCount }: AlertsBentoRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. THE INVERTED HERO ANCHOR CARD (Donezo Signature #165B39) */}
      <div className="rounded-[24px] bg-[#165B39] text-white p-5 shadow-sm flex flex-col justify-between h-[170px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">
            Integritas Keamanan Sistem
          </span>
          <div
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#165B39] shadow-xs group-hover:scale-105 transition-transform"
            title="Sistem Keamanan ECAD"
          >
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-white transition-all duration-300">
            100<span className="text-xl font-normal text-white/80">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-white/90">
            <TrendingUp className="h-3 w-3 text-[#68C194]" />
            <span>0 Anomali Kritis • Buffer Aman</span>
          </div>
        </div>
      </div>

      {/* 2. LOG PERINGATAN TERCATAT */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Log Peringatan Aktif
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Bell className="h-4 w-4 text-[#D97706]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            {activeCount}
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Log</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-medium text-[#B45309]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Sensor Telemetri & Relay</span>
          </div>
        </div>
      </div>

      {/* 3. TINGKAT RESOLUSI OTOMATIS */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Mitigasi Otomasi Berhasil
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <CheckCircle2 className="h-4 w-4 text-[#165B39]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            100
            <span className="text-xl font-normal text-[#9CA3AF] ml-0.5">%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Aerator & Pompa Siaga Aktif</span>
          </div>
        </div>
      </div>

      {/* 4. NODE TELEMETRI HARDWARE */}
      <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">
            Node Hardware ESP32
          </span>
          <div className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563]">
            <Cpu className="h-4 w-4 text-[#0284C7]" />
          </div>
        </div>

        <div>
          <div className="text-4xl font-bold tracking-tight num-tabular text-[#111827] transition-all duration-300">
            8 / 8
            <span className="text-xl font-normal text-[#9CA3AF] ml-1">Kanal</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-medium text-[#166534]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Zero Packet Loss • Latensi 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
