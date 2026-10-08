"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Droplets, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { AlertNotification } from "@/lib/types";

interface AlertItemCardProps {
  alert: AlertNotification;
  isArchive?: boolean;
}

export function AlertItemCard({ alert, isArchive = false }: AlertItemCardProps) {
  const getSeverityStyle = () => {
    if (alert.severity === "critical") {
      return {
        bgIcon: "bg-[#FFE4E6] text-[#E11D48]",
        icon: <AlertTriangle className="h-4 w-4" />,
        badgeBg: "bg-[#FFE4E6] text-[#E11D48]",
        label: "Kritis",
      };
    }
    if (alert.severity === "warning") {
      return {
        bgIcon: "bg-[#FEF3C7] text-[#D97706]",
        icon: <AlertTriangle className="h-4 w-4" />,
        badgeBg: "bg-[#FEF3C7] text-[#B45309]",
        label: "Peringatan",
      };
    }
    return {
      bgIcon: "bg-[#DCFCE7] text-[#166534]",
      icon: <CheckCircle2 className="h-4 w-4" />,
      badgeBg: "bg-[#DCFCE7] text-[#166534]",
      label: "Optimal",
    };
  };

  const style = getSeverityStyle();

  return (
    <div
      className={`rounded-[22px] bg-white border border-[#E5E7EB] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#D1D5DB] transition-all ${
        isArchive ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${style.bgIcon}`}
        >
          {style.icon}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-sm text-[#111827]">{alert.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${style.badgeBg}`}
            >
              {style.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#9CA3AF]">
              <Clock className="h-3 w-3" />
              {alert.time} WIB
            </span>
          </div>
          <p className="text-xs text-[#4B5563] leading-relaxed max-w-2xl">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span className="px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[10px] font-mono text-[#6B7280]">
          {alert.isResolved ? "Otomasi Selesai" : "Menunggu Aksi"}
        </span>
        <Link
          href="/controls"
          className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition-colors shadow-2xs"
          title="Periksa Kontrol Relay"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
