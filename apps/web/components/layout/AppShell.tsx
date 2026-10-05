"use client";

import Image from "next/image";
import { NavigationHeader } from "./NavigationHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Outer Rounded Console Container (Matching Reference Frame) */}
      <div className="w-full max-w-[1480px] bg-[var(--bg-frame)] rounded-[32px] sm:rounded-[38px] border border-[var(--border-light)] p-5 sm:p-7 lg:p-10 shadow-2xl shadow-stone-900/5 relative overflow-hidden sunlit-radial-glow">
        <NavigationHeader />
        <main className="space-y-6">{children}</main>
        
        {/* Subtle Editorial Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border-light)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-mono">
          <div className="flex items-center gap-3">
            <Image
              src="/urbangrow-logo.png"
              alt="UrbanGrow"
              width={70}
              height={26}
              className="h-4 w-auto object-contain opacity-80"
            />
            <span className="hidden sm:inline-block h-3 w-px bg-stone-300" />
            <span>REGU MAWAR // SMK TELKOM SIDOARJO • ECAD SYSTEM</span>
          </div>
          <div className="flex items-center gap-3">
            <span>SISTEM AKUAPONIK BERTINGKAT 4-LEVEL</span>
            <span>•</span>
            <span className="text-[var(--accent-emerald)] font-semibold">ECAD v2.0 ACTIVE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
