import React from 'react';
import type { ActuatorItem } from '../types';
import { Zap, Waves, Wind, Sun, Check, Power } from 'lucide-react';

interface RelayStatusPanelProps {
  actuators: Record<string, ActuatorItem>;
  onToggleActuator: (id: string) => void;
}

export const RelayStatusPanel: React.FC<RelayStatusPanelProps> = ({
  actuators,
  onToggleActuator,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pump':
        return <Waves className="h-4 w-4" />;
      case 'aerator':
        return <Wind className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'feeder':
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const activeCount = Object.values(actuators).filter((a) => a.isOn).length;
  const totalCount = Object.values(actuators).length;

  return (
    <div className="rounded-[28px] bg-[#1E1F24] text-white p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--accent-yellow)]" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Status Fisik Relay Aktuator ESP32
            </h2>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Sinkronisasi dua arah real-time dengan tombol saklar di HP kamu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-stone-400">Aktuator Aktif:</span>
          <span className="px-3 py-1 rounded-full bg-[var(--accent-yellow)] text-stone-900 font-mono font-bold text-xs">
            {activeCount} / {totalCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {Object.values(actuators).map((act, idx) => {
          const isOn = act.isOn;

          return (
            <div
              key={act.id}
              onClick={() => onToggleActuator(act.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isOn
                  ? 'bg-white/10 border-[var(--accent-yellow)]/60 shadow-sm'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-stone-400 font-semibold">
                    RELAY 0{idx + 1}
                  </span>
                  {/* Yellow Checkmark Circle (Matching Crextio dark card) */}
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                      isOn
                        ? 'bg-[var(--accent-yellow)] text-stone-900'
                        : 'border border-white/30'
                    }`}
                  >
                    {isOn && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isOn ? 'bg-[var(--accent-yellow)] text-stone-900' : 'bg-white/10 text-stone-400'
                    }`}
                  >
                    {getIcon(act.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-snug">{act.name}</h4>
                    <span className="text-[11px] font-mono text-stone-400">{act.powerWatts} Watt</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isOn ? 'bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)]' : 'bg-white/10 text-stone-400'
                  }`}
                >
                  {isOn ? 'TERHUBUNG (ON)' : 'STANDBY (OFF)'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActuator(act.id);
                  }}
                  className={`h-6 w-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    isOn
                      ? 'bg-[var(--accent-yellow)] text-stone-900'
                      : 'bg-white/10 text-stone-400 hover:text-white'
                  }`}
                  title="Toggle manual"
                >
                  <Power className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
