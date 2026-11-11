import { fetchFromBackend, getCandidateApiBases } from "./apiConfig";
import {
  ActuatorAuditLog,
  AutomationSchedule,
  HistorySample,
  PersistedSystemAlert,
} from "./types";

const SCHEDULES_CACHE_KEY = "urbangrow_automation_schedules_v1";

function getFallbackSchedules(): AutomationSchedule[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: "sched-feed-morning",
      title: "Pemberian Pakan Pagi (35g)",
      triggerType: "time",
      scheduleTime: "07:00",
      sensorMetric: null,
      operator: null,
      thresholdValue: null,
      actuatorId: "feeder",
      targetState: true,
      notes: "Pakan pelet apung protein 32% untuk kolam Ikan Nila L3 & Lele L1.",
      enabled: true,
      lastTriggeredAt: null,
      createdAt: nowIso,
    },
    {
      id: "sched-feed-afternoon",
      title: "Pemberian Pakan Sore (35g)",
      triggerType: "time",
      scheduleTime: "16:30",
      sensorMetric: null,
      operator: null,
      thresholdValue: null,
      actuatorId: "feeder",
      targetState: true,
      notes: "Siklus pakan sore sebelum penurunan suhu malam.",
      enabled: true,
      lastTriggeredAt: null,
      createdAt: nowIso,
    },
    {
      id: "sched-temp-aerator",
      title: "Proteksi Suhu & Oksigen Kolam Nila L3",
      triggerType: "sensor_threshold",
      scheduleTime: null,
      sensorMetric: "waterTemperature",
      operator: ">",
      thresholdValue: 28.5,
      actuatorId: "aerator",
      targetState: true,
      notes: "Otomatis menyalakan Aerator Venturi jika suhu air naik di atas 28.5°C.",
      enabled: true,
      lastTriggeredAt: null,
      createdAt: nowIso,
    },
  ];
}

function readCachedSchedules(): AutomationSchedule[] {
  if (typeof window === "undefined") return getFallbackSchedules();
  try {
    const raw = window.localStorage.getItem(SCHEDULES_CACHE_KEY);
    if (!raw) return getFallbackSchedules();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getFallbackSchedules();
  } catch {
    return getFallbackSchedules();
  }
}

function writeCachedSchedules(items: AutomationSchedule[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCHEDULES_CACHE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchAutomationSchedules(): Promise<AutomationSchedule[]> {
  const res = await fetchFromBackend<{ success: boolean; schedules?: AutomationSchedule[] }>(
    "/api/schedules",
    {},
    4000
  );
  if (res.ok && Array.isArray(res.data?.schedules)) {
    writeCachedSchedules(res.data.schedules);
    return res.data.schedules;
  }
  return readCachedSchedules();
}

export async function createAutomationScheduleItem(payload: {
  title: string;
  triggerType: "time" | "sensor_threshold";
  scheduleTime?: string;
  sensorMetric?: string;
  operator?: "<" | ">";
  thresholdValue?: number;
  actuatorId: string;
  targetState?: boolean;
  notes?: string;
}): Promise<AutomationSchedule[]> {
  const res = await fetchFromBackend<{ success: boolean; schedules?: AutomationSchedule[] }>(
    "/api/schedules",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    4500
  );
  if (res.ok && Array.isArray(res.data?.schedules)) {
    writeCachedSchedules(res.data.schedules);
    return res.data.schedules;
  }

  const local = readCachedSchedules();
  const created: AutomationSchedule = {
    id: `local-${Date.now()}`,
    title: payload.title,
    triggerType: payload.triggerType,
    scheduleTime: payload.triggerType === "time" ? payload.scheduleTime || "08:00" : null,
    sensorMetric:
      payload.triggerType === "sensor_threshold"
        ? payload.sensorMetric || "waterTemperature"
        : null,
    operator: payload.triggerType === "sensor_threshold" ? payload.operator || ">" : null,
    thresholdValue:
      payload.triggerType === "sensor_threshold" ? payload.thresholdValue ?? 28.5 : null,
    actuatorId: payload.actuatorId,
    targetState: payload.targetState ?? true,
    notes: payload.notes || "",
    enabled: true,
    lastTriggeredAt: null,
    createdAt: new Date().toISOString(),
  };
  const next = [...local, created];
  writeCachedSchedules(next);
  return next;
}

export async function toggleAutomationScheduleItem(
  id: string
): Promise<AutomationSchedule[]> {
  const res = await fetchFromBackend<{ success: boolean; schedules?: AutomationSchedule[] }>(
    `/api/schedules/${encodeURIComponent(id)}/toggle`,
    { method: "PATCH" },
    4000
  );
  if (res.ok && Array.isArray(res.data?.schedules)) {
    writeCachedSchedules(res.data.schedules);
    return res.data.schedules;
  }

  const next = readCachedSchedules().map((s) =>
    s.id === id ? { ...s, enabled: !s.enabled } : s
  );
  writeCachedSchedules(next);
  return next;
}

export async function deleteAutomationScheduleItem(
  id: string
): Promise<AutomationSchedule[]> {
  const res = await fetchFromBackend<{ success: boolean; schedules?: AutomationSchedule[] }>(
    `/api/schedules/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    4000
  );
  if (res.ok && Array.isArray(res.data?.schedules)) {
    writeCachedSchedules(res.data.schedules);
    return res.data.schedules;
  }

  const next = readCachedSchedules().filter((s) => s.id !== id);
  writeCachedSchedules(next);
  return next;
}

export async function fetchActuatorAuditLogs(limit = 30): Promise<ActuatorAuditLog[]> {
  const res = await fetchFromBackend<{ success: boolean; logs?: ActuatorAuditLog[] }>(
    `/api/logs/actuators?limit=${limit}`,
    {},
    4000
  );
  if (res.ok && Array.isArray(res.data?.logs)) {
    return res.data.logs;
  }
  return [];
}

export async function fetchPersistedSystemAlerts(): Promise<PersistedSystemAlert[]> {
  const res = await fetchFromBackend<{ success: boolean; alerts?: PersistedSystemAlert[] }>(
    "/api/logs/alerts",
    {},
    4000
  );
  if (res.ok && Array.isArray(res.data?.alerts)) {
    return res.data.alerts;
  }
  return [];
}

export async function resolveAllSystemAlerts(): Promise<PersistedSystemAlert[]> {
  const res = await fetchFromBackend<{ success: boolean; alerts?: PersistedSystemAlert[] }>(
    "/api/logs/alerts/resolve-all",
    { method: "POST" },
    4000
  );
  if (res.ok && Array.isArray(res.data?.alerts)) {
    return res.data.alerts;
  }
  return [];
}

export async function downloadTelemetryCsv(fallbackHistory: HistorySample[]): Promise<void> {
  const candidates = getCandidateApiBases();
  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${base}/api/sensors/export.csv`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text.includes("Timestamp_UTC")) {
          triggerBrowserCsvDownload(
            text,
            `UrbanGrow_Database_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`
          );
          return;
        }
      }
    } catch {
      // Try next candidate
    }
  }

  // Fallback to active telemetry buffer
  const headers = [
    "Timestamp",
    "pH_Air",
    "Suhu_Air_Celsius",
    "TDS_Nutrisi_PPM",
    "Dissolved_Oxygen_mgL",
    "Suhu_Udara_Celsius",
    "Kelembaban_Persen",
    "Intensitas_Cahaya_Lux",
    "Level_Air_Persen",
    "Pompa_Air",
    "Aerator",
    "Grow_Light",
  ];

  const fmtNum = (val: number | null, digits?: number): string =>
    typeof val === "number" && Number.isFinite(val)
      ? digits !== undefined
        ? val.toFixed(digits)
        : String(Math.round(val))
      : "";

  const rows = fallbackHistory.map((h) => [
    h.timestamp,
    fmtNum(h.sensors.ph, 2),
    fmtNum(h.sensors.waterTemperature, 2),
    fmtNum(h.sensors.tds),
    fmtNum(h.sensors.dissolvedOxygen, 2),
    fmtNum(h.sensors.airTemperature, 1),
    fmtNum(h.sensors.humidity, 1),
    fmtNum(h.sensors.lightIntensity),
    fmtNum(h.sensors.waterLevel, 1),
    h.actuators?.waterPump ? "ON" : "OFF",
    h.actuators?.aerator ? "ON" : "OFF",
    h.actuators?.growLight ? "ON" : "OFF",
  ]);

  triggerBrowserCsvDownload(
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"),
    `UrbanGrow_Telemetry_Timeseries_${new Date().toISOString().slice(0, 10)}.csv`
  );
}

function triggerBrowserCsvDownload(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

