"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Cpu, Sparkles } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AgriBotHeader } from "@/components/agribot/AgriBotHeader";
import { AgriBotBentoRow } from "@/components/agribot/AgriBotBentoRow";
import { ChatWindow } from "@/components/agribot/ChatWindow";
import { HarvestProjectionsSidebar } from "@/components/agribot/HarvestProjectionsSidebar";

export default function AgriBotPage() {
  const { sensors } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* 1. Header with ML Status Badges */}
      <AgriBotHeader />

      {/* 2. Donezo 4-Metric Bento Row (Pine Inverted Hero + 3 White Bento Cards) */}
      <AgriBotBentoRow />

      {/* 3. Main Workspace: Chat Copilot (8 cols) + Harvest Predictions (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChatWindow sensors={sensors} />
        </div>

        <div className="lg:col-span-4">
          <HarvestProjectionsSidebar />
        </div>
      </div>

      {/* 4. Bottom Signature Wavy Ribbon Banner */}
      <div className="rounded-[24px] bg-wavy-ribbon text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4EAB7C] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#68C194] uppercase tracking-wider">
              ECAD Biological Twin • Autonomous Decision Loop
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              Inferensi Real-Time
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Sistem Pendukung Keputusan Berbasis Sains Akuaponik Presisi
          </h3>
          <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
            AgriBot mengkorelasikan fluktuasi sensor fisiko-kimia dengan kebutuhan nutrisi Pakcoy, Kangkung, dan Ikan Nila untuk mencegah stres biologis sebelum gejala fisik muncul.
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
