"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] p-3 sm:p-5 lg:p-6">
      <div className="max-w-[1460px] mx-auto flex flex-col lg:flex-row gap-5 items-start">
        {/* 1. Locked Sticky Left Sidebar (Never scrolls away) */}
        <AppSidebar />

        {/* 2. Main Content Column */}
        <div className="flex-1 w-full min-w-0 flex flex-col">
          {/* Floating Separate Top Navbar Card (Distinct rounded rectangle with radius) */}
          <TopNavbar />

          {/* Main Route Content */}
          <main className="space-y-6">{children}</main>

          {/* Clean Editorial Footer */}
          <footer className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#9CA3AF] font-mono">
            <div>REGU MAWAR // SMK TELKOM SIDOARJO • ECAD SYSTEM</div>
            <div className="flex items-center gap-3">
              <span>SISTEM AKUAPONIK HIDROPONIK 4-BARIS & KOLAM BERSEKAT</span>
              <span>•</span>
              <span className="text-[#165B39] font-bold">ECAD v2.0 ACTIVE</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
