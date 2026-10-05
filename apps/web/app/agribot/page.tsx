"use client";

import React from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AgriBotHeader } from "@/components/agribot/AgriBotHeader";
import { ChatWindow } from "@/components/agribot/ChatWindow";
import { HarvestProjectionsSidebar } from "@/components/agribot/HarvestProjectionsSidebar";

export default function AgriBotPage() {
  const { sensors } = useTelemetry();

  return (
    <div className="space-y-6">
      <AgriBotHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Area (LG: 8 COLS) */}
        <div className="lg:col-span-8">
          <ChatWindow sensors={sensors} />
        </div>

        {/* Harvest Schedule Sidebar (LG: 4 COLS) */}
        <div className="lg:col-span-4">
          <HarvestProjectionsSidebar />
        </div>
      </div>
    </div>
  );
}
