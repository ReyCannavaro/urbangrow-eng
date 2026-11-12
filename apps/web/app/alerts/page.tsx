"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { AlertsHeader } from "@/components/alerts/AlertsHeader";
import { AlertGroupSection } from "@/components/alerts/AlertGroupSection";
import { RevealOnView } from "@/components/motion/RevealOnView";
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
  if (!Number.isFinite(parsed)) return iso.replace(/\s*WIB$/i, "");
  return new Date(parsed).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localizeAlertTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\bPeringatan Parameter WATERPUMP\b/i, "Pompa Sirkulasi Mati")
    .replace(/\bPeringatan Parameter AERATOR\b/i, "Aerator Nonaktif")
    .replace(/\bPeringatan Parameter GROWLIGHT\b/i, "Grow Light Nonaktif")
    .replace(/\bPeringatan Parameter PH\b/i, "Peringatan Parameter pH Air")
    .replace(/\bPeringatan Parameter TDS\b/i, "Peringatan Parameter TDS Nutrisi")
    .replace(/\bPeringatan Parameter WATERTEMPERATURE\b/i, "Peringatan Suhu Air Kolam")
    .replace(/\bPeringatan Parameter LIGHTINTENSITY\b/i, "Peringatan Intensitas Cahaya")
    .replace(/\bPeringatan Parameter WATERLEVEL\b/i, "Peringatan Tinggi Muka Air")
    .replace(/\bPeringatan Parameter DISSOLVEDOXYGEN\b/i, "Peringatan Oksigen Terlarut");
}

function localizeAlertMessage(rawMessage: string): string {
  if (/Main water circulation pump is currently turned OFF\.?/i.test(rawMessage)) {
    return "Pompa sirkulasi air utama (Level 1 → Level 4) sedang berstatus MATI (OFF).";
  }
  return rawMessage
    .replace(
      /Low Water pH \(([^)]+)\): Acidosis risk for fish\. Buffer dosing needed\.?/i,
      "pH air terlalu rendah ($1): Risiko stres asam pada ikan, aktifkan buffer penetral."
    )
    .replace(
      /High Water pH \(([^)]+)\): Micronutrient lockout for plant roots\.?/i,
      "pH air terlalu tinggi ($1): Risiko hambatan serapan mikronutrien akar tanaman."
    )
    .replace(
      /High Water Temp \(([^)]+)\): Depleting dissolved oxygen\.?/i,
      "Suhu air kolam terlalu tinggi ($1): Menurunkan kadar oksigen terlarut kolam."
    )
    .replace(
      /Critical Water Level \(([^)]+)\): Sump reservoir nearly dry\. Pump protection active\.?/i,
      "Ketinggian air sump kritis ($1): Reservoir hampir kering, proteksi pompa aktif."
    )
    .replace(
      /Low Light Intensity \(([^)]+)\): Photosynthetic slowdown risk\. Consider enabling Grow Light\.?/i,
      "Intensitas cahaya rendah ($1): Risiko perlambatan fotosintesis, pertimbangkan aktifkan Grow Light."
    )
    .replace(
      /Hypoxia Warning! Dissolved Oxygen critically low \(([^)]+)\)\. Check aerator!?/i,
      "Peringatan hipoksia: Oksigen terlarut rendah ($1). Periksa aerator!"
    );
}

function mapPersistedAlertsToNotifications(
  rows: PersistedSystemAlert[]
): AlertNotification[] {
  return rows.map((r) => ({
    id: r.id,
    title: localizeAlertTitle(r.title),
    message: localizeAlertMessage(r.message),
    time: formatWibClock(r.recordedAt),
    severity: r.severity,
    isResolved: r.isResolved,
  }));
}

function mapAuditLogsToNotifications(logs: ActuatorAuditLog[]): AlertNotification[] {
  return logs.map((l) => ({
    id: `audit-${l.id}`,
    title: `${l.actuatorName} → ${l.state ? "ON" : "OFF"}`,
    message: l.note || `Perubahan status dari ${l.triggeredBy}`,
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
      : alerts.map((a) => ({
          ...a,
          title: localizeAlertTitle(a.title),
          message: localizeAlertMessage(a.message),
          time: a.time.replace(/\s*WIB$/i, ""),
        }));

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
      <AlertsHeader onClearAll={clearAll} activeCount={activeAlerts.length} />

      {/* Filter Pills + Quick Link */}
      <div
        style={{ "--ug-delay": "60ms" } as React.CSSProperties}
        className="ug-enter flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-1 p-1 rounded-full border border-[#E5E7EB] bg-white text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              filter === "all"
                ? "bg-[#165B39] text-white font-semibold"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            Semua ({activeAlerts.length + resolvedAndAuditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("warning")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              filter === "warning"
                ? "bg-[#165B39] text-white font-semibold"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            Peringatan ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("optimal")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              filter === "optimal"
                ? "bg-[#165B39] text-white font-semibold"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            Riwayat Relay ({infoCount})
          </button>
        </div>

        <Link
          href="/controls"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] text-xs font-semibold text-[#111827] transition-colors group"
        >
          <span>Panel Kontrol Relay</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#165B39] transition-transform duration-200 group-hover:rotate-45" />
        </Link>
      </div>

      {/* Asymmetric Grouped Inbox Feed */}
      <RevealOnView delayMs={0}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5">
            <AlertGroupSection
              title="Peringatan Aktif"
              alerts={activeFiltered}
              emptyMessage="Tidak ada anomali parameter yang tertunda."
            />
          </div>

          <div className="lg:col-span-7">
            <AlertGroupSection
              title="Riwayat Audit Sistem & Relay"
              alerts={historyFiltered}
              isArchive={true}
              emptyMessage="Belum ada riwayat aktivitas relay yang tercatat."
            />
          </div>
        </div>
      </RevealOnView>
    </div>
  );
}
