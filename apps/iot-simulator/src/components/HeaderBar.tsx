import { RefreshCw, Radio, BatteryCharging } from 'lucide-react';

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
    <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Brand Capsule (Matching apps/web) */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-stone-300 bg-white shadow-sm">
        <img
          src="/urbangrow-logo.png"
          alt="UrbanGrow Logo"
          className="h-6 w-auto object-contain"
        />
        <span className="hidden sm:inline-block h-3.5 w-px bg-stone-300" />
        <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-stone-500 tracking-wider uppercase">
          Virtual Hardware Twin
        </span>
      </div>

      {/* Center Subtitle Pill */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white/80 backdrop-blur-md text-xs font-mono text-stone-600 shadow-xs">
        <span>ESP32 DEVKIT V1</span>
        <span>•</span>
        <span>CATU DAYA GANDA (12V ADAPTOR + 7Ah BATERAI)</span>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-2.5">
        {/* Total Load Watts Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-mono shadow-xs">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-stone-500">Beban:</span>
          <strong className="text-emerald-700">{totalPower}W</strong>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-mono shadow-xs">
          <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-stone-600 font-medium">
            {isConnected ? 'LIVE :3000' : 'OFFLINE'}
          </span>
        </div>

        {/* Reset Ekuilibrium Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1E1F24] hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          title="Reset semua sensor ke ekuilibrium normal"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
