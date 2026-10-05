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
    description: 'Kondisi ideal (pH 7.0, Suhu 24.5°C, DO 7.4 mg/L)',
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
    description: 'pH anjlok ke 5.4, memicu peringatan darurat ke HP',
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
    description: 'Water level anjlok ke 28%, memicu interlock pompa',
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
    <div className="rounded-[28px] bg-white border border-stone-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold tracking-tight text-stone-900">
            Injeksi Sensor & Skenario Lingkungan
          </h2>
        </div>
        <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-semibold">
          TELEMETRY OVERRIDE
        </span>
      </div>

      {/* Preset Scenario Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Preset Skenario Cepat (Uji Respon HP Kamu):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="p-3 rounded-2xl bg-[#FAF8F3] hover:bg-stone-100 border border-stone-200/80 hover:border-black text-left transition cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-semibold text-stone-900 group-hover:text-black">
                {preset.title}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3.5 pt-2 border-t border-stone-100">
        <div className="text-xs font-semibold text-stone-800">
          Fine-Tuning Parameter Sensor Individual:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* pH Sensor Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">1. pH Air (PH-4502C)</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  sensors.ph >= 6.5 && sensors.ph <= 7.5
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>Asam (4.0)</span>
              <span className="text-emerald-700 font-semibold">Ideal (6.5 - 7.5)</span>
              <span>Basa (10.0)</span>
            </div>
          </div>

          {/* Water Temperature Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">2. Suhu Air (DS18B20)</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  sensors.waterTemperature <= 28.0
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>Dingin (18°C)</span>
              <span className="text-sky-700 font-semibold">Target (24 - 28°C)</span>
              <span>Panas (36°C)</span>
            </div>
          </div>

          {/* TDS Sensor Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">3. Analog TDS Meter</span>
              <span className="text-xs font-mono font-bold text-amber-900 px-2 py-0.5 rounded-full bg-amber-100">
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>Rendah (200)</span>
              <span className="text-amber-800 font-semibold">Normal (500 - 800)</span>
              <span>Pekat (1500 ppm)</span>
            </div>
          </div>

          {/* Dissolved Oxygen Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">4. Oksigen Terlarut (DO)</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  sensors.dissolvedOxygen >= 5.0
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span className="text-rose-600">Hipoksia (&lt;5.0)</span>
              <span className="text-sky-700 font-semibold">Ideal (&gt;6.0 mg/L)</span>
              <span>Jenuh (10.0)</span>
            </div>
          </div>

          {/* Light Intensity Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">5. Intensitas Cahaya (BH1750)</span>
              <span className="text-xs font-mono font-bold text-amber-900 px-2 py-0.5 rounded-full bg-amber-100">
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>Malam (0)</span>
              <span>Ruangan (600)</span>
              <span className="text-amber-800">Terik (3000 lux)</span>
            </div>
          </div>

          {/* Water Level Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">6. Water Level Sensor Tandon</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  sensors.waterLevel >= 50
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
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
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span className="text-rose-600">Bocor (&lt;30%)</span>
              <span className="text-emerald-700 font-semibold">Penuh (85 - 95%)</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
