"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
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

      {/* Floating Actuator & Hardware Notification Toast (Refined Studio Toast) */}
      {actuatorToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-auto sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex items-start gap-3.5">
              {/* Refined Icon Surface */}
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                  actuatorToast.type === "success"
                    ? "bg-[#EDF3EC] border-[#165B39]/15 text-[#165B39]"
                    : actuatorToast.type === "error"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : actuatorToast.type === "warning"
                    ? "bg-amber-50/80 border-amber-200 text-amber-800"
                    : "bg-sky-50 border-sky-200 text-sky-700"
                }`}
              >
                {actuatorToast.type === "success" ? (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                ) : actuatorToast.type === "error" ? (
                  <AlertOctagon className="h-4.5 w-4.5" />
                ) : actuatorToast.type === "warning" ? (
                  <AlertTriangle className="h-4.5 w-4.5" />
                ) : (
                  <Info className="h-4.5 w-4.5" />
                )}
              </div>

              {/* Text Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#111827] leading-tight">
                    {actuatorToast.title ||
                      (actuatorToast.type === "success"
                        ? "Perintah Berhasil Dikirim"
                        : actuatorToast.type === "error"
                        ? "Proteksi Hardware / Error"
                        : actuatorToast.type === "warning"
                        ? "Status Perangkat Keras"
                        : "Informasi Sistem")}
                  </h4>
                  <span
                    className={`font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      actuatorToast.type === "success"
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : actuatorToast.type === "error"
                        ? "bg-rose-100 text-rose-800"
                        : actuatorToast.type === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    {actuatorToast.type === "success"
                      ? "TERKIRIM"
                      : actuatorToast.type === "error"
                      ? "DITAHAN"
                      : actuatorToast.type === "warning"
                      ? "SIMULASI"
                      : "INFO"}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#4B5563] leading-relaxed mt-1 font-normal">
                  {actuatorToast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={clearActuatorToast}
                className="h-6 w-6 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                aria-label="Tutup notifikasi"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Subtle Progress Bar (Auto-Dismiss Indicator) */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gray-100 overflow-hidden">
              <div
                className={`h-full animate-toast-shrink ${
                  actuatorToast.type === "success"
                    ? "bg-[#165B39]"
                    : actuatorToast.type === "error"
                    ? "bg-rose-500"
                    : actuatorToast.type === "warning"
                    ? "bg-amber-500"
                    : "bg-sky-500"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
