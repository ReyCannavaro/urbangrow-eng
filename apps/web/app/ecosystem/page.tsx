"use client";

import React from "react";
import { EcosystemHeader } from "@/components/ecosystem/EcosystemHeader";
import { PhysicalSystemOverview } from "@/components/ecosystem/PhysicalSystemOverview";

export default function EcosystemPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header with Live Flow Metrics */}
      <EcosystemHeader />

      {/* 2. Interactive Hardware Twin Schematic (4-Row Hydroponics + 2-Partition Fish Tank) */}
      <PhysicalSystemOverview />
    </div>
  );
}
