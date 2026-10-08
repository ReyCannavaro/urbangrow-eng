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
  emptyMessage = "Tidak ada notifikasi aktif. Seluruh sistem akuaponik beroperasi optimal.",
  isArchive = false,
}: AlertGroupSectionProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider">
            {title}
          </h3>
          <span className="px-2 py-0.2 rounded-full bg-[#F3F4F6] text-[10px] font-mono text-[#4B5563] font-bold">
            {alerts.length} Log
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <AlertItemCard key={alt.id} alert={alt} isArchive={isArchive} />
        ))}

        {alerts.length === 0 && (
          <div className="p-8 text-center bg-white rounded-[24px] border border-dashed border-[#E5E7EB] space-y-2">
            <div className="h-10 w-10 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-sm font-bold text-[#111827]">
              Semua Kondisi Terkendali
            </div>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
