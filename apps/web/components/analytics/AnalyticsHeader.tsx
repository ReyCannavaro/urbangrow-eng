"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, Activity, Database } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";

export function AnalyticsHeader() {
  const { history } = useTelemetry();

  const handleExportCSV = () => {
    if (!history || history.length === 0) {
      alert("Belum ada data historis yang tersedia untuk diexport.");
      return;
    }

    const headers = [
      "Timestamp",
      "pH_Air",
      "Suhu_Air_Celsius",
      "TDS_Nutrisi_PPM",
      "Dissolved_Oxygen_mgL",
      "Suhu_Udara_Celsius",
      "Kelembaban_Persen",
      "Intensitas_Cahaya_Lux",
      "Level_Air_Persen",
      "Pompa_Air",
      "Aerator",
      "Grow_Light",
    ];

    const rows = history.map((h) => [
      h.timestamp,
      h.sensors.ph.toFixed(2),
      h.sensors.waterTemperature.toFixed(2),
      Math.round(h.sensors.tds),
      h.sensors.dissolvedOxygen.toFixed(2),
      h.sensors.airTemperature.toFixed(1),
      h.sensors.humidity.toFixed(1),
      Math.round(h.sensors.lightIntensity),
      h.sensors.waterLevel.toFixed(1),
      h.actuators?.waterPump ? "ON" : "OFF",
      h.actuators?.aerator ? "ON" : "OFF",
      h.actuators?.growLight ? "ON" : "OFF",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `UrbanGrow_Telemetry_Timeseries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#111827] transition-colors shadow-2xs"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
                Historical Analytics & Deret Waktu
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[10px] font-mono font-bold text-[#166534]">
                Sliding Buffer • 60 Titik
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              Analisis korelasi multi-metrik deret waktu time-series untuk evaluasi stabilitas ekosistem pangan dan efisiensi biofilter.
            </p>
          </div>
        </div>
      </div>

      {/* Right Badges & CSV Export Action */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#166534]/20 text-[11px] font-mono font-semibold text-[#166534] shadow-2xs">
          <Activity className="h-3.5 w-3.5 text-[#166534]" />
          <span>Interval 1.5s • Sliding Window</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-mono text-[#111827] shadow-2xs">
          <Database className="h-3.5 w-3.5 text-[#0284C7]" />
          <span>Sampel: <strong>{history.length} Data</strong></span>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full bg-[#165B39] hover:bg-[#0F3F27] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          title="Unduh Data Telemetri CSV"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Data CSV</span>
        </button>
      </div>
    </div>
  );
}
