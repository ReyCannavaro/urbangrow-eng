"use client";

import React from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { ScientificInsightsGrid } from "@/components/analytics/ScientificInsightsGrid";

export default function AnalyticsPage() {
  const { history, sensors } = useTelemetry();

  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <TimeSeriesChart history={history} sensors={sensors} />
      <ScientificInsightsGrid />
    </div>
  );
}
