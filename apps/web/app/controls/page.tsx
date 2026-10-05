"use client";

import React from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { ControlsHeader } from "@/components/controls/ControlsHeader";
import { RelaySwitchCard } from "@/components/controls/RelaySwitchCard";
import { QuickFeedBanner } from "@/components/controls/QuickFeedBanner";
import { AnomalySimulationSuite } from "@/components/controls/AnomalySimulationSuite";

export default function ControlsPage() {
  const { actuators, toggleActuator, dispenseFeed, feedActive, setAnomaly, anomalyMode } = useTelemetry();

  const totalLoad = Object.values(actuators).reduce((acc, a) => acc + (a.isOn ? a.powerWatts : 0), 0);

  return (
    <div className="space-y-6">
      <ControlsHeader totalLoadWatts={totalLoad} />

      {/* 4 Hardware Relay Switches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(actuators).map((act) => (
          <RelaySwitchCard key={act.id} actuator={act} onToggle={toggleActuator} />
        ))}
      </div>

      {/* Manual Immediate Action Banner */}
      <QuickFeedBanner onDispense={dispenseFeed} feedActive={feedActive} />

      {/* Environmental Anomaly Simulation Suite */}
      <AnomalySimulationSuite anomalyMode={anomalyMode} onSetAnomaly={setAnomaly} />
    </div>
  );
}
