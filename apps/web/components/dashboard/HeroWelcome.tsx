"use client";

import React from "react";
import { Fish, Sprout, Layers, ArrowUpRight } from "lucide-react";

export function HeroWelcome() {
  return (
    <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
      {/* Left: Greeting & Multi-Segment Progress Bar */}
      <div className="space-y-3.5 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Welcome in, <span className="font-semibold">Urban Farm 01</span>
        </h1>

        {/* Multi-Segment Growth Stage Progress Bar (Matching Crextio reference) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-6 text-[11px] font-medium text-[var(--text-secondary)]">
            <span className="w-16">Pembibitan</span>
            <span className="w-20">Vegetatif</span>
            <span className="w-36">Pembesaran Biomassa</span>
            <span className="w-16">Siap Panen</span>
          </div>

          <div className="flex items-center gap-1.5 h-7">
            {/* Stage 1: Dark Charcoal Pill */}
            <div className="h-full w-16 bg-[var(--bg-charcoal)] text-white text-[11px] font-mono font-medium rounded-full flex items-center justify-center shadow-xs">
              15%
            </div>

            {/* Stage 2: Sunlit Butter Yellow Pill */}
            <div className="h-full w-20 bg-[var(--accent-yellow)] text-stone-900 text-[11px] font-mono font-semibold rounded-full flex items-center justify-center shadow-xs">
              25%
            </div>

            {/* Stage 3: Striped Diagonal Texture Bar */}
            <div className="h-full w-36 rounded-full border border-dashed border-stone-300 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_6px,transparent_6px,transparent_12px)] flex items-center justify-center text-[11px] font-mono text-[var(--text-secondary)]">
              50%
            </div>

            {/* Stage 4: Light Pill with Border */}
            <div className="h-full w-16 rounded-full border border-[var(--border-medium)] bg-white text-[11px] font-mono font-medium text-[var(--text-primary)] flex items-center justify-center">
              10%
            </div>
          </div>
        </div>
      </div>

      {/* Right: 3 Big Editorial Stat Counters (Matching Crextio 78 / 56 / 203) */}
      <div className="flex items-center gap-8 lg:gap-10 shrink-0">
        {/* Stat 1: Nila */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-200/60 flex items-center justify-center text-[var(--text-secondary)]">
            <Fish className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-light tracking-tight text-[var(--text-primary)] num-tabular">
              27
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">Ikan Nila (L3)</div>
          </div>
        </div>

        {/* Stat 2: Lele */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-stone-200/60 flex items-center justify-center text-[var(--text-secondary)]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-light tracking-tight text-[var(--text-primary)] num-tabular">
              27
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">Ikan Lele (L1)</div>
          </div>
        </div>

        {/* Stat 3: Total Tanaman */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[var(--accent-yellow-light)] flex items-center justify-center text-amber-800">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-light tracking-tight text-[var(--text-primary)] num-tabular">
              220
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">Tanaman Aktif</div>
          </div>
        </div>
      </div>
    </section>
  );
}
