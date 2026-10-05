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

const BACKEND_BASE = "http://localhost:3000";

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

  // Client-side organic drift simulation fallback
  const stepSimulation = useCallback(() => {
    setSensors((prev) => {
      let targetPH = 6.98;
      let targetTemp = 24.3;
      let targetTDS = 540;

      if (anomalyMode === "ph_drop") targetPH = 5.82;
      if (anomalyMode === "heatwave") targetTemp = 30.2;
      if (anomalyMode === "tds_spike") targetTDS = 1120;

      const ph = Number((prev.ph + (targetPH - prev.ph) * 0.12 + (Math.random() - 0.5) * 0.03).toFixed(2));
      const waterTemperature = Number((prev.waterTemperature + (targetTemp - prev.waterTemperature) * 0.08 + (Math.random() - 0.5) * 0.08).toFixed(1));
      const tds = Math.round(prev.tds + (targetTDS - prev.tds) * 0.12 + (Math.random() - 0.5) * 5);
      const airTemperature = Number((27.0 + (waterTemperature - 24.0) * 0.35 + (Math.random() - 0.5) * 0.15).toFixed(1));
      const humidity = Number((65.0 - (airTemperature - 25.0) * 1.2 + (Math.random() - 0.5) * 1.2).toFixed(1));

      const isAeratorOn = actuators.aerator?.isOn ?? true;
      const targetDO = isAeratorOn ? 7.35 : 4.4;
      const dissolvedOxygen = Number(Math.max(2.0, Math.min(9.5, prev.dissolvedOxygen + (targetDO - prev.dissolvedOxygen) * 0.12 + (Math.random() - 0.5) * 0.04)).toFixed(2));

      const isLightOn = actuators.growLight?.isOn ?? false;
      const baseLight = isLightOn ? 2450 : 620;
      const lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 50);

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
    try {
      const res = await fetch(`${BACKEND_BASE}/api/sensors/current`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json = await res.json();
        setBackendConnected(true);
        if (json.sensors) setSensors(json.sensors);
        if (json.actuators) setActuators((prev) => ({ ...prev, ...json.actuators }));
        if (json.system?.anomalyMode) setAnomalyMode(json.system.anomalyMode);
        return;
      }
    } catch {
      setBackendConnected(false);
    }
    stepSimulation();
  }, [stepSimulation]);

  // Initial history load
  useEffect(() => {
    async function loadInit() {
      try {
        const res = await fetch(`${BACKEND_BASE}/api/sensors/history`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setHistory(json.data);
            return;
          }
        }
      } catch {
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
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const toggleActuator = async (id: string) => {
    const target = actuators[id];
    const newState = !target.isOn;
    setActuators((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOn: newState },
    }));

    if (backendConnected) {
      try {
        await fetch(`${BACKEND_BASE}/api/actuators/${id}/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const dispenseFeed = () => {
    setFeedActive(true);
    setAlerts((prev) => [
      {
        id: `feed-${Date.now()}`,
        title: "Pemberian Pakan Manual",
        message: "35g pelet bernutrisi tinggi didistribusikan ke kolam Nila & Lele.",
        time: "Baru saja",
        severity: "info",
        isResolved: true,
      },
      ...prev,
    ]);
    setTimeout(() => setFeedActive(false), 2500);
  };

  const setAnomaly = async (type: string) => {
    setAnomalyMode(type);
    if (backendConnected) {
      try {
        await fetch(`${BACKEND_BASE}/api/simulation/anomaly`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
      } catch (err) {
        console.error(err);
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
