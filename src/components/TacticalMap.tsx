import React from 'react';
import { 
  Sector, 
  RouteStats, 
  RouteType, 
  MapInteractionMode,
  ScoutedBy
} from '../types';
import { ROW_LABELS, parseSectorId } from '../data/initialMap';
import { 
  Search, 
  Skull, 
  Ban, 
  Package, 
  Flame, 
  Radio, 
  Home, 
  MapPin, 
  Crosshair,
  Shield,
  Layers
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface TacticalMapProps {
  sectors: Sector[];
  currentPos: string;
  ghostRoute: RouteStats;
  blitzRoute: RouteStats;
  scavengeRoute: RouteStats;
  activeRouteType: RouteType;
  interactionMode: MapInteractionMode;
  onSetInteractionMode: (mode: MapInteractionMode) => void;
  onSectorClick: (sector: Sector) => void;
  devicePerspective: 'all' | 'aarav' | 'mira';
  hoveredSector: Sector | null;
  onHoverSector: (sector: Sector | null) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  sectors,
  currentPos,
  ghostRoute,
  blitzRoute,
  scavengeRoute,
  activeRouteType,
  interactionMode,
  onSetInteractionMode,
  onSectorClick,
  devicePerspective,
  hoveredSector,
  onHoverSector,
}) => {
  const sectorMap = new Map<string, Sector>();
  sectors.forEach((s) => sectorMap.set(s.id, s));

  // Helper to get center pixel coordinates of a cell in SVG (12x12 grid, 100px cell size)
  const CELL_SIZE = 48;
  const GRID_SIZE = 12;
  const SVG_DIM = CELL_SIZE * GRID_SIZE; // 576px

  const getCellCenter = (sectorId: string) => {
    const { row, col } = parseSectorId(sectorId);
    return {
      x: col * CELL_SIZE + CELL_SIZE / 2,
      y: row * CELL_SIZE + CELL_SIZE / 2,
    };
  };

  // Convert a path of sector IDs to SVG path 'd' string
  const pathToSvgD = (path: string[]) => {
    if (!path || path.length === 0) return '';
    const points = path.map(getCellCenter);
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const getTerrainBadge = (terrain: string) => {
    switch (terrain) {
      case 'safehouse': return 'SH';
      case 'beacon': return 'BCN';
      case 'tunnel': return 'TUN';
      case 'overpass': return 'OVP';
      case 'supply': return 'SUP';
      case 'blocked': return 'BLK';
      default: return '';
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex flex-col gap-2 relative">
      {/* Interaction Mode Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-zinc-400 font-bold flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" /> TOOL:
          </span>

          <button
            onClick={() => onSetInteractionMode('inspect')}
            className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1 transition-colors ${
              interactionMode === 'inspect'
                ? 'bg-zinc-700 text-white font-bold'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3 h-3 text-zinc-300" /> Inspect
          </button>

          <button
            onClick={() => onSetInteractionMode('paint_horde')}
            className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1 transition-colors ${
              interactionMode === 'paint_horde'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-zinc-800/80 text-red-400 hover:bg-zinc-800'
            }`}
          >
            <Skull className="w-3 h-3" /> Paint Horde
          </button>

          <button
            onClick={() => onSetInteractionMode('toggle_block')}
            className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1 transition-colors ${
              interactionMode === 'toggle_block'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-zinc-800/80 text-amber-400 hover:bg-zinc-800'
            }`}
          >
            <Ban className="w-3 h-3" /> Roadblock
          </button>

          <button
            onClick={() => onSetInteractionMode('drop_supply')}
            className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1 transition-colors ${
              interactionMode === 'drop_supply'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-zinc-800/80 text-cyan-400 hover:bg-zinc-800'
            }`}
          >
            <Package className="w-3 h-3" /> Drop Cache
          </button>

          <button
            onClick={() => onSetInteractionMode('deploy_flare')}
            className={`px-2 py-1 text-xs font-mono rounded flex items-center gap-1 transition-colors ${
              interactionMode === 'deploy_flare'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-zinc-800/80 text-purple-400 hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-3 h-3" /> Flare Decoy
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Ghost
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Blitz
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Scavenge
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative mx-auto select-none bg-zinc-950 rounded-lg p-2 border border-zinc-800/80 shadow-inner">
        {/* Top Column Labels (1 to 12) */}
        <div className="flex pl-6 pb-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="text-[10px] font-mono text-zinc-500 text-center font-bold"
              style={{ width: `${CELL_SIZE}px` }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row Labels (A to L) */}
          <div className="flex flex-col pr-1 justify-around">
            {ROW_LABELS.map((label) => (
              <div
                key={label}
                className="text-[10px] font-mono text-zinc-500 text-center font-bold flex items-center justify-center"
                style={{ height: `${CELL_SIZE}px` }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Map Grid Viewport */}
          <div
            className="relative"
            style={{ width: `${SVG_DIM}px`, height: `${SVG_DIM}px` }}
          >
            {/* HTML Cells Grid */}
            <div className="grid grid-cols-12 grid-rows-12 absolute inset-0 z-0">
              {sectors.map((sector) => {
                const isCurrent = sector.id === currentPos;
                const isBeacon = sector.id === 'L12';
                const isHovered = hoveredSector?.id === sector.id;

                // Device perspective visibility check
                const isHiddenByDevice =
                  devicePerspective !== 'all' &&
                  sector.scoutedBy !== 'both' &&
                  sector.scoutedBy !== devicePerspective;

                return (
                  <div
                    key={sector.id}
                    onClick={() => onSectorClick(sector)}
                    onMouseEnter={() => onHoverSector(sector)}
                    onMouseLeave={() => onHoverSector(null)}
                    style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                    className={`relative border border-zinc-900/80 transition-all cursor-pointer flex flex-col items-center justify-between p-0.5 overflow-hidden ${
                      isHovered ? 'ring-1 ring-zinc-300 z-10' : ''
                    } ${
                      sector.terrain === 'blocked'
                        ? 'bg-zinc-900 text-zinc-600'
                        : sector.terrain === 'safehouse'
                        ? 'bg-emerald-950/40 text-emerald-300'
                        : sector.terrain === 'beacon'
                        ? 'bg-purple-950/60 text-purple-300'
                        : sector.terrain === 'tunnel'
                        ? 'bg-blue-950/40 text-blue-300'
                        : sector.terrain === 'overpass'
                        ? 'bg-amber-950/30 text-amber-300'
                        : 'bg-zinc-950 hover:bg-zinc-900/50'
                    }`}
                  >
                    {/* Zombie Threat Heatmap Overlay */}
                    {sector.zombieDensity > 0 && sector.terrain !== 'blocked' && (
                      <div
                        className="absolute inset-0 bg-red-600 pointer-events-none transition-opacity"
                        style={{
                          opacity: (sector.zombieDensity / 100) * 0.45,
                        }}
                      />
                    )}

                    {/* Decoy Flare Aura */}
                    {sector.hasDecoyFlare && (
                      <div className="absolute inset-0 bg-purple-500/30 animate-pulse pointer-events-none" />
                    )}

                    {/* Top Row: Sector ID & Mini Badge */}
                    <div className="w-full flex items-center justify-between text-[8px] font-mono leading-none z-10">
                      <span className="font-semibold text-zinc-400">{sector.id}</span>
                      {sector.terrain === 'supply' && !sector.looted && (
                        <Package className="w-2.5 h-2.5 text-cyan-400" />
                      )}
                      {sector.terrain === 'blocked' && (
                        <Ban className="w-2.5 h-2.5 text-zinc-600" />
                      )}
                    </div>

                    {/* Center Icon/Marker */}
                    <div className="z-10 flex items-center justify-center">
                      {isCurrent && (
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75" />
                          <div className="w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[8px] font-black text-black">
                            AM
                          </div>
                        </div>
                      )}

                      {isBeacon && !isCurrent && (
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-purple-400 opacity-75" />
                          <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                        </div>
                      )}

                      {!isCurrent && !isBeacon && sector.zombieDensity >= 70 && sector.terrain !== 'blocked' && (
                        <Skull className="w-3.5 h-3.5 text-red-400/80" />
                      )}

                      {!isCurrent && !isBeacon && sector.hasDecoyFlare && (
                        <Flame className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                      )}
                    </div>

                    {/* Bottom Row: Threat & Cover */}
                    <div className="w-full flex items-center justify-between text-[7px] font-mono leading-none z-10 opacity-70">
                      {sector.terrain !== 'blocked' ? (
                        <>
                          <span className={sector.zombieDensity > 50 ? 'text-red-400 font-bold' : 'text-zinc-500'}>
                            {sector.zombieDensity}%
                          </span>
                          <span className="text-zinc-500">{sector.structuralCover}%</span>
                        </>
                      ) : (
                        <span className="text-zinc-600 text-center w-full">RUBBLE</span>
                      )}
                    </div>

                    {/* Air-gap / Unsynced perspective indicator */}
                    {isHiddenByDevice && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <span className="text-[7px] font-mono text-zinc-600 font-bold uppercase tracking-wider rotate-[-25deg]">
                          UNSYNCED
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SVG Path Overlay */}
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              width={SVG_DIM}
              height={SVG_DIM}
              viewBox={`0 0 ${SVG_DIM} ${SVG_DIM}`}
            >
              {/* Filter definitions for glow */}
              <defs>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Ghost Route (Emerald) */}
              <path
                d={pathToSvgD(ghostRoute.path)}
                fill="none"
                stroke="#10b981"
                strokeWidth={activeRouteType === 'ghost' ? '4' : '2'}
                strokeOpacity={activeRouteType === 'ghost' ? '0.95' : '0.4'}
                strokeDasharray={activeRouteType === 'ghost' ? '6 4' : '2 4'}
                filter={activeRouteType === 'ghost' ? 'url(#glow-emerald)' : undefined}
                className={activeRouteType === 'ghost' ? 'transition-all' : ''}
              />

              {/* 2. Blitz Route (Amber) */}
              <path
                d={pathToSvgD(blitzRoute.path)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={activeRouteType === 'blitz' ? '4' : '2'}
                strokeOpacity={activeRouteType === 'blitz' ? '0.95' : '0.4'}
                strokeDasharray={activeRouteType === 'blitz' ? '6 4' : '2 4'}
                filter={activeRouteType === 'blitz' ? 'url(#glow-amber)' : undefined}
                className={activeRouteType === 'blitz' ? 'transition-all' : ''}
              />

              {/* 3. Scavenge Detour Route (Cyan) */}
              <path
                d={pathToSvgD(scavengeRoute.path)}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={activeRouteType === 'scavenge' ? '4' : '2'}
                strokeOpacity={activeRouteType === 'scavenge' ? '0.95' : '0.4'}
                strokeDasharray={activeRouteType === 'scavenge' ? '6 4' : '2 4'}
                filter={activeRouteType === 'scavenge' ? 'url(#glow-cyan)' : undefined}
                className={activeRouteType === 'scavenge' ? 'transition-all' : ''}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Sector Quick-Hover Inspector Strip */}
      <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 flex items-center justify-between text-xs font-mono">
        {hoveredSector ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100">{hoveredSector.id}:</span>
              <span className="text-zinc-300">{hoveredSector.name}</span>
              <span className="text-zinc-500 uppercase">[{hoveredSector.terrain}]</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-400">Threat: {hoveredSector.zombieDensity}%</span>
              <span className="text-emerald-400">Cover: {hoveredSector.structuralCover}%</span>
              {hoveredSector.loot.food > 0 && (
                <span className="text-amber-400">Rations: +{hoveredSector.loot.food}kcal</span>
              )}
            </div>
          </>
        ) : (
          <span className="text-zinc-500 italic">Hover any sector or select a tool to interact with the tactical map</span>
        )}
      </div>
    </div>
  );
};
