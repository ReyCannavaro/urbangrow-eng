import React from 'react';
import type { SensorState, ScenarioPreset } from '../types';
import { Sliders, Sparkles } from 'lucide-react';

interface SensorControlPanelProps {
  sensors: SensorState;
  onChangeSensor: (key: keyof SensorState, value: number) => void;
  onApplyPreset: (preset: ScenarioPreset) => void;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'normal',
    title: '🌿 Ekuilibrium Normal',
    icon: '✨',
    description: 'Kondisi ideal akuaponik (pH 7.0, Suhu 24.5°C, DO 7.4 mg/L)',
    sensors: {
      ph: 7.0,
      tds: 540,
      waterTemperature: 24.5,
      dissolvedOxygen: 7.4,
      lightIntensity: 750,
      waterLevel: 92,
    },
  },
  {
    id: 'heatwave',
    title: '🔥 Gelombang Panas',
    icon: '☀️',
    description: 'Suhu air melonjak 31.5°C, oksigen terlarut drop ke 4.2 mg/L',
    sensors: {
      waterTemperature: 31.5,
      airTemperature: 34.0,
      dissolvedOxygen: 4.2,
      lightIntensity: 2600,
    },
  },
  {
    id: 'acid_drop',
    title: '⚠️ Drop pH Asidosis',
    icon: '🧪',
    description: 'pH air anjlok ke 5.4, memicu peringatan darurat ke HP',
    sensors: {
      ph: 5.4,
    },
  },
  {
    id: 'tds_spike',
    title: '📈 Lonjakan TDS Nutrisi',
    icon: '🌾',
    description: 'TDS pekat melonjak ke 1250 ppm',
    sensors: {
      tds: 1250,
    },
  },
  {
    id: 'night',
    title: '🌑 Simulasi Malam Gelap',
    icon: '🌙',
    description: 'Cahaya 0 lux, memicu aktivasi LED Grow Light otomatis',
    sensors: {
      lightIntensity: 0,
      airTemperature: 23.0,
    },
  },
  {
    id: 'leakage',
    title: '💧 Krisis Air Bocor',
    icon: '🚨',
    description: 'Water level anjlok ke 28%, memicu interlock pompa mati',
    sensors: {
      waterLevel: 28,
    },
  },
];

export const SensorControlPanel: React.FC<SensorControlPanelProps> = ({
  sensors,
  onChangeSensor,
  onApplyPreset,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-[#223048] shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-amber-400" />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Sensor Injection & Skenario Lingkungan
          </h2>
        </div>
        <span className="mono text-xs text-slate-400">
          REAL-TIME TELEMETRY OVERRIDE
        </span>
      </div>

      {/* Preset Scenario Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Preset Skenario Cepat (Uji Respon HP Kamu):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-400/50 text-left transition cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {preset.title}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4 pt-2">
        <div className="text-xs text-slate-300 font-semibold">
          Fine-Tuning Parameter Sensor Individual:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* pH Sensor Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">1. Sensor pH Air (PH-4502C)</span>
              <span className={`mono text-xs font-bold px-2 py-0.5 rounded ${
                sensors.ph >= 6.5 && sensors.ph <= 7.5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {sensors.ph.toFixed(2)} pH
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="10.0"
              step="0.05"
              value={sensors.ph}
              onChange={(e) => onChangeSensor('ph', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span>Asam (4.0)</span>
              <span className="text-emerald-400 font-semibold">Ideal (6.5 - 7.5)</span>
              <span>Basa (10.0)</span>
            </div>
          </div>

          {/* Water Temperature Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">2. DS18B20 Suhu Air Kolam</span>
              <span className={`mono text-xs font-bold px-2 py-0.5 rounded ${
                sensors.waterTemperature <= 28.0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {sensors.waterTemperature.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="18.0"
              max="36.0"
              step="0.2"
              value={sensors.waterTemperature}
              onChange={(e) => onChangeSensor('waterTemperature', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span>Dingin (18°C)</span>
              <span className="text-cyan-400 font-semibold">Target (24 - 28°C)</span>
              <span>Panas (36°C)</span>
            </div>
          </div>

          {/* TDS Sensor Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">3. Analog TDS Meter (Nutrisi)</span>
              <span className="mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                {sensors.tds} ppm
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="10"
              value={sensors.tds}
              onChange={(e) => onChangeSensor('tds', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span>Rendah (200 ppm)</span>
              <span className="text-amber-400 font-semibold">Normal (500 - 800 ppm)</span>
              <span>Pekat (1500 ppm)</span>
            </div>
          </div>

          {/* Dissolved Oxygen Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">4. Oksigen Terlarut (DO Nila)</span>
              <span className={`mono text-xs font-bold px-2 py-0.5 rounded ${
                sensors.dissolvedOxygen >= 5.0 ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {sensors.dissolvedOxygen.toFixed(2)} mg/L
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="10.0"
              step="0.1"
              value={sensors.dissolvedOxygen}
              onChange={(e) => onChangeSensor('dissolvedOxygen', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span className="text-rose-400">Hipoksia (&lt;5.0)</span>
              <span className="text-sky-400 font-semibold">Ideal (&gt;6.0 mg/L)</span>
              <span>Jenuh (10.0)</span>
            </div>
          </div>

          {/* Light Intensity Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">5. BH1750 Intensitas Cahaya</span>
              <span className="mono text-xs font-bold text-yellow-400 px-2 py-0.5 rounded bg-yellow-500/10">
                {sensors.lightIntensity} LUX
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="25"
              value={sensors.lightIntensity}
              onChange={(e) => onChangeSensor('lightIntensity', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span>Malam (0)</span>
              <span>Ruangan (600)</span>
              <span className="text-yellow-400">Terik (3000 lux)</span>
            </div>
          </div>

          {/* Water Level Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">6. Water Level Sensor Tandon</span>
              <span className={`mono text-xs font-bold px-2 py-0.5 rounded ${
                sensors.waterLevel >= 50 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {sensors.waterLevel.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={sensors.waterLevel}
              onChange={(e) => onChangeSensor('waterLevel', parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-[10px] mono text-slate-500">
              <span className="text-rose-400">Bocor (&lt;30%)</span>
              <span className="text-cyan-400 font-semibold">Penuh (85 - 95%)</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
