import React from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface Props {
  isConnected: boolean;
  latencyMs: number;
}

export const NetworkStatusBadge: React.FC<Props> = ({ isConnected, latencyMs }) => {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/80 px-3 py-1 text-xs text-slate-300 backdrop-blur-md">
      {isConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] tabular-nums text-slate-200">
            {latencyMs}ms
          </span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          <WifiOff className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-rose-400 font-medium">DISCONNECTED</span>
        </>
      )}
    </div>
  );
};
