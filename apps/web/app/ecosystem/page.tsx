"use client";

import React from "react";
import { useTelemetry } from "@/lib/telemetryContext";
import { EcosystemHeader } from "@/components/ecosystem/EcosystemHeader";
import { LevelSchematicCard } from "@/components/ecosystem/LevelSchematicCard";
import { GravityFlowDivider } from "@/components/ecosystem/GravityFlowDivider";
import { ClosedLoopReturnBar } from "@/components/ecosystem/ClosedLoopReturnBar";

export default function EcosystemPage() {
  const { sensors, actuators } = useTelemetry();

  return (
    <div className="space-y-6">
      <EcosystemHeader />

      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto py-2">
        {/* Level 4: Pakcoy */}
        <LevelSchematicCard
          levelNumber="L4"
          badgeBg="bg-emerald-100"
          badgeText="text-emerald-800"
          title="Level 4 (Puncak): Sayuran Pakcoy"
          latinName="Brassica rapa subsp. chinensis"
          description="Perakaran renggang (less dense) tidak menghambat laju sirkulasi air dan meloloskan kadar oksigen (DO) maksimal ke tandon di bawahnya."
          primaryMetric="DO Masuk: ~7.6 mg/L"
          primaryMetricColor="text-emerald-600"
          secondaryInfo="120 Pods • Umur 14 Hari"
        />

        <GravityFlowDivider
          label="Gravitasi Aliran Oksigen Terlarut Maksimal"
          accentColor="var(--accent-cyan)"
        />

        {/* Level 3: Ikan Nila */}
        <LevelSchematicCard
          levelNumber="L3"
          badgeBg="bg-sky-100"
          badgeText="text-sky-800"
          title="Level 3: Tandon Ikan Nila"
          latinName="Oreochromis niloticus"
          description="Ikan Nila mutlak membutuhkan kadar DO tinggi (>5.0 mg/L) agar tidak stres. Menerima air segar langsung sebelum menghasilkan amonia organik."
          primaryMetric={`DO Terbaca: ${sensors.dissolvedOxygen} mg/L`}
          primaryMetricColor="text-sky-600"
          secondaryInfo="27 Ekor • Aerator Aktif"
        />

        <GravityFlowDivider
          label="Limpahan Limbah Amonia Menuju Substrat Biofilter"
          accentColor="var(--accent-yellow-deep)"
        />

        {/* Level 2: Kangkung */}
        <LevelSchematicCard
          levelNumber="L2"
          badgeBg="bg-amber-100"
          badgeText="text-amber-800"
          title="Level 2: Biofilter Sayuran Kangkung"
          latinName="Ipomoea aquatica"
          description="Akar kangkung yang lebat menyerap nitrat hasil rombakan bakteri nitrifikasi, menjernihkan air sebelum diteruskan ke kolam lele."
          primaryMetric="Absorpsi Nitrat: 88.4%"
          primaryMetricColor="text-amber-700"
          secondaryInfo="100 Pods • Umur 17 Hari"
        />

        <GravityFlowDivider
          label="Muara Aliran Air dengan DO Terendah Menuju Sump"
          accentColor="var(--accent-cyan)"
        />

        {/* Level 1: Ikan Lele */}
        <LevelSchematicCard
          levelNumber="L1"
          badgeBg="bg-stone-200"
          badgeText="text-stone-800"
          title="Level 1 (Dasar): Tandon Sump Ikan Lele"
          latinName="Clarias sp."
          description="Lele memiliki organ arboresen pembantu pernapasan sehingga tetap tumbuh optimal pada air dengan kadar DO terendah. Muara pompa sirkulasi."
          primaryMetric={`Water Level: ${sensors.waterLevel}%`}
          primaryMetricColor="text-stone-700"
          secondaryInfo="27 Ekor • Pompa Sirkulasi 12V"
        />

        <ClosedLoopReturnBar isPumpOn={actuators.waterPump?.isOn ?? true} />
      </div>
    </div>
  );
}
