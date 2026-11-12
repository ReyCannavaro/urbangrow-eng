"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname === "/agribot";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { actuatorToast, clearActuatorToast } = useTelemetry();

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="app-shell bg-[#F0F2F5]">
      {/* 0. Mobile Off-Canvas Drawer (Slide over from left with 3-bar icon trigger) */}
      <MobileSidebarDrawer
        isOpen={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      <div className="max-w-[1460px] mx-auto flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
        {/* 1. Locked Non-Scrollable Sticky Left Sidebar (Hidden on Mobile screens, visible on lg+) */}
        <AppSidebar />

        {/* 2. Main Content Column */}
        <div
          className={`flex-1 w-full min-w-0 flex flex-col ${
            isChatPage ? "lg:h-[calc(100dvh-(var(--shell-pad-y)*2))] lg:overflow-hidden" : ""
          }`}
        >
          {/* Floating Separate Top Navbar Card with 3-Bar Hamburger for Mobile */}
          <TopNavbar
            compact={isChatPage}
            onOpenMobileMenu={handleOpenMobileMenu}
          />

          {/* Main Route Content */}
          <main className={isChatPage ? "flex-1 min-h-0 flex flex-col" : "space-y-6"}>
            {children}
          </main>

          {/* Clean Editorial Footer (hidden on full-height pure chat workspace /agribot) */}
          {!isChatPage && (
            <footer className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#9CA3AF] font-mono">
              <div>REGU MAWAR // SMK TELKOM SIDOARJO &bull; ECAD SYSTEM</div>
              <div className="flex items-center gap-3">
                <span>SISTEM AKUAPONIK HIDROPONIK 4-BARIS &amp; KOLAM BERSEKAT</span>
                <span>&bull;</span>
                <span className="text-[#165B39] font-bold">ECAD v2.0 ACTIVE</span>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Floating Actuator & Hardware Notification Toast */}
      {actuatorToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
              actuatorToast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/30"
                : actuatorToast.type === "error"
                ? "bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/30"
                : "bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-950/30"
            }`}
          >
            {actuatorToast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : actuatorToast.type === "error" ? (
              <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-relaxed">
                {actuatorToast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={clearActuatorToast}
              className="h-5 w-5 rounded-md flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0 ml-1"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
