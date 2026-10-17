import React from 'react';
import { 
  Heart, 
  Zap, 
  Droplets, 
  Briefcase, 
  Radio, 
  Utensils, 
  Coffee, 
  PlusCircle, 
  Sparkles,
  Shield,
  BatteryCharging,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Survivor, SharedInventory } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface SurvivorPanelProps {
  aarav: Survivor;
  mira: Survivor;
  inventory: SharedInventory;
  onEatRation: () => void;
  onDrinkWater: () => void;
  onApplyMedkit: (survivorName: 'Aarav' | 'Mira') => void;
  onTriggerDilemma: () => void;
}

export const SurvivorPanel: React.FC<SurvivorPanelProps> = ({
  aarav,
  mira,
  inventory,
  onEatRation,
  onDrinkWater,
  onApplyMedkit,
  onTriggerDilemma,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
      case 'Fatigued':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/50';
      case 'Dehydrated':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50';
      case 'Exposed':
      case 'Critical':
        return 'text-red-400 bg-red-950/60 border-red-700/50 animate-pulse';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  const getBarColor = (val: number) => {
    if (val >= 65) return 'bg-emerald-500';
    if (val >= 35) return 'bg-amber-500';
    return 'bg-red-500 animate-pulse';
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
            Field Unit Status // Dual-Survivors
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">SECTOR A1 METRO</span>
      </div>

      {/* Survivor 1: Aarav */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-zinc-100">AARAV</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                UNIT 01
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Field Scout &amp; Heavy Carrier</div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusColor(aarav.status)}`}>
            {aarav.status}
          </span>
        </div>

        {/* Meters */}
        <div className="space-y-1.5 font-mono text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Health</span>
              <span className="text-zinc-200 font-semibold">{aarav.health}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(aarav.health)}`} style={{ width: `${aarav.health}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Stamina</span>
              <span className="text-zinc-200 font-semibold">{aarav.stamina}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(aarav.stamina)}`} style={{ width: `${aarav.stamina}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> Hydration</span>
              <span className="text-zinc-200 font-semibold">{aarav.hydration}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(aarav.hydration)}`} style={{ width: `${aarav.hydration}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-zinc-400" /> Pack Load:</span>
          <span className="text-zinc-200 font-semibold">{aarav.packLoadKg || 24.5} kg (Heavy)</span>
        </div>
      </div>

      {/* Survivor 2: Mira */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-zinc-100">MIRA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                UNIT 02
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Combat Medic &amp; Radio Specialist</div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusColor(mira.status)}`}>
            {mira.status}
          </span>
        </div>

        {/* Meters */}
        <div className="space-y-1.5 font-mono text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Health</span>
              <span className="text-zinc-200 font-semibold">{mira.health}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(mira.health)}`} style={{ width: `${mira.health}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Stamina</span>
              <span className="text-zinc-200 font-semibold">{mira.stamina}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(mira.stamina)}`} style={{ width: `${mira.stamina}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> Hydration</span>
              <span className="text-zinc-200 font-semibold">{mira.hydration}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className={`h-full transition-all duration-300 ${getBarColor(mira.hydration)}`} style={{ width: `${mira.hydration}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1"><Radio className="w-3 h-3 text-cyan-400" /> Radio Beacon Link:</span>
          <span className="text-cyan-300 font-semibold">{mira.radioSignalIntegrity || 68}% (VHF Ch. 9)</span>
        </div>
      </div>

      {/* Shared Survival Inventory */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Shared Ration Pack
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            CRITICAL TIERS
          </span>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {/* Food */}
          <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400 flex items-center justify-between">
              <span>Food Rations</span>
              <Utensils className="w-3 h-3 text-amber-400" />
            </div>
            <div className={`text-base font-bold mt-0.5 ${inventory.foodKcal < 1000 ? 'text-red-400 animate-pulse' : 'text-zinc-100'}`}>
              {inventory.foodKcal} <span className="text-[10px] font-normal text-zinc-500">kcal</span>
            </div>
          </div>

          {/* Water */}
          <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400 flex items-center justify-between">
              <span>Purified Water</span>
              <Droplets className="w-3 h-3 text-cyan-400" />
            </div>
            <div className={`text-base font-bold mt-0.5 ${inventory.waterLiters < 1.5 ? 'text-red-400 animate-pulse' : 'text-zinc-100'}`}>
              {inventory.waterLiters.toFixed(1)} <span className="text-[10px] font-normal text-zinc-500">Liters</span>
            </div>
          </div>

          {/* Medkits */}
          <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400 flex items-center justify-between">
              <span>Trauma Medkits</span>
              <PlusCircle className="w-3 h-3 text-red-400" />
            </div>
            <div className="text-base font-bold text-zinc-100 mt-0.5">
              {inventory.medkits} <span className="text-[10px] font-normal text-zinc-500">kits</span>
            </div>
          </div>

          {/* Decoy Flares */}
          <div className="bg-zinc-950/80 p-2 rounded border border-zinc-800/80">
            <div className="text-[10px] text-zinc-400 flex items-center justify-between">
              <span>Acoustic Flares</span>
              <Flame className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base font-bold text-zinc-100 mt-0.5">
              {inventory.flares} <span className="text-[10px] font-normal text-zinc-500">units</span>
            </div>
          </div>
        </div>

        {/* Battery Bar */}
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-400" /> Backup Power Cell
            </span>
            <span className="text-zinc-200 font-semibold">{inventory.batteryPercent}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className={`h-full ${inventory.batteryPercent > 20 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
              style={{ width: `${inventory.batteryPercent}%` }} 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              soundEngine.playSupplyPickup();
              onEatRation();
            }}
            disabled={inventory.foodKcal < 600}
            className="px-1.5 py-1.5 text-[10px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-amber-300 border border-zinc-700 flex flex-col items-center gap-0.5 transition-colors"
            title="Eat 1 Ration: +600 kcal, +15% Stamina"
          >
            <Utensils className="w-3 h-3 text-amber-400" />
            <span>Eat Ration</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSupplyPickup();
              onDrinkWater();
            }}
            disabled={inventory.waterLiters < 0.5}
            className="px-1.5 py-1.5 text-[10px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-cyan-300 border border-zinc-700 flex flex-col items-center gap-0.5 transition-colors"
            title="Drink Water: -0.5L Water, +20% Hydration"
          >
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>Drink Water</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSupplyPickup();
              // Heal the lower health survivor
              const target = aarav.health < mira.health ? 'Aarav' : 'Mira';
              onApplyMedkit(target);
            }}
            disabled={inventory.medkits < 1}
            className="px-1.5 py-1.5 text-[10px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-red-300 border border-zinc-700 flex flex-col items-center gap-0.5 transition-colors"
            title="Apply Medkit: -1 Medkit, +35% Health"
          >
            <PlusCircle className="w-3 h-3 text-red-400" />
            <span>Use Medkit</span>
          </button>
        </div>
      </div>

      {/* Jury Demo Action: Trigger Survival Dilemma */}
      <button
        onClick={() => {
          soundEngine.playSonarPing();
          onTriggerDilemma();
        }}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600/30 to-red-600/30 hover:from-amber-600/40 hover:to-red-600/40 border border-amber-500/50 text-amber-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>[⚡ TRIGGER SURVIVAL DILEMMA]</span>
      </button>
    </div>
  );
};
