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

interface ActuatorActionResult {
  ok: boolean;
  error?: string;
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

function hasAnyNumericSensor(s: SensorData | undefined): boolean {
  if (!s) return false;
  return Object.values(s).some((v) => typeof v === "number" && Number.isFinite(v));
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<SensorData>(ALL_NULL_SENSORS);

  const [sensorSources, setSensorSources] = useState<SensorSourcesMap>(DEFAULT_SENSOR_SOURCES);
  const [systemMeta, setSystemMeta] = useState<IoTSystemMeta>(DEFAULT_SYSTEM_META);

  const [actuators, setActuators] = useState<Record<string, ActuatorState>>({
    waterPump: {
      id: "waterPump",
      name: "Sirkulasi Pompa Air 12V",
      code: "RELAY-01",
      type: "pump",
      isOn: true,
      mode: "auto",
      powerWatts: 45,
      voltage: "12V DC",
    },
    aerator: {
      id: "aerator",
      name: "Aerator Oksigen Nila (DO Booster)",
      code: "RELAY-02",
      type: "aerator",
      isOn: true,
      mode: "auto",
      powerWatts: 18,
      voltage: "12V DC",
    },
    growLight: {
      id: "growLight",
      name: "LED Grow Light Fotosintesis",
      code: "RELAY-03",
      type: "light",
      isOn: false,
      mode: "auto",
      powerWatts: 85,
      voltage: "12V DC",
    },
    feeder: {
      id: "feeder",
      name: "Feeder Otomatis Terjadwal",
      code: "RELAY-04",
      type: "feeder",
      isOn: true,
      mode: "auto",
      powerWatts: 12,
      voltage: "12V DC",
    },
    dosingPump: {
      id: "dosingPump",
      name: "pH Buffer Dosing Pump",
      code: "RELAY-05",
      type: "dosing",
      isOn: false,
      mode: "auto",
      powerWatts: 12,
      voltage: "12V DC",
    },
  });

  const [history, setHistory] = useState<HistorySample[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [anomalyMode, setAnomalyMode] = useState<string>("none");
  const [feedActive, setFeedActive] = useState<boolean>(false);
  const [lastActuatorError, setLastActuatorError] = useState<string | null>(null);
  const wsConnectedRef = useRef<boolean>(false);

  const clearActuatorError = useCallback(() => {
    setLastActuatorError(null);
  }, []);

  const applyBackendSnapshot = useCallback((json: BackendTelemetrySnapshot) => {
    if (!json || typeof json !== "object") return;

    setBackendConnected(true);

    const incomingSensors = json.sensors;
    if (incomingSensors) {
      setSensors(incomingSensors);
      if (hasAnyNumericSensor(incomingSensors)) {
        setHistory((prevH) => {
          const ts = json.timestamp || new Date().toISOString();
          const last = prevH[prevH.length - 1];
          if (last && last.timestamp === ts) {
            return prevH;
          }
          return [
            ...prevH.slice(-59),
            {
              timestamp: ts,
              sensors: incomingSensors,
              actuators: Object.fromEntries(
                Object.entries(json.actuators || {}).map(([k, v]) => [k, Boolean(v?.isOn)])
              ),
            },
          ];
        });
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
      setActuators((prev) => {
        const updated = { ...prev };
        Object.entries(json.actuators || {}).forEach(([id, act]) => {
          updated[id] = {
            id,
            name: act.name || updated[id]?.name || id,
            code:
              act.code ||
              updated[id]?.code ||
              (id === "waterPump"
                ? "RELAY-01"
                : id === "aerator"
                ? "RELAY-02"
                : id === "growLight"
                ? "RELAY-03"
                : id === "feeder"
                ? "RELAY-04"
                : "RELAY-05"),
            type: act.type || updated[id]?.type || "pump",
            isOn: Boolean(act.isOn),
            mode: act.mode || updated[id]?.mode || "auto",
            powerWatts: act.powerWatts || updated[id]?.powerWatts || 20,
            voltage: act.voltage || updated[id]?.voltage || "12V DC",
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

  // Initial and periodic database history load from VPS SQLite
  useEffect(() => {
    let cancelled = false;
    async function loadHistoryFromDatabase() {
      const res = await fetchFromBackend<{ data?: HistorySample[] }>("/api/sensors/history", {}, 3000);
      if (!cancelled && res.ok && Array.isArray(res.data?.data)) {
        setHistory(res.data.data);
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

      // 1. Optimistic UI update
      setActuators((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], isOn: optimisticNext },
        };
      });

      // 2. Dispatch request to backend
      const res = await fetchFromBackend<{ success?: boolean; message?: string; actuator?: ActuatorState }>(
        path,
        init,
        3000
      );

      if (res.reached && !res.ok) {
        const errMsg = res.data?.message || `Perintah aktuator '${id}' ditolak sistem keamanan (${res.status}).`;
        // Roll back optimistic toggle when safety interlock rejects command
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
        return { ok: false, error: errMsg };
      }

      if (res.ok && res.data?.actuator) {
        const serverAct = res.data.actuator;
        setActuators((prev) => ({
          ...prev,
          [serverAct.id]: {
            ...(prev[serverAct.id] || serverAct),
            ...serverAct,
          },
        }));
      }

      return { ok: true };
    },
    [actuators]
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
    setAlerts((prev) => [
      {
        id: `feed-${Date.now()}`,
        title: "Pemberian Pakan Manual",
        message: "35g pelet bernutrisi tinggi didistribusikan ke kolam Nila & Lele.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        severity: "info",
        isResolved: true,
      },
      ...prev.filter((a) => a.id !== "alt-3"),
    ]);

    await fetchFromBackend("/api/feed/dispense", { method: "POST" }, 3000);
    setTimeout(() => setFeedActive(false), 2500);
  }, []);

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
