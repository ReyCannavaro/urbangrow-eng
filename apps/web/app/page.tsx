"use client";

import React, { useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { MetricCardsRow } from "@/components/dashboard/MetricCardsRow";
import { CycleAnalyticsCard } from "@/components/dashboard/CycleAnalyticsCard";
import { AutomationReminderCard } from "@/components/dashboard/AutomationReminderCard";
import { AutomationScheduleModal } from "@/components/dashboard/AutomationScheduleModal";
import { RelayActuatorsCard } from "@/components/dashboard/RelayActuatorsCard";
import { BiologicalPairingCard } from "@/components/dashboard/BiologicalPairingCard";
import { BiofilterDonutCard } from "@/components/dashboard/BiofilterDonutCard";
import { EdgeTimeTrackerCard } from "@/components/dashboard/EdgeTimeTrackerCard";
import { AnomalyAlertBanner } from "@/components/ai/AnomalyAlertBanner";
import { fetchAnomalyInference, AnomalyPrediction } from "@/lib/aiApi";
import { fetchAutomationSchedules } from "@/lib/operationsApi";
import { AutomationSchedule } from "@/lib/types";
import { RevealOnView } from "@/components/motion/RevealOnView";

export default function DashboardPage() {
  const { dispenseFeed, feedActive } = useTelemetry();
  const [anomaly, setAnomaly] = useState<AnomalyPrediction | null>(null);
  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAnomalyInference().then((res) => {
      if (!cancelled) setAnomaly(res);
    });
    void fetchAutomationSchedules().then((items) => {
      if (!cancelled) setSchedules(items);
    });

    const timer = setInterval(() => {
      void fetchAnomalyInference().then((res) => {
        if (!cancelled) setAnomaly(res);
      });
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action Controls */}
      <section
        style={{ "--ug-delay": "0ms" } as React.CSSProperties}
        className="ug-enter flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Pantau telemetri biologis, kendalikan aktuator, dan optimasi siklus pangan cerdas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#165B39] hover:bg-[#124B2E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Jadwal</span>
          </button>

          <button
            type="button"
            onClick={dispenseFeed}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] text-[#111827] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-[#165B39]" />
            <span>{feedActive ? "Pakan Terkirim!" : "Beri Pakan (35g)"}</span>
          </button>
        </div>
      </section>

      {/* Real-time AI Anomaly Alert Banner */}
      <div style={{ "--ug-delay": "45ms" } as React.CSSProperties} className="ug-enter">
        <AnomalyAlertBanner anomaly={anomaly} />
      </div>

      {/* 2. Row 1: Metric Cards */}
      <MetricCardsRow />

      {/* 3. Row 2: Analytics, Reminders & Actuator Controls (Scroll-Revealed) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RevealOnView delayMs={0}>
          <CycleAnalyticsCard />
        </RevealOnView>
        <RevealOnView delayMs={80}>
          <AutomationReminderCard
            schedules={schedules}
            onManageSchedules={() => setScheduleModalOpen(true)}
          />
        </RevealOnView>
        <RevealOnView delayMs={160} className="md:col-span-2 lg:col-span-1">
          <RelayActuatorsCard />
        </RevealOnView>
      </section>

      {/* 4. Row 3: Biological Pairing, Biofilter Donut, and Edge Time Tracker (Scroll-Revealed) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RevealOnView delayMs={0}>
          <BiologicalPairingCard />
        </RevealOnView>
        <RevealOnView delayMs={80}>
          <BiofilterDonutCard />
        </RevealOnView>
        <RevealOnView delayMs={160} className="md:col-span-2 lg:col-span-1">
          <EdgeTimeTrackerCard />
        </RevealOnView>
      </section>

      {/* Persistent SQLite Automation Schedule Modal */}
      <AutomationScheduleModal
        isOpen={scheduleModalOpen}
        schedules={schedules}
        onSchedulesChange={setSchedules}
        onClose={() => setScheduleModalOpen(false)}
      />
    </div>
  );
}
