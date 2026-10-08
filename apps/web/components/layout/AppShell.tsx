"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Outer Rounded Console Container (Matching Donezo Frame) */}
      <div className="w-full max-w-[1440px] bg-white rounded-[32px] sm:rounded-[36px] border border-[#E5E7EB] shadow-xl shadow-stone-900/5 flex flex-col md:flex-row overflow-hidden min-h-[900px]">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-5 sm:p-7 lg:p-8 bg-white overflow-y-auto">
          <TopNavbar />
          <main className="flex-1 pt-6">{children}</main>

          {/* Clean Editorial Footer */}
          <footer className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#9CA3AF] font-mono">
            <div>REGU MAWAR // SMK TELKOM SIDOARJO • ECAD SYSTEM</div>
            <div className="flex items-center gap-3">
              <span>SISTEM AKUAPONIK BERTINGKAT 4-LEVEL</span>
              <span>•</span>
              <span className="text-[#165B39] font-bold">ECAD v2.0 ACTIVE</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
