import React from 'react';
import { Sector } from '../types';
import { 
  X, 
  MapPin, 
  Skull, 
  Shield, 
  Package, 
  Flame, 
  User, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface SectorTelemetryModalProps {
  sector: Sector | null;
  isOpen: boolean;
  onClose: () => void;
  onScavengeLoot: (sectorId: string) => void;
  onAdjustThreat: (sectorId: string, delta: number) => void;
}

export const SectorTelemetryModal: React.FC<SectorTelemetryModalProps> = ({
  sector,
  isOpen,
  onClose,
  onScavengeLoot,
  onAdjustThreat,
}) => {
  if (!isOpen || !sector) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-700 rounded-xl max-w-md w-full p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-zinc-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-zinc-800 text-zinc-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">SECTOR TELEMETRY DOSSIER</div>
              <h3 className="text-sm font-mono font-bold text-zinc-100 flex items-center gap-2">
                <span>{sector.id} // {sector.name}</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-xs">
          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Zombie Density</span>
              <Skull className="w-3 h-3 text-red-400" />
            </div>
            <div className="text-base font-bold text-red-400 mt-0.5">
              {sector.zombieDensity}%
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full mt-1 overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${sector.zombieDensity}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Structural Cover</span>
              <Shield className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {sector.structuralCover}%
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${sector.structuralCover}%` }} />
            </div>
          </div>
        </div>

        {/* Terrain & Scout Data */}
        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800 text-xs font-mono space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-zinc-500">Terrain Classification:</span>
            <span className="text-zinc-200 uppercase font-semibold">{sector.terrain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Recon Scouting Parity:</span>
            <span className="text-zinc-200 capitalize font-semibold">{sector.scoutedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Decoy Flare Active:</span>
            <span className={sector.hasDecoyFlare ? 'text-purple-400 font-bold' : 'text-zinc-600'}>
              {sector.hasDecoyFlare ? `YES (${sector.flareTurnsRemaining} turns)` : 'NO'}
            </span>
          </div>
        </div>

        {/* Loot Manifest */}
        <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800 text-xs font-mono mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1 font-bold">
              <Package className="w-3.5 h-3.5 text-cyan-400" /> Cache Manifest
            </span>
            <span className={`text-[10px] px-1.5 rounded ${sector.looted ? 'text-zinc-500 bg-zinc-800' : 'text-emerald-400 bg-emerald-950/80 border border-emerald-700/50'}`}>
              {sector.looted ? 'LOOTED / EMPTY' : 'SEALED CRATE'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-zinc-950 p-1 rounded border border-zinc-800/80">
              <div className="text-[9px] text-zinc-500">FOOD</div>
              <div className="font-bold text-amber-300">{sector.loot.food}kcal</div>
            </div>
            <div className="bg-zinc-950 p-1 rounded border border-zinc-800/80">
              <div className="text-[9px] text-zinc-500">WATER</div>
              <div className="font-bold text-cyan-300">{sector.loot.water}L</div>
            </div>
            <div className="bg-zinc-950 p-1 rounded border border-zinc-800/80">
              <div className="text-[9px] text-zinc-500">MEDKITS</div>
              <div className="font-bold text-red-300">{sector.loot.medkits}</div>
            </div>
            <div className="bg-zinc-950 p-1 rounded border border-zinc-800/80">
              <div className="text-[9px] text-zinc-500">FLARES</div>
              <div className="font-bold text-purple-300">{sector.loot.flares}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!sector.looted && (sector.loot.food > 0 || sector.loot.water > 0 || sector.loot.medkits > 0) && (
            <button
              onClick={() => {
                soundEngine.playSupplyPickup();
                onScavengeLoot(sector.id);
                onClose();
              }}
              className="flex-1 py-1.5 px-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-mono font-bold flex items-center justify-center gap-1"
            >
              <Package className="w-3.5 h-3.5" /> Scavenge Now
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playHordeAlert();
              onAdjustThreat(sector.id, 25);
            }}
            className="flex-1 py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-red-300 text-xs font-mono flex items-center justify-center gap-1 border border-zinc-700"
          >
            <Skull className="w-3 h-3 text-red-400" /> +25% Threat
          </button>

          <button
            onClick={() => {
              soundEngine.playSonarPing();
              onAdjustThreat(sector.id, -30);
            }}
            className="flex-1 py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-xs font-mono flex items-center justify-center gap-1 border border-zinc-700"
          >
            <Shield className="w-3 h-3 text-emerald-400" /> Clear Threat
          </button>
        </div>
      </div>
    </div>
  );
};
