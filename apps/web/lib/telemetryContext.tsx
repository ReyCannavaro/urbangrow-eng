"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  SensorData,
  SensorSourcesMap,
  IoTSystemMeta,
  ActuatorState,
  HistorySample,
  AlertNotification,
  BackendTelemetrySnapshot,
} from "./types";
import {
  fetchFromBackend,
  getActiveDirectBackendUrl,
  getWebSocketEndpoint,
} from "./apiConfig";
import {
  extractActiveStreamHistory,
  isTelemetrySnapshotLive,
  mergeActiveHistory,
} from "./telemetryHistory";

interface ActuatorActionResult {
  ok: boolean;
  error?: string;
}

export interface ActuatorToast {
  message: string;
  type: "warning" | "error" | "success" | "info";
  timestamp: number;
}

interface TelemetryContextType {
  sensors: SensorData;
  sensorSources: SensorSourcesMap;
  systemMeta: IoTSystemMeta;
  actuators: Record<string, ActuatorState>;
  history: HistorySample[];
  alerts: AlertNotification[];
  backendConnected: boolean;
  toggleActuator: (id: string) => Promise<ActuatorActionResult>;
  setActuatorState: (id: string, state: boolean) => Promise<ActuatorActionResult>;
  dispenseFeed: () => Promise<void>;
  feedActive: boolean;
  setAnomaly: (type: string) => Promise<void>;
  anomalyMode: string;
  lastActuatorError: string | null;
  clearActuatorError: () => void;
  actuatorToast: ActuatorToast | null;
  clearActuatorToast: () => void;
  showActuatorToast: (message: string, type?: "warning" | "error" | "success" | "info") => void;
}

const ALL_NULL_SENSORS: SensorData = {
  ph: null,
  tds: null,
  waterTemperature: null,
  airTemperature: null,
  humidity: null,
  lightIntensity: null,
  dissolvedOxygen: null,
  waterLevel: null,
};

const DEFAULT_SENSOR_SOURCES: SensorSourcesMap = {
  ph: "offline",
  tds: "offline",
  waterTemperature: "offline",
  airTemperature: "offline",
  humidity: "offline",
  lightIntensity: "offline",
  dissolvedOxygen: "offline",
  waterLevel: "offline",
};

const DEFAULT_SYSTEM_META: IoTSystemMeta = {
  status: "offline",
  mode: "offline",
  anomalyMode: "none",
  uptimeSeconds: 0,
  edgeNode: "ESP32-GROW-01",
  edgeOnline: false,
  liveSensorCount: 0,
  lastTelemetryAt: null,
  wifiSignalDbm: null,
};

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<SensorData>(ALL_NULL_SENSORS);

  const [sensorSources, setSensorSources] = useState<SensorSourcesMap>(DEFAULT_SENSOR_SOURCES);
  const [systemMeta, setSystemMeta] = useState<IoTSystemMeta>(DEFAULT_SYSTEM_META);

  const [actuators, setActuators] = useState<Record<string, ActuatorState>>({
    waterPump: {
      id: "waterPump",
      name: "Pompa Sirkulasi 12V",
      code: "RELAY-01",
      type: "pump",
      isOn: false,
      mode: "manual",
      powerWatts: 45,
      voltage: "12V DC",
      installed: true,
      hardwareStatus: "ready",
      hardwareReason: "Modul Relay 12V Aktif (GPIO 14 Active-LOW)",
    },
    aerator: {
      id: "aerator",
      name: "Aerator Oksigen Nila",
      code: "RELAY-02",
      type: "aerator",
      isOn: false,
      mode: "manual",
      powerWatts: 18,
      voltage: "12V DC",
      installed: false,
      hardwareStatus: "development",
      hardwareReason: "Hardware modul relay aerator belum terpasang (tahap pengembangan)",
    },
    growLight: {
      id: "growLight",
      name: "Grow Light Fotosintesis",
      code: "RELAY-03",
      type: "light",
      isOn: false,
      mode: "manual",
      powerWatts: 85,
      voltage: "12V DC",
      installed: false,
      hardwareStatus: "development",
      hardwareReason: "Hardware modul driver LED belum terpasang (tahap pengembangan)",
    },
    feeder: {
      id: "feeder",
      name: "Auto-Feeder Dispenser",
      code: "RELAY-04",
      type: "feeder",
      isOn: false,
      mode: "manual",
      powerWatts: 12,
      voltage: "12V DC",
      installed: false,
      hardwareStatus: "development",
      hardwareReason: "Hardware modul servo dispenser belum terpasang (tahap pengembangan)",
    },
    dosingPump: {
      id: "dosingPump",
      name: "Pompa Dosing Buffer pH",
      code: "RELAY-05",
      type: "dosing",
      isOn: false,
      mode: "manual",
      powerWatts: 12,
      voltage: "12V DC",
      installed: false,
      hardwareStatus: "development",
      hardwareReason: "Hardware modul pompa peristaltik belum terpasang (tahap pengembangan)",
    },
  });

  const [history, setHistory] = useState<HistorySample[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [anomalyMode, setAnomalyMode] = useState<string>("none");
  const [feedActive, setFeedActive] = useState<boolean>(false);
  const [lastActuatorError, setLastActuatorError] = useState<string | null>(null);
  const [actuatorToast, setActuatorToast] = useState<ActuatorToast | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsConnectedRef = useRef<boolean>(false);

  const clearActuatorToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActuatorToast(null);
  }, []);

  const showActuatorToast = useCallback(
    (message: string, type: "warning" | "error" | "success" | "info" = "warning") => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setActuatorToast({ message, type, timestamp: Date.now() });
      toastTimerRef.current = setTimeout(() => {
        setActuatorToast(null);
      }, 5000);
    },
    []
  );

  const clearActuatorError = useCallback(() => {
    setLastActuatorError(null);
  }, []);

  const applyBackendSnapshot = useCallback((json: BackendTelemetrySnapshot) => {
    if (!json || typeof json !== "object") return;

    setBackendConnected(true);

    const parsedServerNow = json.timestamp ? Date.parse(json.timestamp) : NaN;
    const serverNowMs = Number.isFinite(parsedServerNow) ? parsedServerNow : Date.now();
    const isStreamLive = isTelemetrySnapshotLive(json);

    const incomingSensors = json.sensors;
    if (incomingSensors) {
      setSensors(incomingSensors);
      if (isStreamLive) {
        const telemetryTs =
          json.system?.lastTelemetryAt || json.timestamp || new Date(serverNowMs).toISOString();
        setHistory((prevH) => {
          const activePrev = extractActiveStreamHistory(prevH, serverNowMs);
          const last = activePrev[activePrev.length - 1];
          if (last && last.timestamp === telemetryTs) {
            return activePrev;
          }
          return [
            ...activePrev.slice(-59),
            {
              timestamp: telemetryTs,
              sensors: incomingSensors,
              actuators: Object.fromEntries(
                Object.entries(json.actuators || {}).map(([k, v]) => [k, Boolean(v?.isOn)])
              ),
            },
          ];
        });
      } else {
        // Nobody is currently hitting telemetry API -> keep live charts empty
        setHistory((prevH) => (prevH.length === 0 ? prevH : []));
      }
    }

    if (json.sensorSources) {
      setSensorSources({ ...DEFAULT_SENSOR_SOURCES, ...json.sensorSources });
    }

    if (json.system) {
      setSystemMeta((prev) => ({ ...prev, ...json.system }));
      if (json.system.anomalyMode) {
        setAnomalyMode(json.system.anomalyMode);
      }
    }

    if (json.actuators) {
      const isEdgeOnline = Boolean(json.system?.edgeOnline);
      setActuators((prev) => {
        const updated = { ...prev };
        Object.entries(json.actuators || {}).forEach(([id, act]) => {
          const isPump = id === "waterPump" || act.id === "waterPump";
          updated[id] = {
            id,
            name: act.name || updated[id]?.name || id,
            code:
              act.code ||
              updated[id]?.code ||
              (isPump
                ? "RELAY-01"
                : id === "aerator"
                ? "RELAY-02"
                : id === "growLight"
                ? "RELAY-03"
                : id === "feeder"
                ? "RELAY-04"
                : "RELAY-05"),
            type: act.type || updated[id]?.type || (isPump ? "pump" : "aerator"),
            // Actuator can only remain ON if hardware node is actively online and it's waterPump!
            isOn: isEdgeOnline && isPump ? Boolean(act.isOn) : false,
            mode: act.mode || updated[id]?.mode || "manual",
            powerWatts: act.powerWatts || updated[id]?.powerWatts || 20,
            voltage: act.voltage || updated[id]?.voltage || "12V DC",
            installed: isPump,
            hardwareStatus: isPump ? "ready" : "development",
            hardwareReason: isPump
              ? "Modul Relay 12V Aktif (GPIO 14 Active-LOW)"
              : "Hardware belum terpasang fisik pada ESP32 (dalam tahap pengembangan)",
          };
        });
        return updated;
      });
    }

    if (Array.isArray(json.alerts)) {
      setAlerts(
        json.alerts.map((a, idx) => ({
          id: a.id || `alt-${idx}-${a.metric || "sys"}`,
          title: a.metric ? `Peringatan ${String(a.metric).toUpperCase()}` : "Alert Sistem",
          message: a.message,
          time: a.timestamp
            ? new Date(a.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sekarang",
          severity: a.severity || "warning",
          isResolved: a.isResolved ?? false,
        }))
      );
    }
  }, []);

  const markBackendOffline = useCallback(() => {
    setBackendConnected(false);
    setSensors(ALL_NULL_SENSORS);
    setSensorSources(DEFAULT_SENSOR_SOURCES);
    setHistory((prevH) => (prevH.length === 0 ? prevH : []));
    setActuators((prev) => {
      const allOff = { ...prev };
      Object.keys(allOff).forEach((k) => {
        allOff[k] = { ...allOff[k], isOn: false };
      });
      return allOff;
    });
    setSystemMeta((prev) => ({
      ...prev,
      status: "offline",
      mode: "offline",
      edgeOnline: false,
      liveSensorCount: 0,
      wifiSignalDbm: null,
    }));
  }, []);

  // Sync with Elysia backend via HTTP
  const fetchTelemetry = useCallback(async () => {
    const res = await fetchFromBackend<BackendTelemetrySnapshot>("/api/sensors/current", {}, 2500);
    if (res.ok && res.data) {
      applyBackendSnapshot(res.data);
    } else if (!res.reached) {
      markBackendOffline();
    }
  }, [applyBackendSnapshot, markBackendOffline]);

  // Initial and periodic active-session history sync (drops stale/offline DB rows)
  useEffect(() => {
    let cancelled = false;
    async function loadHistoryFromDatabase() {
      const [currentRes, historyRes] = await Promise.all([
        fetchFromBackend<BackendTelemetrySnapshot>("/api/sensors/current", {}, 2500),
        fetchFromBackend<{ data?: HistorySample[] }>("/api/sensors/history", {}, 3000),
      ]);
      if (cancelled || !currentRes.ok || !currentRes.data) return;

      const snap = currentRes.data;
      const parsedServerNow = snap.timestamp ? Date.parse(snap.timestamp) : NaN;
      const serverNowMs = Number.isFinite(parsedServerNow) ? parsedServerNow : Date.now();
      const isStreamLive = isTelemetrySnapshotLive(snap);

      if (!isStreamLive) {
        setHistory((prevH) => (prevH.length === 0 ? prevH : []));
        return;
      }

      if (historyRes.ok && Array.isArray(historyRes.data?.data)) {
        const recentDbSamples = extractActiveStreamHistory(historyRes.data.data, serverNowMs);
        if (recentDbSamples.length > 0) {
          setHistory((prevH) => mergeActiveHistory(prevH, recentDbSamples, serverNowMs));
        }
      }
    }
    void loadHistoryFromDatabase();
    const historyTimer = setInterval(() => {
      void loadHistoryFromDatabase();
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(historyTimer);
    };
  }, []);

  // Periodic 1500ms HTTP sync (guarantees steady state even behind HTTP-only reverse proxies)
  useEffect(() => {
    let cancelled = false;
    async function pollLoop() {
      const res = await fetchFromBackend<BackendTelemetrySnapshot>("/api/sensors/current", {}, 2500);
      if (cancelled) return;
      if (res.ok && res.data) {
        applyBackendSnapshot(res.data);
      } else if (!res.reached) {
        markBackendOffline();
      }
    }

    void pollLoop();
    const interval = setInterval(() => {
      void pollLoop();
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applyBackendSnapshot, markBackendOffline]);

  // Optional low-latency WebSocket listener when direct HTTP/HTTPS backend URL is known
  useEffect(() => {
    if (!backendConnected) return;
    const directUrl = getActiveDirectBackendUrl();
    if (!directUrl) return;

    const wsUrl = getWebSocketEndpoint(directUrl);
    if (!wsUrl || typeof WebSocket === "undefined") return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        wsConnectedRef.current = true;
      };
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg?.type === "ping") {
            ws?.send("ping");
            return;
          }
          if (msg?.data && (msg.type === "snapshot" || msg.type === "telemetry" || msg.type === "actuator_update")) {
            applyBackendSnapshot(msg.data);
          }
        } catch {
          // ignore malformed WS frames cleanly
        }
      };
      ws.onerror = () => {
        wsConnectedRef.current = false;
      };
      ws.onclose = () => {
        wsConnectedRef.current = false;
      };
    } catch {
      wsConnectedRef.current = false;
    }

    return () => {
      wsConnectedRef.current = false;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [backendConnected, applyBackendSnapshot]);

  const handleActuatorMutation = useCallback(
    async (
      id: string,
      path: string,
      init: RequestInit,
      optimisticNext: boolean
    ): Promise<ActuatorActionResult> => {
      setLastActuatorError(null);
      const prevState = actuators[id]?.isOn;
      const isWaterPump = id === "waterPump" || id === "pump";
      const isHardwareOnline = systemMeta.edgeOnline;
      const actName = actuators[id]?.name || (isWaterPump ? "Pompa Sirkulasi 12V" : id);

      // 1. Optimistic UI update (tactile feedback immediately flips switch)
      setActuators((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], isOn: optimisticNext },
        };
      });

      // 2. Dispatch request to backend dynamically
      const res = await fetchFromBackend<{
        success?: boolean;
        message?: string;
        actuator?: ActuatorState;
        installed?: boolean;
      }>(path, init, 3500);

      // 3. Dynamic Reversion & Response Evaluation:
      // A. If actuator is NOT waterPump (in development stage / uninstalled hardware)
      if (!isWaterPump) {
        // Allow user to see the switch animate ON for ~700ms (verifying dynamic transmission to tool)
        setTimeout(() => {
          setActuators((prev) => {
            if (!prev[id]) return prev;
            return {
              ...prev,
              [id]: { ...prev[id], isOn: false, installed: false, hardwareStatus: "development" },
            };
          });
          const devMsg = `Aktuator '${actName}' masih dalam tahap pengembangan (perangkat keras belum terpasang pada modul ESP32). Saklar otomatis kembali ke posisi OFF.`;
          setLastActuatorError(devMsg);
          showActuatorToast(devMsg, "warning");
        }, 700);

        return {
          ok: false,
          error: `Aktuator '${actName}' masih dalam tahap pengembangan (hardware belum terpasang).`,
        };
      }

      // B. If actuator IS waterPump:
      // If hardware node is offline
      if (!isHardwareOnline) {
        setTimeout(() => {
          setActuators((prev) => {
            if (!prev[id]) return prev;
            return {
              ...prev,
              [id]: { ...prev[id], isOn: false },
            };
          });
          const offlineMsg =
            "Pompa Sirkulasi 12V tidak dapat menyala: Modul ESP32 sedang offline / tidak terhubung ke jaringan Wi-Fi. Saklar otomatis kembali OFF.";
          setLastActuatorError(offlineMsg);
          showActuatorToast(offlineMsg, "error");
        }, 700);

        return { ok: false, error: "Modul ESP32 sedang offline." };
      }

      // If backend rejected due to safety interlock or server validation
      if (!res.ok) {
        const errMsg =
          res.data?.message ||
          `Perintah aktuator '${actName}' ditolak sistem (${res.status || "Error"}).`;
        if (typeof prevState === "boolean") {
          setActuators((prev) => {
            if (!prev[id]) return prev;
            return {
              ...prev,
              [id]: { ...prev[id], isOn: prevState },
            };
          });
        }
        setLastActuatorError(errMsg);
        showActuatorToast(errMsg, "error");
        return { ok: false, error: errMsg };
      }

      // If waterPump succeeded
      if (res.ok && res.data?.actuator) {
        const serverAct = res.data.actuator;
        setActuators((prev) => ({
          ...prev,
          [serverAct.id]: {
            ...(prev[serverAct.id] || serverAct),
            ...serverAct,
            installed: true,
            hardwareStatus: "ready",
          },
        }));
      }

      clearActuatorError();
      showActuatorToast(
        `Pompa Sirkulasi 12V berhasil ${optimisticNext ? "dinyalakan" : "dimatikan"} via ESP32 (GPIO 14 Active-LOW).`,
        "success"
      );
      return { ok: true };
    },
    [actuators, systemMeta.edgeOnline, showActuatorToast, clearActuatorError]
  );

  const toggleActuator = useCallback(
    async (id: string): Promise<ActuatorActionResult> => {
      const current = actuators[id];
      const optimisticNext = current ? !current.isOn : true;
      return handleActuatorMutation(
        id,
        `/api/actuators/${encodeURIComponent(id)}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        optimisticNext
      );
    },
    [actuators, handleActuatorMutation]
  );

  const setActuatorState = useCallback(
    async (id: string, state: boolean): Promise<ActuatorActionResult> => {
      return handleActuatorMutation(
        id,
        `/api/actuators/${encodeURIComponent(id)}/set`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state, mode: "manual" }),
        },
        state
      );
    },
    [handleActuatorMutation]
  );

  const dispenseFeed = useCallback(async () => {
    setFeedActive(true);
    showActuatorToast(
      "Modul servo Auto-Feeder masih dalam tahap pengembangan (perangkat keras belum terpasang pada ESP32).",
      "warning"
    );
    await fetchFromBackend("/api/feed/dispense", { method: "POST" }, 3000);
    setTimeout(() => setFeedActive(false), 2200);
  }, [showActuatorToast]);

  const setAnomaly = useCallback(async (type: string) => {
    setAnomalyMode(type);
    await fetchFromBackend(
      "/api/simulation/anomaly",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      },
      3000
    );
    await fetchTelemetry();
  }, [fetchTelemetry]);

  return (
    <TelemetryContext.Provider
      value={{
        sensors,
        sensorSources,
        systemMeta,
        actuators,
        history,
        alerts,
        backendConnected,
        toggleActuator,
        setActuatorState,
        dispenseFeed,
        feedActive,
        setAnomaly,
        anomalyMode,
        lastActuatorError,
        clearActuatorError,
        actuatorToast,
        clearActuatorToast,
        showActuatorToast,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
