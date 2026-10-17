import React from 'react';
import { RouteStats, RouteType } from '../types';
import { Shield, Zap, Search, CheckCircle2, AlertTriangle, Clock, Activity, Flame } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface RouteComparisonBarProps {
  ghostRoute: RouteStats;
  blitzRoute: RouteStats;
  scavengeRoute: RouteStats;
  selectedRouteType: RouteType;
  recommendedRouteType: RouteType;
  onSelectRoute: (type: RouteType) => void;
}

export const RouteComparisonBar: React.FC<RouteComparisonBarProps> = ({
  ghostRoute,
  blitzRoute,
  scavengeRoute,
  selectedRouteType,
  recommendedRouteType,
  onSelectRoute,
}) => {
  const routes = [ghostRoute, blitzRoute, scavengeRoute];

  const getRouteIcon = (type: RouteType) => {
    switch (type) {
      case 'ghost':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'blitz':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'scavenge':
        return <Search className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getBorderColor = (type: RouteType, isSelected: boolean) => {
    if (isSelected) {
      switch (type) {
        case 'ghost': return 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50';
        case 'blitz': return 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50';
        case 'scavenge': return 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/50';
      }
    }
    return 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700';
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            Multi-Heuristic A* Trajectory Matrix
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          SELECT ACTIVE VECTOR
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {routes.map((r) => {
          const isSelected = selectedRouteType === r.type;
          const isRecommended = recommendedRouteType === r.type;

          return (
            <div
              key={r.type}
              onClick={() => {
                soundEngine.playSonarPing();
                onSelectRoute(r.type);
              }}
              className={`cursor-pointer rounded-lg border p-2.5 transition-all text-left relative flex flex-col justify-between ${getBorderColor(
                r.type,
                isSelected
              )}`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-100">
                  {getRouteIcon(r.type)}
                  <span>{r.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isRecommended && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                      AUTO-REC
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[10px] text-zinc-400 font-mono line-clamp-1 mb-2">
                {r.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono pt-1.5 border-t border-zinc-800/80">
                <div>
                  <div className="text-[9px] text-zinc-500">DIST / TIME</div>
                  <div className="text-zinc-200 font-semibold">{r.distance}s / {r.estTimeMinutes}m</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500">BURN (CAL/H2O)</div>
                  <div className="text-zinc-200 font-semibold">{r.calorieBurn}k / {r.waterBurn}L</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500">SURVIVAL ODDS</div>
                  <div className={`font-bold ${r.survivalProbability >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {r.survivalProbability}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
