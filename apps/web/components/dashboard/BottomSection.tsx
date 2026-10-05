"use client";

import React, { useState } from "react";
import { ChevronDown, Send, Check, Clock, Calendar, Users, Cpu, ShieldCheck } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function BottomSection() {
  const { dispenseFeed, feedActive } = useTelemetry();
  const [openAccordion, setOpenAccordion] = useState<string>("bio");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? "" : id);
  };

  const scheduleDays = [
    { day: "Mon", date: "22" },
    { day: "Tue", date: "23" },
    { day: "Wed", date: "24", isToday: true },
    { day: "Thu", date: "25" },
    { day: "Fri", date: "26" },
    { day: "Sat", date: "27" },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      {/* Left Column (LG: 5 COLS) — Information Accordion */}
      <div className="lg:col-span-5 space-y-2.5">
        {/* Item 1 */}
        <div className="rounded-[22px] bg-white border border-[var(--border-light)] overflow-hidden shadow-xs">
          <button
            onClick={() => toggleAccordion("bio")}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-stone-50 transition-colors"
          >
            <span>Spesifikasi Pasangan Biologis (ECAD)</span>
            <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${openAccordion === "bio" ? "rotate-180" : ""}`} />
          </button>
          {openAccordion === "bio" && (
            <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-light)] pt-3">
              Pasangan Ilmiah: <strong>Nila + Pakcoy</strong> di Level 3 & 4 (permintaan DO tinggi & akar renggang); <strong>Lele + Kangkung</strong> di Level 1 & 2 (biofilter akar masif & organ arboresen tahan DO rendah).
            </div>
          )}
        </div>

        {/* Item 2 */}
        <div className="rounded-[22px] bg-white border border-[var(--border-light)] overflow-hidden shadow-xs">
          <button
            onClick={() => toggleAccordion("iot")}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[var(--accent-cyan)]" />
              <span>Perangkat Gateway IoT (ESP32 DevKit V1)</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${openAccordion === "iot" ? "rotate-180" : ""}`} />
          </button>
          {openAccordion === "iot" && (
            <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-light)] pt-3">
              Dual Power 12V + Baterai 7Ah cadangan. Pembacaan ADC1 terisolasi untuk 6 sensor: pH (PH-4502C), TDS, DS18B20 suhu air, DHT22, LDR, dan Water Level.
            </div>
          )}
        </div>

        {/* Item 3 */}
        <div className="rounded-[22px] bg-white border border-[var(--border-light)] overflow-hidden shadow-xs">
          <button
            onClick={() => toggleAccordion("harvest")}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-emerald)]" />
              <span>Estimasi Panen & Ketahanan Pangan</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${openAccordion === "harvest" ? "rotate-180" : ""}`} />
          </button>
          {openAccordion === "harvest" && (
            <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-light)] pt-3">
              Kangkung: Siap petik dalam <strong>4 hari</strong>. Pakcoy: Siap petik dalam <strong>7 hari</strong>. Nila & Lele: Siklus pembesaran teratur mendukung kebutuhan protein keluarga mandiri.
            </div>
          )}
        </div>

        {/* Quick Feed Button (Orange Pill from Prototype) */}
        <div className="pt-2">
          <button
            onClick={dispenseFeed}
            style={{
              backgroundColor: feedActive ? "var(--accent-emerald)" : "var(--accent-coral)",
            }}
            className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            {feedActive ? <Check className="h-4 w-4 stroke-[3]" /> : <Send className="h-4 w-4" />}
            <span>{feedActive ? "35g Pakan Telah Didistribusikan!" : "Beri Pakan Ikan Sekarang"}</span>
          </button>
        </div>
      </div>

      {/* Right Column (LG: 7 COLS) — Timeline Schedule (Matching Crextio September 2024 calendar) */}
      <div className="lg:col-span-7 rounded-[28px] bg-white border border-[var(--border-light)] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Jadwal Perawatan & Otomasi Harian
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Oktober 2026 • Minggu 41
          </span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-6 text-center py-3 border-b border-[var(--border-light)]">
          {scheduleDays.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[11px] text-[var(--text-muted)]">{item.day}</span>
              <span
                className={`text-sm font-medium mt-0.5 num-tabular h-7 w-7 rounded-full flex items-center justify-center ${
                  item.isToday ? "bg-[var(--bg-charcoal)] text-white font-bold" : "text-[var(--text-primary)]"
                }`}
              >
                {item.date}
              </span>
            </div>
          ))}
        </div>

        {/* Hourly Scheduled Tasks (Matching Crextio Weekly Team Sync card) */}
        <div className="space-y-3 pt-3">
          {/* Slot 08:00 */}
          <div className="flex items-start gap-4 text-xs">
            <span className="text-[11px] font-mono text-[var(--text-muted)] w-14 shrink-0 pt-1">
              08:00 WIB
            </span>
            <div className="flex-1 rounded-2xl bg-[var(--bg-charcoal)] text-white p-3.5 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Pembersihan Biofilter & Sump L1</div>
                <div className="text-[10px] text-white/60 mt-0.5">Pembersihan sedimen kotoran padat ikan</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono text-[var(--accent-yellow)]">
                Terjadwal Rutin
              </div>
            </div>
          </div>

          {/* Slot 12:30 */}
          <div className="flex items-start gap-4 text-xs">
            <span className="text-[11px] font-mono text-[var(--text-muted)] w-14 shrink-0 pt-1">
              12:30 WIB
            </span>
            <div className="flex-1 rounded-2xl bg-stone-100 p-3.5 border border-stone-200/80 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)]">Dispensasi Pakan Siang</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">35 gram pelet apung bernutrisi tinggi</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[10px] font-mono text-[var(--text-primary)] border border-stone-200">
                Feeder Otomatis
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
