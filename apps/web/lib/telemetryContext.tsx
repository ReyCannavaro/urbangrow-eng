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

const DEFAULT_SENSOR_SOURCES: SensorSourcesMap = {
  ph: "auto_dummy",
  tds: "auto_dummy",
  waterTemperature: "auto_dummy",
  airTemperature: "auto_dummy",
  humidity: "auto_dummy",
  lightIntensity: "auto_dummy",
  dissolvedOxygen: "auto_dummy",
  waterLevel: "auto_dummy",
};

const DEFAULT_SYSTEM_META: IoTSystemMeta = {
  status: "optimal",
  mode: "auto_dummy_simulation",
  anomalyMode: "none",
  uptimeSeconds: 0,
  edgeNode: "ESP32-GROW-01",
  edgeOnline: false,
  liveSensorCount: 0,
  lastTelemetryAt: null,
  wifiSignalDbm: -56,
};

const DEFAULT_INFO_ALERTS: AlertNotification[] = [
  {
    id: "alt-1",
    title: "pH Air Terjaga Optimal",
    message: "Kadar pH air stabil pada 6.95 (rentang aman 6.5 - 7.5)",
    time: "10:30",
    severity: "info",
    isResolved: true,
  },
  {
    id: "alt-2",
    title: "Pompa Sirkulasi Aktif",
    message: "Resirkulasi tertutup berjalan normal menuju talang NFT Level 4",
    time: "07:00",
    severity: "info",
    isResolved: true,
  },
  {
    id: "alt-3",
    title: "Node Sensor ESP32 Tersinkronisasi",
    message: "Gateway telemetri menerima aliran data sensor real-time dari node ESP32-GROW-01.",
    time: "06:00",
    severity: "info",
    isResolved: true,
  },
];

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

function generateInitialHistory(): HistorySample[] {
  const now = Date.now();
  const samples: HistorySample[] = [];
  for (let i = 45; i >= 0; i--) {
    const t = new Date(now - i * 1500);
    const wave = Math.sin((45 - i) * 0.2);
    const cosWave = Math.cos((45 - i) * 0.15);
    samples.push({
      timestamp: t.toISOString(),
      sensors: {
        ph: Number((6.95 + wave * 0.07 + (Math.random() - 0.5) * 0.02).toFixed(2)),
        waterTemperature: Number((24.2 + cosWave * 0.3 + (Math.random() - 0.5) * 0.05).toFixed(1)),
        tds: Math.round(540 + wave * 10 + (Math.random() - 0.5) * 3),
        dissolvedOxygen: Number((7.25 - wave * 0.18 + (Math.random() - 0.5) * 0.03).toFixed(2)),
        airTemperature: Number((27.1 + cosWave * 0.4).toFixed(1)),
        humidity: Number((65.2 - wave * 1.5).toFixed(1)),
        lightIntensity: Math.round(680 + wave * 30),
        waterLevel: 92.4,
      },
      actuators: {
        waterPump: true,
        aerator: true,
        growLight: false,
        feeder: true,
        dosingPump: false,
      },
    });
  }
  return samples;
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.95,
    tds: 540,
    waterTemperature: 24.3,
    airTemperature: 27.2,
    humidity: 65.4,
    lightIntensity: 680,
    dissolvedOxygen: 7.28,
    waterLevel: 92.4,
  });

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

  const [history, setHistory] = useState<HistorySample[]>(generateInitialHistory);
  const [alerts, setAlerts] = useState<AlertNotification[]>(DEFAULT_INFO_ALERTS);
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
      if (json.alerts.length > 0) {
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
      } else {
        setAlerts(DEFAULT_INFO_ALERTS);
      }
    }
  }, []);

  // Client-side organic drift simulation fallback only when backend is unreachable
  const stepSimulation = useCallback(() => {
    setSensors((prev) => {
      let targetPH = 6.98;
      let targetTemp = 24.3;
      let targetTDS = 540;

      if (anomalyMode === "ph_drop") targetPH = 5.82;
      if (anomalyMode === "heatwave") targetTemp = 30.2;
      if (anomalyMode === "tds_spike") targetTDS = 1120;

      const ph = Number((prev.ph + (targetPH - prev.ph) * 0.01 + (Math.random() - 0.5) * 0.002).toFixed(2));
      const waterTemperature = Number(
        (prev.waterTemperature + (targetTemp - prev.waterTemperature) * 0.008 + (Math.random() - 0.5) * 0.004).toFixed(1)
      );
      const tds = Math.round(prev.tds + (targetTDS - prev.tds) * 0.01 + (Math.random() - 0.5) * 0.3);
      const airTemperature = Number(
        (27.0 + (waterTemperature - 24.0) * 0.35 + (Math.random() - 0.5) * 0.015).toFixed(1)
      );
      const humidity = Number(
        (65.0 - (airTemperature - 25.0) * 1.2 + (Math.random() - 0.5) * 0.1).toFixed(1)
      );

      const isAeratorOn = actuators.aerator?.isOn ?? true;
      const targetDO = isAeratorOn ? 7.35 : 4.4;
      const dissolvedOxygen = Number(
        Math.max(
          2.0,
          Math.min(9.5, prev.dissolvedOxygen + (targetDO - prev.dissolvedOxygen) * 0.012 + (Math.random() - 0.5) * 0.003)
        ).toFixed(2)
      );

      const isLightOn = actuators.growLight?.isOn ?? false;
      const baseLight = isLightOn ? 2450 : 620;
      const lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 5);

      const newSample: SensorData = {
        ph,
        tds,
        waterTemperature,
        airTemperature,
        humidity,
        lightIntensity,
        dissolvedOxygen,
        waterLevel: 92.4,
      };

      setHistory((prevH) => [
        ...prevH.slice(-59),
        {
          timestamp: new Date().toISOString(),
          sensors: newSample,
          actuators: Object.fromEntries(Object.entries(actuators).map(([k, v]) => [k, v.isOn])),
        },
      ]);

      return newSample;
    });
  }, [actuators, anomalyMode]);

  // Sync with Elysia backend via HTTP
  const fetchTelemetry = useCallback(async () => {
    const res = await fetchFromBackend<BackendTelemetrySnapshot>("/api/sensors/current", {}, 2500);
    if (res.ok && res.data) {
      applyBackendSnapshot(res.data);
    } else if (!res.reached) {
      setBackendConnected(false);
      setSensorSources(DEFAULT_SENSOR_SOURCES);
      setSystemMeta((prev) => ({ ...prev, edgeOnline: false, liveSensorCount: 0 }));
      stepSimulation();
    }
  }, [applyBackendSnapshot, stepSimulation]);

  // Initial history load
  useEffect(() => {
    async function loadInit() {
      const res = await fetchFromBackend<{ data?: HistorySample[] }>("/api/sensors/history", {}, 2500);
      if (res.ok && res.data?.data && res.data.data.length > 0) {
        setHistory(res.data.data);
      }
    }
    void loadInit();
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
        setBackendConnected(false);
        setSensorSources(DEFAULT_SENSOR_SOURCES);
        setSystemMeta((prev) => ({ ...prev, edgeOnline: false, liveSensorCount: 0 }));
        stepSimulation();
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
  }, [applyBackendSnapshot, stepSimulation]);

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
