"use client";

import React from "react";
import { Plus, Send } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { MetricCardsRow } from "@/components/dashboard/MetricCardsRow";
import { CycleAnalyticsCard } from "@/components/dashboard/CycleAnalyticsCard";
import { AutomationReminderCard } from "@/components/dashboard/AutomationReminderCard";
import { RelayActuatorsCard } from "@/components/dashboard/RelayActuatorsCard";
import { BiologicalPairingCard } from "@/components/dashboard/BiologicalPairingCard";
import { BiofilterDonutCard } from "@/components/dashboard/BiofilterDonutCard";
import { EdgeTimeTrackerCard } from "@/components/dashboard/EdgeTimeTrackerCard";

export default function DashboardPage() {
  const { dispenseFeed, feedActive } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action Controls (Matching Donezo Header) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Pantau telemetri biologis, kendalikan aktuator, dan optimasi siklus pangan cerdas.
          </p>
        </div>

        {/* Action Buttons (Matching + Add Project & Import Data) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={dispenseFeed}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#165B39] hover:bg-[#124B2E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Jadwal</span>
          </button>

          <button
            onClick={dispenseFeed}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] text-[#111827] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-[#165B39]" />
            <span>{feedActive ? "Pakan Terkirim!" : "Beri Pakan (35g)"}</span>
          </button>
        </div>
      </section>

      {/* 2. Row 1: 4 Metric Cards (Inverted Pine Hero Anchor + 3 White Metric Cards) */}
      <MetricCardsRow />

      {/* 3. Row 2: Analytics, Reminders & Actuator Controls (Matching Donezo Row 2) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CycleAnalyticsCard />
        <AutomationReminderCard />
        <RelayActuatorsCard />
      </section>

      {/* 4. Row 3: Biological Pairing, Biofilter Donut, and Edge Time Tracker (Matching Donezo Row 3) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <BiologicalPairingCard />
        <BiofilterDonutCard />
        <EdgeTimeTrackerCard />
      </section>
    </div>
  );
}
