import React from 'react';
import type { ActuatorItem, SensorState } from '../types';
import { Waves, Wind, Sun, ArrowUp, Fish, Sprout, Layers } from 'lucide-react';

interface HardwareSchematicProps {
  sensors: SensorState;
  actuators: Record<string, ActuatorItem>;
}

export const HardwareSchematic: React.FC<HardwareSchematicProps> = ({
  sensors,
  actuators,
}) => {
  const isPumpOn = actuators.waterPump?.isOn ?? true;
  const isAeratorOn = actuators.aerator?.isOn ?? true;
  const isLightOn = actuators.growLight?.isOn ?? false;
  const isFeederOn = actuators.feeder?.isOn ?? false;

  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-[#223048] shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Skematik Fisik 4-Level Modular Aquaponics
          </h2>
        </div>
        <span className="mono text-xs text-slate-400">
          AIR FLOW GRAVITY CASCADE // RESIRKULASI TERTUTUP
        </span>
      </div>

      {/* Main Visual Rack */}
      <div className="relative grid grid-cols-1 gap-5 max-w-2xl mx-auto py-2">
        {/* PVC Pipe Return Loop Graphic (Left Vertical Spine) */}
        <div className="absolute left-[-22px] top-6 bottom-6 w-4 border-l-2 border-dashed border-cyan-500/40 hidden md:block">
          <div
            className={`absolute top-1/2 -left-3 -translate-y-1/2 p-1.5 rounded-full ${
              isPumpOn ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50' : 'bg-slate-800 text-slate-500'
            }`}
            title="Pompa Sirkulasi 12V DC"
          >
            <ArrowUp className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-bounce' : ''}`} />
          </div>
        </div>

        {/* LEVEL 4: PAKCOY & GROW LIGHT */}
        <div
          className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
            isLightOn
              ? 'bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-500/10'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          {/* LED Grow Light Fixture */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${isLightOn ? 'text-amber-300 animate-pulse' : 'text-slate-600'}`} />
              <span className="mono text-xs font-semibold text-slate-300">
                LED Grow Light Array (85W PAR Spektrum)
              </span>
            </div>
            <span
              className={`mono text-[10px] px-2 py-0.5 rounded font-bold ${
                isLightOn
                  ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/50'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isLightOn ? 'ILUMINASI ON' : 'STANDBY OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Level 4: Sayuran Pakcoy</h3>
                <p className="text-xs text-slate-400">
                  Perakaran Renggang • Menghasilkan DO Tertinggi (~{sensors.dissolvedOxygen} mg/L)
                </p>
              </div>
            </div>
            <div className="text-right mono text-xs">
              <div className="text-emerald-400 font-bold">{sensors.lightIntensity} LUX</div>
              <div className="text-slate-500 text-[10px]">120 Pods</div>
            </div>
          </div>
        </div>

        {/* Gravity Flow Indicator 1 */}
        <div className="flex items-center justify-center gap-2 text-[11px] mono text-cyan-400/80">
          <Waves className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-pulse text-cyan-400' : 'text-slate-600'}`} />
          <span>Limpahan Gravitasi Air Segar Kaya Oksigen</span>
        </div>

        {/* LEVEL 3: IKAN NILA & AERATOR */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
          {/* Bubbles animation if aerator is on */}
          {isAeratorOn && (
            <div className="absolute inset-0 pointer-events-none flex justify-around opacity-40">
              <span className="bubble text-cyan-300 text-xs">⚪</span>
              <span className="bubble text-cyan-300 text-xs [animation-delay:0.3s]">⚪</span>
              <span className="bubble text-cyan-300 text-xs [animation-delay:0.7s]">⚪</span>
              <span className="bubble text-cyan-300 text-xs [animation-delay:0.5s]">⚪</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Wind className={`h-4 w-4 ${isAeratorOn ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
              <span className="mono text-xs font-semibold text-slate-300">
                Aerator DO Booster (18W Dual Port)
              </span>
            </div>
            <span
              className={`mono text-[10px] px-2 py-0.5 rounded font-bold ${
                isAeratorOn ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isAeratorOn ? 'DIFFUSING O₂' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Fish className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Level 3: Tandon Ikan Nila</h3>
                <p className="text-xs text-slate-400">
                  Sensitif Hipoksia (Wajib DO &gt; 5.0 mg/L) • Menghasilkan Limbah Organik
                </p>
              </div>
            </div>
            <div className="text-right mono text-xs">
              <div className="text-sky-400 font-bold">DO: {sensors.dissolvedOxygen} mg/L</div>
              <div className="text-slate-500 text-[10px]">27 Ekor Nila</div>
            </div>
          </div>

          {/* Feeder Trigger Toast */}
          {isFeederOn && (
            <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mono flex items-center justify-between animate-pulse">
              <span>🌾 Feeder Aktif: Menyebarkan 35g pelet terapung...</span>
              <span className="font-bold">DISPENSING</span>
            </div>
          )}
        </div>

        {/* Gravity Flow Indicator 2 */}
        <div className="flex items-center justify-center gap-2 text-[11px] mono text-amber-400/80">
          <Waves className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-pulse text-amber-400' : 'text-slate-600'}`} />
          <span>Limpahan Limbah Amonia Menuju Substrat Biofilter</span>
        </div>

        {/* LEVEL 2: KANGKUNG BIOFILTER */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Level 2: Biofilter Sayuran Kangkung</h3>
                <p className="text-xs text-slate-400">
                  Perakaran Masif • Pengurai Nitrifikasi (Amonia $\rightarrow$ Nitrat)
                </p>
              </div>
            </div>
            <div className="text-right mono text-xs">
              <div className="text-amber-400 font-bold">TDS: {sensors.tds} ppm</div>
              <div className="text-slate-500 text-[10px]">100 Pods</div>
            </div>
          </div>
        </div>

        {/* Gravity Flow Indicator 3 */}
        <div className="flex items-center justify-center gap-2 text-[11px] mono text-cyan-400/80">
          <Waves className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-pulse text-cyan-400' : 'text-slate-600'}`} />
          <span>Air Terfilter Mengalir ke Tandon Sump Dasar</span>
        </div>

        {/* LEVEL 1: LELE & POMPA RESIRKULASI */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Waves className={`h-4 w-4 ${isPumpOn ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
              <span className="mono text-xs font-semibold text-slate-300">
                Submersible Pump 12V DC (45W Lift)
              </span>
            </div>
            <span
              className={`mono text-[10px] px-2 py-0.5 rounded font-bold ${
                isPumpOn ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}
            >
              {isPumpOn ? 'RESIRKULASI ON' : 'PUMP STOP'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-700/30 border border-slate-600/30 flex items-center justify-center text-slate-300">
                <Fish className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Level 1: Tandon Sump Ikan Lele</h3>
                <p className="text-xs text-slate-400">
                  Organ Arboresen • Toleran DO Rendah • Muara Pompa Sirkulasi
                </p>
              </div>
            </div>
            <div className="text-right mono text-xs">
              <div className="text-cyan-400 font-bold">Level: {sensors.waterLevel}%</div>
              <div className="text-slate-500 text-[10px]">27 Ekor Lele</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
