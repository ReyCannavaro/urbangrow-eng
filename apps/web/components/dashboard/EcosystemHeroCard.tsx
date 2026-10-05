"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function EcosystemHeroCard() {
  return (
    <div className="relative rounded-[28px] overflow-hidden bg-white border border-[var(--border-light)] shadow-sm group h-[320px] flex flex-col justify-end p-5">
      {/* Background Architectural Photo */}
      <Image
        src="/aquaponic_hero.jpg"
        alt="UrbanGrow 4-Level Aquaponics"
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        priority
      />

      {/* Subtle Dark Gradient Overlay at the bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-medium text-stone-800 shadow-sm">
          Closed-Loop Resirkulasi
        </span>
      </div>

      {/* Top Right Action Circle */}
      <Link
        href="/ecosystem"
        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-800 shadow-sm hover:bg-white hover:scale-105 transition-all"
        title="Lihat Detail Ekosistem 4-Tingkat"
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>

      {/* Bottom Content Metadata (Matching Lora Piterson / $1200 style) */}
      <div className="relative z-10 flex items-end justify-between text-white">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">
            Ekosistem 4-Tingkat
          </h3>
          <p className="text-xs text-white/80 font-normal mt-0.5">
            Pakcoy • Nila • Kangkung • Lele
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-mono font-medium text-white shadow-sm">
          96.2% Skor ECAD
        </div>
      </div>
    </div>
  );
}
