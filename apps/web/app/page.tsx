"use client";

import React from "react";
import { HeroWelcome } from "@/components/dashboard/HeroWelcome";
import { EcosystemHeroCard } from "@/components/dashboard/EcosystemHeroCard";
import { ParameterLollipopChart } from "@/components/dashboard/ParameterLollipopChart";
import { DialGaugeCard } from "@/components/dashboard/DialGaugeCard";
import { DarkTaskPanel } from "@/components/dashboard/DarkTaskPanel";
import { BottomSection } from "@/components/dashboard/BottomSection";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting & Multi-Segment Progress */}
      <HeroWelcome />

      {/* 2. Bento Card Grid (4 Harmonious Columns matching Crextio reference) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <EcosystemHeroCard />
        <ParameterLollipopChart />
        <DialGaugeCard />
        <DarkTaskPanel />
      </section>

      {/* 3. Bottom Section: Accordion Information & Timeline Calendar */}
      <BottomSection />
    </div>
  );
}
