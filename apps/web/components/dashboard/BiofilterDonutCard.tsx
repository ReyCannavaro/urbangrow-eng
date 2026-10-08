"use client";

import React from "react";

export function BiofilterDonutCard() {
  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between h-[300px]">
      <div>
        <span className="text-xs font-semibold text-[#111827]">
          Efisiensi Siklus Nitrifikasi
        </span>
        <p className="text-[10px] text-[#9CA3AF]">
          Perombakan limbah amonia menjadi nutrisi tanaman
        </p>
      </div>

      {/* Semicircular Donut Gauge (Matching Donezo 41% Project Progress) */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <svg viewBox="0 0 160 90" className="w-48 overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 20 85 A 60 60 0 0 1 140 85"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Segment 3: Hatched Residu (ends at 140) */}
          <path
            d="M 115 42 A 60 60 0 0 1 140 85"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="16"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Segment 2: Sage Mint In-Progress Nitrifikasi */}
          <path
            d="M 80 25 A 60 60 0 0 1 120 48"
            fill="none"
            stroke="#4EAB7C"
            strokeWidth="16"
          />

          {/* Segment 1: Deep Forest Pine Nitrat Diserap (starts at 20) */}
          <path
            d="M 20 85 A 60 60 0 0 1 82 25"
            fill="none"
            stroke="#165B39"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Readout (Matching 41% Project Ended in Donezo) */}
        <div className="absolute bottom-2 flex flex-col items-center text-center">
          <span className="text-3xl font-bold tracking-tight text-[#111827] num-tabular">
            96.4<span className="text-lg font-normal text-[#9CA3AF]">%</span>
          </span>
          <span className="text-[10px] font-medium text-[#9CA3AF]">
            Amonia Terurai
          </span>
        </div>
      </div>

      {/* Legend below (Matching Donezo Completed • In Progress • Pending) */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#E5E7EB] text-[10px] text-[#4B5563]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#165B39]" />
          <span>Nitrat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4EAB7C]" />
          <span>Nitrifikasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-hatched-diagonal border border-[#9CA3AF]" />
          <span>Residu</span>
        </div>
      </div>
    </div>
  );
}
