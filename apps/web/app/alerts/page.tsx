"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sliders, Bell } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AlertsHeader } from "@/components/alerts/AlertsHeader";
import { AlertsBentoRow } from "@/components/alerts/AlertsBentoRow";
import { AlertGroupSection } from "@/components/alerts/AlertGroupSection";
import { AlertNotification } from "@/lib/types";

const YESTERDAY_ALERTS: AlertNotification[] = [
  {
    id: "hist-1",
    title: "Fluktuasi Suhu Air Sore Terdeteksi",
    message: "Suhu air kolam mencapai 28.5°C akibat radiasi sinar matahari sore. Aerator Venturi terpicu otomatis untuk mitigasi suplai oksigen DO.",
    time: "18:45",
    severity: "warning",
    isResolved: true,
  },
  {
    id: "hist-2",
    title: "Dispensasi Pakan Pelet Sore Berhasil",
    message: "Pakan ikan terjadwal 35g berhasil didistribusikan ke kolam Level 3 & Level 1 melalui feeder otomatis.",
    time: "16:30",
    severity: "info",
    isResolved: true,
  },
];

type FilterType = "all" | "warning" | "optimal";

export default function AlertsPage() {
  const { alerts } = useTelemetry();
  const [activeAlerts, setActiveAlerts] = useState<AlertNotification[]>(alerts);
  const [filter, setFilter] = useState<FilterType>("all");

  const clearAll = () => {
    setActiveAlerts([]);
  };

  const filterAlerts = (list: AlertNotification[]) => {
    if (filter === "warning") return list.filter((a) => a.severity === "warning" || a.severity === "critical");
    if (filter === "optimal") return list.filter((a) => a.severity === "info");
    return list;
  };

  const todayFiltered = filterAlerts(activeAlerts);
  const yesterdayFiltered = filterAlerts(YESTERDAY_ALERTS);

  return (
    <div className="space-y-6">
      {/* 1. Alerts Header with Status Badges */}
      <AlertsHeader onClearAll={clearAll} activeCount={activeAlerts.length} />

      {/* 2. Donezo 4-Metric Bento Row */}
      <AlertsBentoRow activeCount={activeAlerts.length} />

      {/* 3. Filter Navigation Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full border border-[#E5E7EB] bg-white text-xs shadow-2xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
              filter === "all"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Semua Log ({activeAlerts.length + YESTERDAY_ALERTS.length})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
              filter === "warning"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Peringatan & Anomali (1)
          </button>
          <button
            onClick={() => setFilter("optimal")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
              filter === "optimal"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Sistem Normal & Optimal (4)
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#6B7280]">
          Auto-refresh telemetri aktif • Ingest 1500ms
        </span>
      </div>

      {/* 4. Grouped Alert Log List */}
      <div className="space-y-6">
        <AlertGroupSection title="Hari Ini" alerts={todayFiltered} />
        <AlertGroupSection title="Kemarin" alerts={yesterdayFiltered} isArchive={true} />
      </div>

      {/* 5. Bottom Wavy Ribbon Auto-Mitigation Banner */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4EAB7C] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#68C194] uppercase tracking-wider">
              Automated Failsafe & Relay Watchdog
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              ECAD Safety v2.4
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Protokol Otomasi Keamanan Mandiri Aktif
          </h3>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            Setiap deteksi deviasi parameter (misal suhu naik &gt; 28°C atau DO drop &lt; 5.0 mg/L) secara otomatis memicu aktuator terkait tanpa memerlukan intervensi manual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/controls"
            className="px-4 py-2 rounded-full bg-white text-[#165B39] hover:bg-[#F3F4F6] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Buka Kontrol Relay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
