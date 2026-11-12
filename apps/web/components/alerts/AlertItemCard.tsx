"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
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
      bgIcon: "bg-[#DCFCE7] text-[#165B39]",
      icon: <CheckCircle2 className="h-4 w-4" />,
      badgeBg: "bg-[#DCFCE7] text-[#166534]",
      label: "Info",
    };
  };

  const style = getSeverityStyle();

  return (
    <div className="px-5 py-3.5 hover:bg-[#F9FAFB]/70 transition-colors flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${style.bgIcon}`}
        >
          {style.icon}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-xs sm:text-[13px] text-[#111827] leading-snug">
              {alert.title}
            </h4>
            {!isArchive && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badgeBg}`}
              >
                {style.label}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
        <span className="text-[11px] text-[#9CA3AF] num-tabular whitespace-nowrap">
          {alert.time} WIB
        </span>
        {!alert.isResolved && (
          <Link
            href="/controls"
            className="text-[11px] font-semibold text-[#165B39] hover:underline whitespace-nowrap"
          >
            Periksa &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
