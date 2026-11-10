"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { fetchAgriBotDiagnostics } from "@/lib/aiApi";
import { EcosystemDiagnosticReport } from "@/lib/types";
import { AgriBotHeader } from "@/components/agribot/AgriBotHeader";
import { AgriBotBentoRow } from "@/components/agribot/AgriBotBentoRow";
import { ChatWindow } from "@/components/agribot/ChatWindow";
import { HarvestProjectionsSidebar } from "@/components/agribot/HarvestProjectionsSidebar";

export default function AgriBotPage() {
  const { sensors } = useTelemetry();
  const [cropDayPakcoy, setCropDayPakcoy] = useState<number>(14);
  const [cropDayKangkung, setCropDayKangkung] = useState<number>(17);
  const [diagnostics, setDiagnostics] = useState<EcosystemDiagnosticReport | null>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState<boolean>(true);
  const [activeAiInfo, setActiveAiInfo] = useState<{
    provider: string;
    model: string;
    latencyMs?: number;
  }>({
    provider: "gemini",
    model: "gemini-3.5-flash-lite",
  });

  const refreshDiagnostics = useCallback(async () => {
    setLoadingDiagnostics(true);
    const report = await fetchAgriBotDiagnostics(cropDayPakcoy, cropDayKangkung);
    if (report) {
      setDiagnostics(report);
    }
    setLoadingDiagnostics(false);
  }, [cropDayPakcoy, cropDayKangkung]);

  useEffect(() => {
    let cancelled = false;
    async function pollDiagnostics() {
      const report = await fetchAgriBotDiagnostics(cropDayPakcoy, cropDayKangkung);
      if (cancelled) return;
      if (report) {
        setDiagnostics(report);
      }
      setLoadingDiagnostics(false);
    }

    void pollDiagnostics();
    const interval = setInterval(() => {
      void pollDiagnostics();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [cropDayPakcoy, cropDayKangkung]);

  const handleCropDayChange = (crop: "pakcoy" | "kangkung", nextDay: number) => {
    const clamped = Math.max(1, Math.min(45, nextDay));
    if (crop === "pakcoy") {
      setCropDayPakcoy(clamped);
    } else {
      setCropDayKangkung(clamped);
    }
  };

  const handleChatDiagnosticsUpdate = useCallback(
    (
      report: EcosystemDiagnosticReport,
      meta: { provider: string; model: string; latencyMs: number }
    ) => {
      setDiagnostics(report);
      setActiveAiInfo(meta);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* 1. Header with Gemini & IoT Status Badges */}
      <AgriBotHeader
        activeAiInfo={activeAiInfo}
        diagnostics={diagnostics}
        loadingDiagnostics={loadingDiagnostics}
        onRefreshDiagnostics={refreshDiagnostics}
      />

      {/* 2. 4-Metric Bento Row (3-Domain Health, Water & LDR, Nearest Harvest, Early Symptoms) */}
      <AgriBotBentoRow diagnostics={diagnostics} />

      {/* 3. Main Workspace: Gemini Chat Copilot (8 cols) + Live Diagnostics & Projections (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <ChatWindow
            sensors={sensors}
            cropDayPakcoy={cropDayPakcoy}
            cropDayKangkung={cropDayKangkung}
            onDiagnosticsUpdate={handleChatDiagnosticsUpdate}
          />
        </div>

        <div className="lg:col-span-4">
          <HarvestProjectionsSidebar
            diagnostics={diagnostics}
            cropDayPakcoy={cropDayPakcoy}
            cropDayKangkung={cropDayKangkung}
            onChangeCropDay={handleCropDayChange}
          />
        </div>
      </div>

      {/* 4. Bottom Signature Wavy Ribbon Banner */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4EAB7C] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#68C194] uppercase tracking-wider">
              ECAD Biological Intelligence • Gemini Live Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              Inferensi Real-Time
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Diagnosis Tumbuhan, Air, Ikan & Prediksi Gejala Akuaponik Presisi
          </h3>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            AgriBot mengkorelasikan pembacaan multi-sensor ESP32 secara real-time untuk mendeteksi stres biologis lebih awal dan memproyeksikan hari panen GDD.
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
