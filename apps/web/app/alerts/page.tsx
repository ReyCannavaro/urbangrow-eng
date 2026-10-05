"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AlertsHeader } from "@/components/alerts/AlertsHeader";
import { AlertGroupSection } from "@/components/alerts/AlertGroupSection";
import { AlertNotification } from "@/lib/types";

const YESTERDAY_ALERTS: AlertNotification[] = [
  {
    id: "hist-1",
    title: "Suhu Air Naik Terdeteksi",
    message: "Suhu air mencapai 28.5°C akibat cuaca panas sore. Aerator diaktifkan otomatis untuk mitigasi suplai DO.",
    time: "18:45",
    severity: "warning",
    isResolved: true,
  },
  {
    id: "hist-2",
    title: "Dispensasi Pakan Sore Berhasil",
    message: "Pakan ikan terjadwal 35g berhasil didistribusikan ke tandon Level 3 & Level 1.",
    time: "16:30",
    severity: "info",
    isResolved: true,
  },
];

export default function AlertsPage() {
  const { alerts } = useTelemetry();
  const [activeAlerts, setActiveAlerts] = useState(alerts);

  const clearAll = () => {
    setActiveAlerts([]);
  };

  return (
    <div className="space-y-6">
      <AlertsHeader onClearAll={clearAll} />

      <div className="max-w-3xl mx-auto space-y-6 py-2">
        {/* Group 1: Hari Ini */}
        <AlertGroupSection title="Hari Ini" alerts={activeAlerts} />

        {/* Group 2: Kemarin */}
        <AlertGroupSection title="Kemarin" alerts={YESTERDAY_ALERTS} isArchive={true} />
      </div>
    </div>
  );
}
