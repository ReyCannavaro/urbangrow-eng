"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname === "/agribot";

  return (
    <div className="app-shell bg-[#F0F2F5]">
      <div className="max-w-[1460px] mx-auto flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
        {/* 1. Locked Non-Scrollable Sticky Left Sidebar */}
        <AppSidebar />

        {/* 2. Main Content Column */}
        <div
          className={`flex-1 w-full min-w-0 flex flex-col ${
            isChatPage ? "lg:h-[calc(100dvh-(var(--shell-pad-y)*2))] lg:overflow-hidden" : ""
          }`}
        >
          {/* Floating Separate Top Navbar Card (Distinct rounded rectangle with radius) */}
          <TopNavbar compact={isChatPage} />

          {/* Main Route Content */}
          <main className={isChatPage ? "flex-1 min-h-0 flex flex-col" : "space-y-6"}>
            {children}
          </main>

          {/* Clean Editorial Footer (hidden on full-height pure chat workspace /agribot) */}
          {!isChatPage && (
            <footer className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#9CA3AF] font-mono">
              <div>REGU MAWAR // SMK TELKOM SIDOARJO • ECAD SYSTEM</div>
              <div className="flex items-center gap-3">
                <span>SISTEM AKUAPONIK HIDROPONIK 4-BARIS & KOLAM BERSEKAT</span>
                <span>•</span>
                <span className="text-[#165B39] font-bold">ECAD v2.0 ACTIVE</span>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
