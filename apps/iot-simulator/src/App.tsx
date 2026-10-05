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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Industrial Header */}
      <HeaderBar
        isConnected={isConnected}
        totalPower={totalPower}
        onReset={handleReset}
      />

      {/* Main Grid: Schematic on Left/Top, Sensors on Right */}
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

      {/* Live Stream Inspector / Packet Log */}
      <footer className="p-4 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-xs mono text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>PAYLOAD: pH={sensors.ph} | TDS={sensors.tds}ppm | Temp={sensors.waterTemperature}°C | DO={sensors.dissolvedOxygen}mg/L</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>ESP32 DEV: VIRTUAL-UART-COM3</span>
          <span>•</span>
          <span className="text-emerald-400">BAUD 115200</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
