import { useState, useEffect, useCallback, useRef } from 'react';
import type { SensorState, ActuatorItem, ScenarioPreset } from '../types';

const API_BASE = 'http://localhost:3000';

const DEFAULT_SENSORS: SensorState = {
  ph: 6.95,
  tds: 540,
  waterTemperature: 24.3,
  airTemperature: 27.2,
  humidity: 65.4,
  lightIntensity: 680,
  dissolvedOxygen: 7.32,
  waterLevel: 92.4,
};

const DEFAULT_ACTUATORS: Record<string, ActuatorItem> = {
  waterPump: {
    id: 'waterPump',
    name: 'Sirkulasi Pompa Air 12V',
    type: 'pump',
    isOn: true,
    powerWatts: 45,
  },
  aerator: {
    id: 'aerator',
    name: 'Aerator Oksigen Nila',
    type: 'aerator',
    isOn: true,
    powerWatts: 18,
  },
  growLight: {
    id: 'growLight',
    name: 'LED Grow Light Fotosintesis',
    type: 'light',
    isOn: false,
    powerWatts: 85,
  },
  feeder: {
    id: 'feeder',
    name: 'Feeder Otomatis',
    type: 'feeder',
    isOn: true,
    powerWatts: 12,
  },
};

export function useTelemetrySync() {
  const [sensors, setSensors] = useState<SensorState>(DEFAULT_SENSORS);
  const [actuators, setActuators] = useState<Record<string, ActuatorItem>>(DEFAULT_ACTUATORS);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isOverridingRef = useRef<boolean>(false);

  // Poll current backend state to catch actuator toggles from Flutter Mobile
  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sensors/current`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json = await res.json();
        setIsConnected(true);

        // Update actuators from backend (so when HP toggles relay, simulator immediately animates!)
        if (json.actuators) {
          setActuators((prev) => ({
            ...prev,
            ...json.actuators,
          }));
        }

        // Only update sensors from backend if user isn't currently dragging a slider
        if (!isOverridingRef.current && json.sensors) {
          setSensors(json.sensors);
        }
      }
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 4000);
    return () => clearInterval(interval);
  }, [fetchCurrent]);

  // Push sensor change to backend
  const pushSensorOverride = async (updated: Partial<SensorState>) => {
    isOverridingRef.current = true;
    try {
      await fetch(`${API_BASE}/api/simulation/sensor-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to override sensor:', err);
    } finally {
      // Release override lock after 3 seconds of inactivity
      setTimeout(() => {
        isOverridingRef.current = false;
      }, 3000);
    }
  };

  const handleSensorChange = (key: keyof SensorState, value: number) => {
    setSensors((prev) => {
      const next = { ...prev, [key]: value };
      pushSensorOverride({ [key]: value });
      return next;
    });
  };

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setSensors((prev) => {
      const next = { ...prev, ...preset.sensors };
      pushSensorOverride(preset.sensors);
      return next;
    });
  };

  const handleToggleActuator = async (id: string) => {
    const act = actuators[id];
    if (!act) return;

    // Optimistic toggle
    setActuators((prev) => ({
      ...prev,
      [id]: { ...act, isOn: !act.isOn },
    }));

    try {
      await fetch(`${API_BASE}/api/actuators/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Failed to toggle actuator:', err);
    }
  };

  const handleReset = () => {
    handleApplyPreset({
      id: 'normal',
      title: 'Normal',
      icon: '✨',
      description: 'Reset',
      sensors: DEFAULT_SENSORS,
    });
  };

  return {
    sensors,
    actuators,
    isConnected,
    handleSensorChange,
    handleApplyPreset,
    handleToggleActuator,
    handleReset,
  };
}
