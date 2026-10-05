import React from 'react';
import { Cpu, RefreshCw, Radio, Zap } from 'lucide-react';

interface HeaderBarProps {
  isConnected: boolean;
  totalPower: number;
  onReset: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isConnected,
  totalPower,
  onReset,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#111827] border border-[#223048] shadow-lg mb-6">
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold tracking-wide text-white">
              URBANGROW • VIRTUAL HARDWARE TWIN
            </h1>
            <span className="mono text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              SIMULATOR v2.0
            </span>
          </div>
          <p className="mono text-xs text-slate-400 mt-0.5">
            ESP32 DEVKIT V1 EDGE NODE // DUAL POWER CATU DAYA 12V 7Ah
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Total Load Watts */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs mono">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-slate-400">Beban Aktuator:</span>
          <strong className="text-amber-400">{totalPower} Watt</strong>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs mono">
          <Radio className={`h-3.5 w-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
          <span className="text-slate-300">
            {isConnected ? 'LIVE SYNC :3000' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-200 transition cursor-pointer"
          title="Reset semua sensor ke nilai optimal"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Ekuilibrium</span>
        </button>
      </div>
    </header>
  );
};
