import React from 'react';
import type { ActuatorItem } from '../types';
import { Zap, Waves, Wind, Sun, Power } from 'lucide-react';

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

  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-[#223048] shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Relay Actuator Physical Status
          </h2>
        </div>
        <span className="mono text-xs text-slate-400">
          ESP32 OPTOCOUPLER 4-CHANNEL RELAY MODULE
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Status saklar di bawah ini sinkron dua arah secara instan dengan aplikasi Flutter di HP kamu:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Object.values(actuators).map((act, idx) => {
          const isOn = act.isOn;

          return (
            <div
              key={act.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isOn
                  ? 'bg-slate-800/90 border-amber-400/60 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-[10px] text-slate-400 font-bold">
                    CH-0{idx + 1} // RELAY
                  </span>
                  {/* Physical LED Indicator */}
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOn ? 'bg-amber-400 led-active text-amber-400' : 'bg-slate-700'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5 mt-1">
                  <div
                    className={`p-2 rounded-lg ${
                      isOn ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getIcon(act.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{act.name}</h4>
                    <span className="mono text-[10px] text-slate-400">{act.powerWatts} Watt</span>
                  </div>
                </div>
              </div>

              {/* Toggle Action */}
              <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span
                  className={`mono text-[10px] font-bold px-2 py-0.5 rounded ${
                    isOn ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isOn ? 'RELAY CLOSED (ON)' : 'RELAY OPEN (OFF)'}
                </span>

                <button
                  onClick={() => onToggleActuator(act.id)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    isOn
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Toggle manual dari simulator"
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
