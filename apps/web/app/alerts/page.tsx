"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AlertsHeader } from "@/components/alerts/AlertsHeader";
import { AlertsBentoRow } from "@/components/alerts/AlertsBentoRow";
import { AlertGroupSection } from "@/components/alerts/AlertGroupSection";
import {
  ActuatorAuditLog,
  AlertNotification,
  PersistedSystemAlert,
} from "@/lib/types";
import {
  fetchActuatorAuditLogs,
  fetchPersistedSystemAlerts,
  resolveAllSystemAlerts,
} from "@/lib/operationsApi";

type FilterType = "all" | "warning" | "optimal";

function formatWibClock(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return iso;
  return new Date(parsed).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapPersistedAlertsToNotifications(
  rows: PersistedSystemAlert[]
): AlertNotification[] {
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    time: formatWibClock(r.recordedAt),
    severity: r.severity,
    isResolved: r.isResolved,
  }));
}

function mapAuditLogsToNotifications(logs: ActuatorAuditLog[]): AlertNotification[] {
  return logs.map((l) => ({
    id: `audit-${l.id}`,
    title: `${l.actuatorName} → ${l.state ? "AKTIF (ON)" : "MATI (OFF)"}`,
    message: `${l.note || "Perubahan status relay"} • Sumber: ${l.triggeredBy}`,
    time: formatWibClock(l.recordedAt),
    severity: "info",
    isResolved: true,
  }));
}

export default function AlertsPage() {
  const { alerts } = useTelemetry();
  const [persistedAlerts, setPersistedAlerts] = useState<PersistedSystemAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActuatorAuditLog[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    let cancelled = false;
    async function loadLogs() {
      const [dbAlerts, dbActuators] = await Promise.all([
        fetchPersistedSystemAlerts(),
        fetchActuatorAuditLogs(25),
      ]);
      if (cancelled) return;
      setPersistedAlerts(dbAlerts);
      setAuditLogs(dbActuators);
    }

    void loadLogs();
    const timer = setInterval(() => {
      void loadLogs();
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const clearAll = async () => {
    const resolved = await resolveAllSystemAlerts();
    setPersistedAlerts(resolved);
  };

  const mergedAlerts: AlertNotification[] =
    persistedAlerts.length > 0
      ? mapPersistedAlertsToNotifications(persistedAlerts)
      : alerts;

  const activeAlerts = mergedAlerts.filter((a) => !a.isResolved);
  const resolvedAndAuditLogs: AlertNotification[] = [
    ...mergedAlerts.filter((a) => a.isResolved),
    ...mapAuditLogsToNotifications(auditLogs),
  ];

  const filterAlerts = (list: AlertNotification[]) => {
    if (filter === "warning")
      return list.filter((a) => a.severity === "warning" || a.severity === "critical");
    if (filter === "optimal") return list.filter((a) => a.severity === "info");
    return list;
  };

  const activeFiltered = filterAlerts(activeAlerts);
  const historyFiltered = filterAlerts(resolvedAndAuditLogs);

  const warningCount = [...activeAlerts, ...resolvedAndAuditLogs].filter(
    (a) => a.severity === "warning" || a.severity === "critical"
  ).length;
  const infoCount = [...activeAlerts, ...resolvedAndAuditLogs].filter(
    (a) => a.severity === "info"
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Alerts Header with Status Badges */}
      <AlertsHeader onClearAll={clearAll} activeCount={activeAlerts.length} />

      {/* 2. 4-Metric Bento Row */}
      <AlertsBentoRow activeCount={activeAlerts.length} />

      {/* 3. Filter Navigation Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full border border-[#E5E7EB] bg-white text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Semua Log ({activeAlerts.length + resolvedAndAuditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("warning")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filter === "warning"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Peringatan &amp; Anomali ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("optimal")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filter === "optimal"
                ? "bg-[#165B39] text-white font-semibold shadow-xs"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            Audit Aktuator &amp; Sistem ({infoCount})
          </button>
        </div>

        <Link
          href="/controls"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#111827] shadow-2xs transition-colors"
        >
          <span>Panel Kontrol Aktuator</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#165B39]" />
        </Link>
      </div>

      {/* 4. Alert Timeline Feed (Persisted SQLite Alerts + Actuator Audit History) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertGroupSection
          title="Peringatan Aktif & Anomali Terkini"
          alerts={activeFiltered}
          emptyMessage="Tidak ada anomali parameter yang tertunda. Seluruh parameter sensor dalam rentang aman ECAD."
        />

        <AlertGroupSection
          title="Riwayat Audit Aktuator & Log Tersimpan (SQLite)"
          alerts={historyFiltered}
          isArchive={true}
          emptyMessage="Belum ada riwayat perubahan relay yang tercatat di database."
        />
      </div>
    </div>
  );
}
