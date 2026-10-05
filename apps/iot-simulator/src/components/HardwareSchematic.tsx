import type { ActuatorItem, SensorState } from '../types';
import { Waves, Wind, Sun, ArrowDown, ArrowUp, Layers } from 'lucide-react';

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
    <div className="rounded-[28px] bg-white border border-stone-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold tracking-tight text-stone-900">
            Skematik Fisik 4-Level Modular Aquaponics
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
          ALIRAN GRAVITASI TERTUTUP
        </span>
      </div>

      <div className="space-y-3 py-1">
        {/* LEVEL 4: PAKCOY & GROW LIGHT */}
        <div
          className={`rounded-2xl p-4 border transition-all relative overflow-hidden ${
            isLightOn
              ? 'bg-purple-50/60 border-purple-300 ring-1 ring-purple-200 shadow-sm'
              : 'bg-stone-50 border-stone-200/80'
          }`}
        >
          {/* LED Grow Light Status Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/60">
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${isLightOn ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
              <span className="text-xs font-semibold text-stone-700">
                Lampu LED Grow Light (85W PAR Spektrum)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isLightOn ? 'bg-purple-100 text-purple-900' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {isLightOn ? 'ILUMINASI ON' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                L4
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900">Level 4: Sayuran Pakcoy</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Akar Renggang • Menghasilkan DO Tertinggi
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-emerald-700 font-bold">{sensors.lightIntensity} LUX</div>
              <div className="text-stone-400 text-[10px]">120 Pods</div>
            </div>
          </div>
        </div>

        {/* Gravity Flow Indicator 1 */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-sky-600">
          <ArrowDown className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-bounce' : ''}`} />
          <span>Limpahan Gravitasi Air Segar Kaya Oksigen</span>
        </div>

        {/* LEVEL 3: IKAN NILA & AERATOR */}
        <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200/80 relative overflow-hidden">
          {/* Bubbles animation if aerator is on */}
          {isAeratorOn && (
            <div className="absolute inset-0 pointer-events-none flex justify-around opacity-30">
              <span className="bubble text-sky-500 text-xs">⚪</span>
              <span className="bubble text-sky-500 text-xs [animation-delay:0.3s]">⚪</span>
              <span className="bubble text-sky-500 text-xs [animation-delay:0.7s]">⚪</span>
              <span className="bubble text-sky-500 text-xs [animation-delay:0.5s]">⚪</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/60">
            <div className="flex items-center gap-2">
              <Wind className={`h-4 w-4 ${isAeratorOn ? 'text-sky-600 animate-spin' : 'text-stone-400'}`} />
              <span className="text-xs font-semibold text-stone-700">
                Aerator Oksigen Nila (18W Dual Port)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isAeratorOn ? 'bg-sky-100 text-sky-900' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {isAeratorOn ? 'AERASI AKTIF' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-mono font-bold text-xs">
                L3
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900">Level 3: Tandon Ikan Nila</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Wajib DO &gt; 5.0 mg/L • Limbah Organik
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-sky-700 font-bold">DO: {sensors.dissolvedOxygen} mg/L</div>
              <div className="text-stone-400 text-[10px]">27 Ekor Nila</div>
            </div>
          </div>

          {/* Feeder Trigger Toast */}
          {isFeederOn && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono flex items-center justify-between animate-pulse">
              <span>🌾 Pakan Terdistribusi: 35g pelet terapung keluar...</span>
              <span className="font-bold">DISPENSING</span>
            </div>
          )}
        </div>

        {/* Gravity Flow Indicator 2 */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-amber-600">
          <ArrowDown className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-bounce' : ''}`} />
          <span>Limpahan Limbah Amonia Menuju Substrat Biofilter</span>
        </div>

        {/* LEVEL 2: KANGKUNG BIOFILTER */}
        <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs">
                L2
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900">Level 2: Biofilter Sayuran Kangkung</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Perakaran Masif • Pengurai Nitrifikasi Organik
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-amber-800 font-bold">TDS: {sensors.tds} ppm</div>
              <div className="text-stone-400 text-[10px]">100 Pods</div>
            </div>
          </div>
        </div>

        {/* Gravity Flow Indicator 3 */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-stone-500">
          <ArrowDown className={`h-3.5 w-3.5 ${isPumpOn ? 'animate-bounce' : ''}`} />
          <span>Air Terfilter Menuju Tandon Sump Dasar</span>
        </div>

        {/* LEVEL 1: LELE & POMPA RESIRKULASI */}
        <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/60">
            <div className="flex items-center gap-2">
              <Waves className={`h-4 w-4 ${isPumpOn ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`} />
              <span className="text-xs font-semibold text-stone-700">
                Pompa Sirkulasi 12V DC (45W)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isPumpOn ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}
            >
              {isPumpOn ? 'RESIRKULASI ON' : 'PUMP OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center font-mono font-bold text-xs">
                L1
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900">Level 1: Tandon Sump Ikan Lele</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Organ Arboresen • Toleran O₂ Rendah • Muara Pompa
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-stone-700 font-bold">Level: {sensors.waterLevel}%</div>
              <div className="text-stone-400 text-[10px]">27 Ekor Lele</div>
            </div>
          </div>
        </div>

        {/* Closed-loop Pipe Return Lift */}
        <div className="rounded-2xl bg-[#1E1F24] text-white p-3.5 flex items-center justify-between text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <ArrowUp className={`h-4 w-4 ${isPumpOn ? 'animate-bounce' : ''}`} />
            <span className="text-[11px]">PIPA PVC RESIRKULASI TERTUTUP (SUBMERSIBLE 12V)</span>
          </div>
          <span className="text-[10px] text-stone-400 font-semibold">
            STATUS: {isPumpOn ? 'BEROPERASI' : 'STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
};
