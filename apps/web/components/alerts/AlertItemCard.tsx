"use client";

import React from "react";
import { AlertTriangle, Droplets, Thermometer, Send } from "lucide-react";
import { AlertNotification } from "@/lib/types";

interface AlertItemCardProps {
  alert: AlertNotification;
  isArchive?: boolean;
}

export function AlertItemCard({ alert, isArchive = false }: AlertItemCardProps) {
  const renderIcon = () => {
    if (alert.severity === "critical") {
      return <AlertTriangle className="h-4 w-4 text-rose-600" />;
    }
    if (alert.severity === "warning") {
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    }
    return <Droplets className="h-4 w-4 text-sky-600" />;
  };

  return (
    <div
      className={`rounded-[22px] bg-white border border-[var(--border-light)] p-4 shadow-xs flex items-start justify-between gap-4 ${
        isArchive ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          {renderIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs text-[var(--text-primary)]">{alert.title}</h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{alert.time} WIB</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{alert.message}</p>
        </div>
      </div>

      {!isArchive && <div className="h-2 w-2 rounded-full bg-[var(--accent-yellow-deep)] shrink-0 mt-2" />}
    </div>
  );
}
