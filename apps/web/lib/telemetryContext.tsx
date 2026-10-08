"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SensorData, ActuatorState, HistorySample, AlertNotification } from "./types";

interface TelemetryContextType {
  sensors: SensorData;
  actuators: Record<string, ActuatorState>;
  history: HistorySample[];
  alerts: AlertNotification[];
  backendConnected: boolean;
  toggleActuator: (id: string) => Promise<void>;
  dispenseFeed: () => void;
  feedActive: boolean;
  setAnomaly: (type: string) => Promise<void>;
  anomalyMode: string;
}

const API_ENDPOINTS = [
  "", // 1. Next.js proxy rewrite (same-origin /api/...)
  "http://localhost:3000", // 2. Direct backend localhost
  "https://tremendous-finger-live-chance.trycloudflare.com", // 3. Cloudflare tunnel fallback
];

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.94,
    tds: 540,
    waterTemperature: 24.3,
    airTemperature: 27.2,
    humidity: 65.4,
    lightIntensity: 680,
    dissolvedOxygen: 7.32,
    waterLevel: 92.4,
  });

  const [actuators, setActuators] = useState<Record<string, ActuatorState>>({
    waterPump: {
      id: "waterPump",
      name: "Sirkulasi Pompa Air 12V",
      code: "RELAY-01",
      type: "pump",
      isOn: true,
      powerWatts: 45,
      voltage: "12V DC",
    },
    aerator: {
      id: "aerator",
      name: "Aerator Oksigen Nila (DO Booster)",
      code: "RELAY-02",
      type: "aerator",
      isOn: true,
      powerWatts: 18,
      voltage: "12V DC",
    },
    growLight: {
      id: "growLight",
      name: "LED Grow Light Fotosintesis",
      code: "RELAY-03",
      type: "light",
      isOn: false,
      powerWatts: 85,
      voltage: "12V DC",
    },
    feeder: {
      id: "feeder",
      name: "Feeder Otomatis Terjadwal",
      code: "RELAY-04",
      type: "feeder",
      isOn: true,
      powerWatts: 12,
      voltage: "12V DC",
    },
  });

  const [history, setHistory] = useState<HistorySample[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: "alt-1",
      title: "pH Air Terjaga Optimal",
      message: "Kadar pH air stabil pada 6.94 (rentang aman 6.5 - 7.5)",
      time: "10:30",
      severity: "info",
      isResolved: true,
    },
    {
      id: "alt-2",
      title: "Pompa Sirkulasi Aktif",
      message: "Resirkulasi tertutup berjalan normal dengan debit 4.2 L/min",
      time: "07:00",
      severity: "info",
      isResolved: true,
    },
    {
      id: "alt-3",
      title: "Pakan Ikan Pagi Keluar",
      message: "35g pelet terapung berhasil didistribusikan ke kolam Level 3 & Level 1",
      time: "06:00",
      severity: "info",
      isResolved: true,
    },
  ]);

  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [anomalyMode, setAnomalyMode] = useState<string>("none");
  const [feedActive, setFeedActive] = useState<boolean>(false);

  // Client-side organic drift simulation fallback when backend is unreachable
  const stepSimulation = useCallback(() => {
    setSensors((prev) => {
      let targetPH = 6.98;
      let targetTemp = 24.3;
      let targetTDS = 540;

      if (anomalyMode === "ph_drop") targetPH = 5.82;
      if (anomalyMode === "heatwave") targetTemp = 30.2;
      if (anomalyMode === "tds_spike") targetTDS = 1120;

      const ph = Number((prev.ph + (targetPH - prev.ph) * 0.03 + (Math.random() - 0.5) * 0.005).toFixed(2));
      const waterTemperature = Number((prev.waterTemperature + (targetTemp - prev.waterTemperature) * 0.02 + (Math.random() - 0.5) * 0.012).toFixed(1));
      const tds = Math.round(prev.tds + (targetTDS - prev.tds) * 0.03 + (Math.random() - 0.5) * 0.8);
      const airTemperature = Number((27.0 + (waterTemperature - 24.0) * 0.35 + (Math.random() - 0.5) * 0.04).toFixed(1));
      const humidity = Number((65.0 - (airTemperature - 25.0) * 1.2 + (Math.random() - 0.5) * 0.3).toFixed(1));

      const isAeratorOn = actuators.aerator?.isOn ?? true;
      const targetDO = isAeratorOn ? 7.35 : 4.4;
      const dissolvedOxygen = Number(Math.max(2.0, Math.min(9.5, prev.dissolvedOxygen + (targetDO - prev.dissolvedOxygen) * 0.04 + (Math.random() - 0.5) * 0.008)).toFixed(2));

      const isLightOn = actuators.growLight?.isOn ?? false;
      const baseLight = isLightOn ? 2450 : 620;
      const lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 8);

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
        ...prevH.slice(-30),
        {
          timestamp: new Date().toISOString(),
          sensors: newSample,
          actuators: Object.fromEntries(Object.entries(actuators).map(([k, v]) => [k, v.isOn])),
        },
      ]);

      return newSample;
    });
  }, [actuators, anomalyMode]);

  // Sync with Elysia backend
  const fetchTelemetry = useCallback(async () => {
    let connected = false;

    for (const base of API_ENDPOINTS) {
      try {
        const res = await fetch(`${base}/api/sensors/current`, {
          cache: "no-store",
          signal: AbortSignal.timeout(2000),
        });

        if (res.ok) {
          const json = await res.json();
          connected = true;
          setBackendConnected(true);

          if (json.sensors) {
            setSensors(json.sensors);
            // Append incoming live reading to history for real-time spline graphs
            setHistory((prevH) => [
              ...prevH.slice(-35),
              {
                timestamp: json.timestamp || new Date().toISOString(),
                sensors: json.sensors,
                actuators: Object.fromEntries(
                  Object.entries(json.actuators || {}).map(([k, v]: [string, any]) => [k, v.isOn])
                ),
              },
            ]);
          }

          if (json.actuators) {
            setActuators((prev) => {
              const updated = { ...prev };
              Object.entries(json.actuators).forEach(([id, act]: [string, any]) => {
                updated[id] = {
                  id,
                  name: act.name || updated[id]?.name || id,
                  code: act.code || updated[id]?.code || (id === "waterPump" ? "RELAY-01" : id === "aerator" ? "RELAY-02" : id === "growLight" ? "RELAY-03" : id === "feeder" ? "RELAY-04" : "RELAY-05"),
                  type: act.type || updated[id]?.type || "pump",
                  isOn: act.isOn,
                  powerWatts: act.powerWatts || updated[id]?.powerWatts || 20,
                  voltage: act.voltage || updated[id]?.voltage || "12V DC",
                };
              });
              return updated;
            });
          }

          if (json.alerts && Array.isArray(json.alerts) && json.alerts.length > 0) {
            setAlerts(json.alerts.map((a: any) => ({
              id: a.id || `alt-${Date.now()}`,
              title: a.metric ? `Peringatan ${a.metric.toUpperCase()}` : "Alert Sistem",
              message: a.message,
              time: new Date(a.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              severity: a.severity || "warning",
              isResolved: a.isResolved ?? false,
            })));
          }

          if (json.system?.anomalyMode) {
            setAnomalyMode(json.system.anomalyMode);
          }

          break; // Successfully fetched from this endpoint
        }
      } catch {
        // try next endpoint
      }
    }

    if (!connected) {
      setBackendConnected(false);
      stepSimulation();
    }
  }, [stepSimulation]);

  // Initial history load
  useEffect(() => {
    async function loadInit() {
      let loaded = false;
      for (const base of API_ENDPOINTS) {
        try {
          const res = await fetch(`${base}/api/sensors/history`, { signal: AbortSignal.timeout(2000) });
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.length > 0) {
              setHistory(json.data);
              loaded = true;
              break;
            }
          }
        } catch {
          // try next
        }
      }

      if (!loaded) {
        const starter: HistorySample[] = [];
        const baseNow = Date.now();
        for (let i = 20; i >= 0; i--) {
          starter.push({
            timestamp: new Date(baseNow - i * 15000).toISOString(),
            sensors: {
              ph: Number((6.94 + Math.sin(i * 0.25) * 0.15).toFixed(2)),
              tds: Math.round(540 + Math.cos(i * 0.15) * 15),
              waterTemperature: Number((24.3 + Math.sin(i * 0.15) * 0.4).toFixed(1)),
              airTemperature: 27.2,
              humidity: 65.5,
              lightIntensity: 660,
              dissolvedOxygen: Number((7.3 + Math.cos(i * 0.2) * 0.2).toFixed(2)),
              waterLevel: 92.4,
            },
            actuators: { waterPump: true, aerator: true, growLight: false, feeder: true },
          });
        }
        setHistory(starter);
      }
    }
    loadInit();
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const toggleActuator = async (id: string) => {
    // 1. Optimistic UI update
    setActuators((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], isOn: !prev[id].isOn },
      };
    });

    // 2. Dispatch network toggle to backend
    for (const base of API_ENDPOINTS) {
      try {
        const res = await fetch(`${base}/api/actuators/${id}/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) break;
      } catch {
        // try next
      }
    }
  };

  const dispenseFeed = async () => {
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
      ...prev,
    ]);

    for (const base of API_ENDPOINTS) {
      try {
        const res = await fetch(`${base}/api/feed/dispense`, {
          method: "POST",
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) break;
      } catch {
        // try next
      }
    }

    setTimeout(() => setFeedActive(false), 2500);
  };

  const setAnomaly = async (type: string) => {
    setAnomalyMode(type);
    for (const base of API_ENDPOINTS) {
      try {
        const res = await fetch(`${base}/api/simulation/anomaly`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) break;
      } catch {
        // try next
      }
    }
  };

  return (
    <TelemetryContext.Provider
      value={{
        sensors,
        actuators,
        history,
        alerts,
        backendConnected,
        toggleActuator,
        dispenseFeed,
        feedActive,
        setAnomaly,
        anomalyMode,
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
