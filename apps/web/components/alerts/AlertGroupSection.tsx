"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { AlertItemCard } from "./AlertItemCard";
import { AlertNotification } from "@/lib/types";

interface AlertGroupSectionProps {
  title: string;
  alerts: AlertNotification[];
  emptyMessage?: string;
  isArchive?: boolean;
}

export function AlertGroupSection({
  title,
  alerts,
  emptyMessage = "Tidak ada notifikasi aktif. Seluruh parameter berada dalam rentang aman.",
  isArchive = false,
}: AlertGroupSectionProps) {
  return (
    <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[11px] font-semibold text-[#4B5563] num-tabular">
          {alerts.length}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <div className="h-10 w-10 rounded-full bg-[#DCFCE7] text-[#165B39] flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-sm font-bold text-[#111827]">
            Semua Kondisi Terkendali
          </div>
          <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F3F4F6]">
          {alerts.map((alt) => (
            <AlertItemCard key={alt.id} alert={alt} isArchive={isArchive} />
          ))}
        </div>
      )}
    </div>
  );
}
