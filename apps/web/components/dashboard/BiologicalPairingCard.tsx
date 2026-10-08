"use client";

import React from "react";
import Link from "next/link";
import { Sprout, Fish, Layers, Droplet } from "lucide-react";

export function BiologicalPairingCard() {
  const pairs = [
    {
      level: "B 1-2",
      name: "Sayuran Pakcoy",
      detail: "Baris Puncak Air • 120 Pods NFT",
      status: "Siap Panen",
      statusType: "completed",
      icon: Sprout,
      iconColor: "text-emerald-700 bg-emerald-50",
    },
    {
      level: "B 3-4",
      name: "Sayuran Kangkung",
      detail: "Baris Hilir Biofilter • 100 Pods",
      status: "Nitrifikasi",
      statusType: "progress",
      icon: Layers,
      iconColor: "text-amber-700 bg-amber-50",
    },
    {
      level: "Sekat 1",
      name: "Ikan Nila Merah",
      detail: "Kolam Atas Sekat • DO Tinggi (>5 mg/L)",
      status: "Aktif",
      statusType: "progress",
      icon: Fish,
      iconColor: "text-sky-700 bg-sky-50",
    },
    {
      level: "Sekat 2",
      name: "Ikan Lele & Sump",
      detail: "Kolam Bawah • Pompa Submersible 12V",
      status: "Sirkulasi",
      statusType: "completed",
      icon: Droplet,
      iconColor: "text-slate-700 bg-slate-100",
    },
  ];

  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[300px]">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
        <div>
          <span className="text-xs font-semibold text-[#111827]">
            Pasangan Biologis (ECAD)
          </span>
          <p className="text-[10px] text-[#9CA3AF]">
            Simbiosis 4-level tertutup zero chemical
          </p>
        </div>
        <Link
          href="/ecosystem"
          className="px-2.5 py-1 rounded-full border border-[#E5E7EB] text-[10px] font-bold text-[#111827] hover:bg-[#F8F9FA] transition-colors"
        >
          + Detail Menara
        </Link>
      </div>

      {/* 4 Items (Matching Donezo Team Collaboration) */}
      <div className="space-y-2 py-1">
        {pairs.map((item) => {
          const Icon = item.icon;
          const isCompleted = item.statusType === "completed";

          return (
            <div
              key={item.level}
              className="flex items-center justify-between py-1 px-1.5 rounded-xl hover:bg-[#F8F9FA] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.iconColor}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111827]">
                    <span className="font-mono text-[#165B39] font-bold mr-1">
                      {item.level}
                    </span>
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">{item.detail}</div>
                </div>
              </div>

              {/* Status Badge Tag (Matching Donezo Completed / In Progress tags) */}
              <span
                className={`px-2 py-0.5 rounded text-[9.5px] font-medium font-mono ${
                  isCompleted
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
