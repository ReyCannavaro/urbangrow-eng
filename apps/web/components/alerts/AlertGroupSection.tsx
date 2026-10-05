"use client";

import React from "react";
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
  emptyMessage = "Tidak ada notifikasi aktif. Seluruh sistem berjalan optimal.",
  isArchive = false,
}: AlertGroupSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{title}</h3>

      <div className="space-y-2.5">
        {alerts.map((alt) => (
          <AlertItemCard key={alt.id} alert={alt} isArchive={isArchive} />
        ))}

        {alerts.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-3xl border border-dashed border-stone-200">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
