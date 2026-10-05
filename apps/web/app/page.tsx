"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Zap,
  Power,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Waves,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

interface SensorData {
  ph: number;
  tds: number;
  waterTemperature: number;
  airTemperature: number;
  humidity: number;
  lightIntensity: number;
  dissolvedOxygen: number;
  waterLevel: number;
}

interface Actuator {
  id: string;
  name: string;
  type: "pump" | "aerator" | "light" | "dosing";
  isOn: boolean;
  powerWatts: number;
}

interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  metric: string;
  message: string;
  timestamp: string;
}

interface HistoryPoint {
  timestamp: string;
  sensors: SensorData;
  actuators: Record<string, boolean>;
}

const BACKEND_BASE = "http://localhost:3000";

export default function Dashboard() {
  // Real-time sensor state
  const [sensors, setSensors] = useState<SensorData>({
    ph: 6.94,
    tds: 540,
    waterTemperature: 24.3,
    airTemperature: 27.2,
    humidity: 65.4,
    lightIntensity: 680,
    dissolvedOxygen: 7.3,
    waterLevel: 92.5,
  });

  const [actuators, setActuators] = useState<Record<string, Actuator>>({
    waterPump: {
      id: "waterPump",
      name: "Submersible Pump 12V",
      type: "pump",
      isOn: true,
      powerWatts: 45,
    },
    aerator: {
      id: "aerator",
      name: "Dual-Port Air Pump",
      type: "aerator",
      isOn: true,
      powerWatts: 18,
    },
    growLight: {
      id: "growLight",
      name: "Full-Spectrum LED Bar",
      type: "light",
      isOn: false,
      powerWatts: 85,
    },
    dosingPump: {
      id: "dosingPump",
      name: "pH Buffer Dosing Pump",
      type: "dosing",
      isOn: false,
      powerWatts: 12,
    },
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "ph" | "temp" | "tds" | "do">("all");
  const [anomalyMode, setAnomalyMode] = useState<string>("none");
  const [isActuatorBusy, setIsActuatorBusy] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);

  // Client-side fallback generative simulator in case backend is offline
  const fallbackStep = useCallback(() => {
    setSensors((prev) => {
      let targetPH = 7.0;
      let targetTemp = 24.4;
      let targetTDS = 540;

      if (anomalyMode === "ph_drop") targetPH = 5.8;
      if (anomalyMode === "heatwave") targetTemp = 30.2;
      if (anomalyMode === "tds_spike") targetTDS = 1100;

      const ph = Number(
        Math.max(4.5, Math.min(9.5, prev.ph + (targetPH - prev.ph) * 0.15 + (Math.random() - 0.5) * 0.04)).toFixed(2)
      );
      const waterTemperature = Number(
        (prev.waterTemperature + (targetTemp - prev.waterTemperature) * 0.1 + (Math.random() - 0.5) * 0.1).toFixed(1)
      );
      const tds = Math.round(prev.tds + (targetTDS - prev.tds) * 0.15 + (Math.random() - 0.5) * 6);
      const airTemperature = Number((27.0 + (waterTemperature - 24.0) * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(1));
      const humidity = Number((65.0 - (airTemperature - 25.0) * 1.5 + (Math.random() - 0.5) * 1.5).toFixed(1));

      const isAeratorOn = actuators.aerator?.isOn ?? true;
      const targetDO = isAeratorOn ? 7.4 : 4.4;
      const dissolvedOxygen = Number(
        Math.max(2.0, Math.min(9.5, prev.dissolvedOxygen + (targetDO - prev.dissolvedOxygen) * 0.15 + (Math.random() - 0.5) * 0.05)).toFixed(2)
      );

      const isLightOn = actuators.growLight?.isOn ?? false;
      const baseLight = isLightOn ? 2400 : 580;
      const lightIntensity = Math.round(baseLight + (Math.random() - 0.5) * 60);

      const newPoint: SensorData = {
        ph,
        tds,
        waterTemperature,
        airTemperature,
        humidity,
        lightIntensity,
        dissolvedOxygen,
        waterLevel: 92.4,
      };

      // Push to history
      setHistory((prevH) => {
        const nextH = [
          ...prevH,
          {
            timestamp: new Date().toISOString(),
            sensors: newPoint,
            actuators: Object.fromEntries(Object.entries(actuators).map(([k, v]) => [k, v.isOn])),
          },
        ];
        return nextH.slice(-30);
      });

      return newPoint;
    });

    setLastUpdated(new Date().toLocaleTimeString());
  }, [actuators, anomalyMode]);

  // Fetch telemetry from Elysia backend
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
        if (json.actuators) setActuators(json.actuators);
        if (json.alerts) setAlerts(json.alerts);
        if (json.system?.anomalyMode) setAnomalyMode(json.system.anomalyMode);
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      }
    } catch {
      // Backend is offline or unreachable, fall back gracefully
      setBackendConnected(false);
    }

    // Run fallback client simulator if backend unreachable
    if (autoSimulate) {
      fallbackStep();
    }
  }, [autoSimulate, fallbackStep]);

  // Initial history load
  useEffect(() => {
    async function loadInitialHistory() {
      try {
        const res = await fetch(`${BACKEND_BASE}/api/sensors/history`, {
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setHistory(json.data);
            return;
          }
        }
      } catch {
        // Fallback: generate 25 starter points for instant graph rendering
        const starter: HistoryPoint[] = [];
        const baseNow = Date.now();
        for (let i = 25; i >= 0; i--) {
          starter.push({
            timestamp: new Date(baseNow - i * 15000).toISOString(),
            sensors: {
              ph: Number((6.9 + Math.sin(i * 0.3) * 0.25).toFixed(2)),
              tds: Math.round(535 + Math.cos(i * 0.2) * 20),
              waterTemperature: Number((24.2 + Math.sin(i * 0.2) * 0.5).toFixed(1)),
              airTemperature: 27.1,
              humidity: 66.2,
              lightIntensity: 640,
              dissolvedOxygen: Number((7.2 + Math.cos(i * 0.25) * 0.3).toFixed(2)),
              waterLevel: 92.0,
            },
            actuators: { waterPump: true, aerator: true, growLight: false, dosingPump: false },
          });
        }
        setHistory(starter);
      }
    }

    loadInitialHistory();
  }, []);

  // Polling heartbeat (every 2 seconds)
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Toggle actuator (sends to backend or updates state locally)
  const handleToggleActuator = async (id: string) => {
    setIsActuatorBusy(id);
    try {
      if (backendConnected) {
        const res = await fetch(`${BACKEND_BASE}/api/actuators/${id}/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.actuator) {
            setActuators((prev) => ({ ...prev, [id]: json.actuator }));
          }
        }
      } else {
        // Optimistic client-side toggle
        setActuators((prev) => ({
          ...prev,
          [id]: { ...prev[id], isOn: !prev[id].isOn },
        }));
      }
    } catch (err) {
      console.error("Failed to toggle actuator", err);
    } finally {
      setIsActuatorBusy(null);
    }
  };

  // Inject or clear anomaly mode
  const handleSetAnomaly = async (type: string) => {
    setAnomalyMode(type);
    if (backendConnected) {
      try {
        await fetch(`${BACKEND_BASE}/api/simulation/anomaly`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
      } catch (err) {
        console.error("Failed to set simulation anomaly", err);
      }
    }
  };

  // Calculate dynamic alerts on frontend as well
  const displayAlerts = alerts.length > 0 ? alerts : [];
  if (displayAlerts.length === 0) {
    if (sensors.ph < 6.4) {
      displayAlerts.push({
        id: "alert-ph-low",
        severity: "critical",
        metric: "pH Level",
        message: `Low pH alert (${sensors.ph}). Water is becoming acidic. Nitrifying bacteria at risk!`,
        timestamp: "Just now",
      });
    } else if (sensors.ph > 7.6) {
      displayAlerts.push({
        id: "alert-ph-high",
        severity: "warning",
        metric: "pH Level",
        message: `High pH alert (${sensors.ph}). Micronutrient lockout warning for plant root uptake.`,
        timestamp: "Just now",
      });
    }

    if (sensors.waterTemperature > 28.5) {
      displayAlerts.push({
        id: "alert-temp-high",
        severity: "critical",
        metric: "Water Temperature",
        message: `High water temperature (${sensors.waterTemperature}°C). Rapid DO depletion threat.`,
        timestamp: "Just now",
      });
    }

    if (sensors.dissolvedOxygen < 5.0) {
      displayAlerts.push({
        id: "alert-do-low",
        severity: "critical",
        metric: "Dissolved Oxygen",
        message: `Hypoxia alert! DO is critically low (${sensors.dissolvedOxygen} mg/L). Turn aerator ON!`,
        timestamp: "Just now",
      });
    }
  }

  // Helper to compute SVG Sparkline path
  const renderChartPath = (metricKey: keyof SensorData, strokeColor: string, fillColor: string, minVal: number, maxVal: number) => {
    if (!history || history.length < 2) return null;
    const width = 680;
    const height = 180;
    const padding = 20;

    const points = history.map((pt, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - 2 * padding);
      const val = pt.sensors[metricKey] ?? minVal;
      const normalizedY = 1 - Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
      const y = padding + normalizedY * (height - 2 * padding);
      return { x, y, val };
    });

    const dLine = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, "");
    const dArea = `${dLine} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(1)} ${height - padding} Z`;

    return (
      <g>
        <path d={dArea} fill={fillColor} opacity={0.25} />
        <path d={dLine} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={5}
            fill={strokeColor}
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg lg:text-xl tracking-tight text-white">
                  URBANGROW <span className="text-emerald-400 font-medium text-xs tracking-wider uppercase bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full ml-1">AI-AQUAPONICS</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono">Autonomous Climate-Adaptive IoT System</p>
            </div>
          </div>

          {/* System Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {backendConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Elysia Backend (Port 3000)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Simulated Feed (Standby)</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>ESP32-NODE-01</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
              <span className="font-mono text-[11px]">{lastUpdated || "Streaming..."}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Backend Connect Notice if offline */}
        {!backendConnected && (
          <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900/60 to-emerald-950/50 border border-cyan-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-900/40 text-cyan-400 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Live Generative Mode Active</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Dashboard saat ini berjalan dengan data sensor generatif real-time. Untuk menghubungkan ke backend Elysia, jalankan perintah di bawah pada terminal:
                </p>
                <code className="inline-block mt-2 font-mono text-xs bg-black/60 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
                  moon run backend:dev
                </code>
              </div>
            </div>
            <button
              onClick={() => fetchTelemetry()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer whitespace-nowrap self-end md:self-auto"
            >
              Cek Koneksi Backend
            </button>
          </div>
        )}

        {/* System Alerts Banner (if any) */}
        {displayAlerts.length > 0 && (
          <div className="space-y-2">
            {displayAlerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  alt.severity === "critical"
                    ? "bg-rose-950/50 border-rose-600/40 text-rose-200"
                    : "bg-amber-950/50 border-amber-600/40 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 ${
                      alt.severity === "critical" ? "text-rose-400 animate-bounce" : "text-amber-400"
                    }`}
                  />
                  <span>
                    <strong className="uppercase tracking-wider font-semibold mr-1.5 font-mono">[{alt.severity}]</strong>
                    {alt.message}
                  </span>
                </div>
                {anomalyMode !== "none" && (
                  <button
                    onClick={() => handleSetAnomaly("none")}
                    className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-[11px] font-medium transition cursor-pointer"
                  >
                    Reset Kondisi
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 6 Hero Telemetry Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Water pH */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">Water pH</span>
              <Droplets className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.ph}</span>
                <span className="text-xs text-slate-400 font-mono">pH</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    sensors.ph < 6.5 || sensors.ph > 7.5 ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, ((sensors.ph - 4) / 6) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Safe: 6.5 - 7.5</span>
                <span className={sensors.ph >= 6.5 && sensors.ph <= 7.5 ? "text-emerald-400" : "text-rose-400"}>
                  {sensors.ph >= 6.5 && sensors.ph <= 7.5 ? "OPTIMAL" : "WARNING"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Water Temp */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">Water Temp</span>
              <Thermometer className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.waterTemperature}</span>
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    sensors.waterTemperature > 28 ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, ((sensors.waterTemperature - 15) / 20) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Safe: 22 - 27°C</span>
                <span className={sensors.waterTemperature <= 28 ? "text-cyan-400" : "text-rose-400"}>
                  {sensors.waterTemperature <= 28 ? "STABLE" : "OVERHEAT"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. TDS (Nutrients) */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">TDS Nutrients</span>
              <Activity className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.tds}</span>
                <span className="text-xs text-slate-400 font-mono">ppm</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (sensors.tds / 1000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Target: 400 - 800</span>
                <span className="text-teal-400">BALANCED</span>
              </div>
            </div>
          </div>

          {/* 4. Dissolved Oxygen */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">Dissolved O2</span>
              <Wind className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.dissolvedOxygen}</span>
                <span className="text-xs text-slate-400 font-mono">mg/L</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    sensors.dissolvedOxygen < 5.0 ? "bg-rose-500" : "bg-sky-400"
                  }`}
                  style={{ width: `${Math.min(100, (sensors.dissolvedOxygen / 9) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Safe: &gt; 6.0 mg/L</span>
                <span className={sensors.dissolvedOxygen >= 5.5 ? "text-sky-400" : "text-rose-400"}>
                  {sensors.dissolvedOxygen >= 5.5 ? "OXYGENATED" : "LOW O2"}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Light Intensity */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">Grow Light</span>
              <Sun className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.lightIntensity}</span>
                <span className="text-xs text-slate-400 font-mono">lux</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (sensors.lightIntensity / 3000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Spectrum: Photosyn</span>
                <span className={actuators.growLight?.isOn ? "text-amber-400" : "text-slate-400"}>
                  {actuators.growLight?.isOn ? "BOOST ON" : "AMBIENT"}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Humidity / Air */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase">Air & Humidity</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{sensors.humidity}</span>
                <span className="text-xs text-slate-400 font-mono">%</span>
              </div>
              <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-500 rounded-full"
                  style={{ width: `${sensors.humidity}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Air: {sensors.airTemperature}°C</span>
                <span className="text-indigo-400">NORMAL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid: Chart View & Actuator Control Hub */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Panel (Span 2 columns) */}
          <div className="lg:col-span-2 bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Real-Time Generative Telemetry Timeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Live sliding 30-sample historical window</p>
              </div>

              {/* Chart Metric Selectors */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "all" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("ph")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "ph" ? "bg-emerald-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  pH
                </button>
                <button
                  onClick={() => setActiveTab("temp")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "temp" ? "bg-cyan-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Water Temp
                </button>
                <button
                  onClick={() => setActiveTab("tds")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "tds" ? "bg-teal-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  TDS
                </button>
                <button
                  onClick={() => setActiveTab("do")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeTab === "do" ? "bg-sky-500 text-black font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  DO
                </button>
              </div>
            </div>

            {/* SVG Visual Graph Container */}
            <div className="relative w-full h-52 bg-[#090e1a]/90 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 680 180" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="20" y1="40" x2="660" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="90" x2="660" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="660" y2="140" stroke="#1e293b" strokeDasharray="3 3" />

                {(activeTab === "all" || activeTab === "ph") &&
                  renderChartPath("ph", "#10b981", "#10b981", 5.0, 9.0)}
                {(activeTab === "all" || activeTab === "temp") &&
                  renderChartPath("waterTemperature", "#06b6d4", "#06b6d4", 18.0, 32.0)}
                {(activeTab === "all" || activeTab === "tds") &&
                  renderChartPath("tds", "#14b8a6", "#14b8a6", 300, 1200)}
                {(activeTab === "all" || activeTab === "do") &&
                  renderChartPath("dissolvedOxygen", "#38bdf8", "#38bdf8", 3.0, 9.0)}
              </svg>

              {/* Legend overlay */}
              <div className="absolute bottom-2.5 left-4 flex items-center gap-4 text-[11px] font-mono bg-black/60 px-3 py-1 rounded-md border border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span> pH Level ({sensors.ph})
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Water Temp ({sensors.waterTemperature}°C)
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="h-2 w-2 rounded-full bg-teal-400"></span> TDS ({sensors.tds} ppm)
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-sky-400"></span> Dissolved O2 ({sensors.dissolvedOxygen} mg/L)
                </span>
              </div>
            </div>

            {/* Anomaly Generator Controls (Interactive Simulation) */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                  Generative Simulation Stress Tests:
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Active Mode: <strong className="text-emerald-400 uppercase">{anomalyMode}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleSetAnomaly("none")}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    anomalyMode === "none"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Normal Condition
                </button>
                <button
                  onClick={() => handleSetAnomaly("ph_drop")}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    anomalyMode === "ph_drop"
                      ? "bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  Drop pH (5.8)
                </button>
                <button
                  onClick={() => handleSetAnomaly("heatwave")}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    anomalyMode === "heatwave"
                      ? "bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                  Heatwave (30°C)
                </button>
                <button
                  onClick={() => handleSetAnomaly("tds_spike")}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    anomalyMode === "tds_spike"
                      ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  TDS Spike
                </button>
              </div>
            </div>
          </div>

          {/* Actuator Relay Control Center (Span 1 column) */}
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Power className="h-4 w-4 text-cyan-400" />
                    Actuator Control Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle hardware relay circuits</p>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-[10px] text-emerald-300 font-mono">
                  4 RELAYS ONLINE
                </div>
              </div>

              {/* Actuator Cards List */}
              <div className="space-y-3">
                {Object.values(actuators).map((act) => (
                  <div
                    key={act.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      act.isOn
                        ? "bg-slate-900/90 border-emerald-500/40 shadow-sm"
                        : "bg-slate-950/60 border-slate-800/80 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          act.isOn
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {act.type === "pump" && <Waves className="h-4 w-4" />}
                        {act.type === "aerator" && <Wind className="h-4 w-4" />}
                        {act.type === "light" && <Sun className="h-4 w-4" />}
                        {act.type === "dosing" && <Droplets className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{act.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-mono font-medium ${
                              act.isOn ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {act.isOn ? "RUNNING" : "STANDBY"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">• {act.powerWatts}W</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isActuatorBusy === act.id}
                      onClick={() => handleToggleActuator(act.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        act.isOn ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          act.isOn ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fish & Crop Bio-State Info Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Bio-Ecosystem Health
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">96.8% INDEX</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fish: <strong className="text-slate-200">Nile Tilapia (50 Units)</strong> in Tank A. Crops:{" "}
                <strong className="text-slate-200">Butterhead Lettuce (120 Pods)</strong> in Hydro-Bed B. Nitrogen cycle balanced.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
