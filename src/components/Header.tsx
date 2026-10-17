import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  WifiOff,
  Activity
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HeaderProps {
  countdownSeconds: number;
  survivalProbability: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onLoadPreset: (presetId: number) => void;
  activePreset: number;
  isAirGapMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  countdownSeconds,
  survivalProbability,
  isMuted,
  onToggleMute,
  onReset,
  onLoadPreset,
  activePreset,
  isAirGapMode,
}) => {
  // Format countdown into HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSurvivalColor = (prob: number) => {
    if (prob >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (prob >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-red-400 border-red-500/40 bg-red-950/40';
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-bold tracking-wider text-base text-zinc-100 flex items-center gap-2">
              BEACON-19
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                v2.4 OFFLINE-P2P
              </span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 text-red-300 font-bold uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" /> DAY 19 OUTBREAK
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            <span>TACTICAL SURVIVAL &amp; OFFLINE ROUTE COORDINATOR</span>
            {isAirGapMode && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-950/60 px-1.5 rounded border border-amber-700/40">
                <WifiOff className="w-3 h-3" /> AIR-GAP LOCKED
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Preset Scenarios Switcher (For Judges / Demos) */}
      <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
        <span className="text-[11px] font-mono text-zinc-400 px-2 flex items-center gap-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> DEMO PRESETS:
        </span>
        <button
          onClick={() => onLoadPreset(1)}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            activePreset === 1
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Preset 1: Balanced Start at Sector A1"
        >
          P1: Dawn Start
        </button>
        <button
          onClick={() => onLoadPreset(2)}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            activePreset === 2
              ? 'bg-amber-500 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Preset 2: Mid-City Ambush with Horde at F6"
        >
          P2: Mid Ambush
        </button>
        <button
          onClick={() => onLoadPreset(3)}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            activePreset === 3
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Preset 3: Critical Dehydration Crisis (Forces Scavenge Detour)"
        >
          P3: Thirst Crisis
        </button>
        <button
          onClick={() => onLoadPreset(4)}
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            activePreset === 4
              ? 'bg-purple-500 text-white font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Preset 4: Final Approach to L12 Beacon (High Tension Endgame)"
        >
          P4: Final Evac
        </button>
      </div>

      {/* Vital Gauges & Audio / Reset Controls */}
      <div className="flex items-center gap-3">
        {/* Beacon Closing Countdown */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-left font-mono">
            <div className="text-[10px] text-zinc-500 leading-none">BEACON CLOSING</div>
            <div className={`text-sm font-bold leading-tight ${countdownSeconds < 3600 ? 'text-red-400' : 'text-amber-400'}`}>
              {formatTime(countdownSeconds)}
            </div>
          </div>
        </div>

        {/* Survival Probability Gauge */}
        <div className={`flex items-center gap-2 border px-3 py-1 rounded ${getSurvivalColor(survivalProbability)}`}>
          <Activity className="w-4 h-4 animate-pulse" />
          <div className="text-left font-mono">
            <div className="text-[10px] opacity-75 leading-none">SURVIVAL ODDS</div>
            <div className="text-sm font-black leading-tight tracking-wider">
              {survivalProbability}%
            </div>
          </div>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            soundEngine.playSonarPing();
            onToggleMute();
          }}
          className={`p-2 rounded border transition-colors ${
            isMuted 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300' 
              : 'bg-zinc-900 border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/40'
          }`}
          title={isMuted ? 'Unmute Web Audio Synthesizer' : 'Mute Web Audio Synthesizer'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Reset All */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          title="Reset map, survivors, and inventory to Day 19 default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
