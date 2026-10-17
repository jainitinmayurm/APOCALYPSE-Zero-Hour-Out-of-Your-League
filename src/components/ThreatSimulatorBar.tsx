import React from 'react';
import { 
  Skull, 
  Clock, 
  CloudRain, 
  Construction, 
  Play, 
  RotateCw, 
  AlertOctagon,
  Sparkles,
  Footprints
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ThreatSimulatorBarProps {
  onSpawnAmbush: () => void;
  onAdvanceTime: () => void;
  onCollapseOverpass: () => void;
  onToggleAcidRain: () => void;
  onStepForward: () => void;
  isAcidRain: boolean;
  isAmbushAlert: boolean;
  canStep: boolean;
  currentSectorId: string;
}

export const ThreatSimulatorBar: React.FC<ThreatSimulatorBarProps> = ({
  onSpawnAmbush,
  onAdvanceTime,
  onCollapseOverpass,
  onToggleAcidRain,
  onStepForward,
  isAcidRain,
  isAmbushAlert,
  canStep,
  currentSectorId,
}) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 space-y-2">
      {/* Route Compromised Banner */}
      {isAmbushAlert && (
        <div className="bg-red-950/80 border border-red-500 text-red-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>CRITICAL ALERT: ROUTE COMPROMISED — RECALCULATING ALL 3 VECTORS LIVE</span>
          </div>
          <span className="text-[10px] bg-red-900/80 px-2 py-0.5 rounded text-red-100">
            RADAR SPIKE +85%
          </span>
        </div>
      )}

      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Step Forward Engine */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playSonarPing();
              onStepForward();
            }}
            disabled={!canStep}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-black font-mono text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all border border-emerald-400"
            title="Advance Aarav and Mira 1 sector along the active route"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>[▶ STEP FORWARD 1 SECTOR]</span>
          </button>
          <div className="text-[11px] font-mono text-zinc-400 px-2 py-1 bg-zinc-950 rounded border border-zinc-800 flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>POS: <strong className="text-zinc-100">{currentSectorId}</strong></span>
          </div>
        </div>

        {/* Live Simulation Deck */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-zinc-500 font-semibold px-1">
            THREAT SIM DECK:
          </span>

          {/* Ambush Button */}
          <button
            onClick={() => {
              soundEngine.playHordeAlert();
              onSpawnAmbush();
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded bg-red-950/50 hover:bg-red-900/50 text-red-300 border border-red-800/60 flex items-center gap-1.5 transition-colors"
            title="Spawn a high-density zombie horde right on the active route midpoint"
          >
            <Skull className="w-3.5 h-3.5 text-red-400" />
            <span>Horde Ambush</span>
          </button>

          {/* Advance Time +30m */}
          <button
            onClick={() => {
              soundEngine.playSonarPing();
              onAdvanceTime();
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            title="Advance clock 30 minutes: migrates hordes and reduces beacon evac timer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>+30m Time Jump</span>
          </button>

          {/* Collapse Overpass */}
          <button
            onClick={() => {
              soundEngine.playHordeAlert();
              onCollapseOverpass();
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            title="Collapse Central Highway Overpass (E6, E7, F6) forcing reroute"
          >
            <Construction className="w-3.5 h-3.5 text-yellow-400" />
            <span>Collapse Overpass</span>
          </button>

          {/* Toggle Acid Rain */}
          <button
            onClick={() => {
              soundEngine.playSonarPing();
              onToggleAcidRain();
            }}
            className={`px-2.5 py-1.5 text-xs font-mono rounded border flex items-center gap-1.5 transition-colors ${
              isAcidRain
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
            title="Toggle Acid Rain: +25% resource burn, +30% stealth in tunnels"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAcidRain ? 'Acid Rain [ON]' : 'Acid Rain [OFF]'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
