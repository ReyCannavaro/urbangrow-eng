import { useTelemetrySync } from './hooks/useTelemetrySync';
import { HeaderBar } from './components/HeaderBar';
import { HardwareSchematic } from './components/HardwareSchematic';
import { SensorControlPanel } from './components/SensorControlPanel';
import { RelayStatusPanel } from './components/RelayStatusPanel';
import { Terminal } from 'lucide-react';

export function App() {
  const {
    sensors,
    actuators,
    isConnected,
    handleSensorChange,
    handleApplyPreset,
    handleToggleActuator,
    handleReset,
  } = useTelemetrySync();

  const totalPower = Object.values(actuators).reduce(
    (acc, a) => acc + (a.isOn ? a.powerWatts : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F3EFE6] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Outer Rounded Console Container (Matching Web Dashboard Frame) */}
      <div className="w-full max-w-[1480px] bg-[#FAF8F3] rounded-[32px] sm:rounded-[38px] border border-stone-200/80 p-5 sm:p-7 lg:p-10 shadow-2xl shadow-stone-900/5 relative overflow-hidden sunlit-radial-glow space-y-6">
        {/* Floating Navigation & Status Bar */}
        <HeaderBar
          isConnected={isConnected}
          totalPower={totalPower}
          onReset={handleReset}
        />

        {/* Main Grid: Schematic on Left, Sensors on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Hardware Schematic (Visual Output) */}
          <div className="lg:col-span-6">
            <HardwareSchematic sensors={sensors} actuators={actuators} />
          </div>

          {/* Sensor Injection Sliders (Input) */}
          <div className="lg:col-span-6">
            <SensorControlPanel
              sensors={sensors}
              onChangeSensor={handleSensorChange}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        </div>

        {/* 4-Channel Relay Actuators Panel */}
        <RelayStatusPanel
          actuators={actuators}
          onToggleActuator={handleToggleActuator}
        />

        {/* Live Stream Inspector / Editorial Footer */}
        <footer className="mt-8 pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-600" />
            <span>
              LIVE INJECTION: pH={sensors.ph.toFixed(2)} • TDS={sensors.tds}ppm • Suhu={sensors.waterTemperature.toFixed(1)}°C • DO={sensors.dissolvedOxygen.toFixed(2)}mg/L
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>REGU MAWAR // SMK TELKOM SIDOARJO</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">ESP32 EDGE SIMULATOR ACTIVE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
