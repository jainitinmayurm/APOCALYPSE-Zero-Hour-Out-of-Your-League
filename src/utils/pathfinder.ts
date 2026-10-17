import { Sector, RouteStats, RouteType, SharedInventory } from '../types';
import { parseSectorId, getSectorId } from '../data/initialMap';

interface NodeCost {
  sectorId: string;
  gScore: number;
  fScore: number;
}

// Manhattan heuristic
function heuristic(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

// Get 4-directional cardinal neighbors
function getNeighbors(row: number, col: number, sectorMap: Map<string, Sector>): Sector[] {
  const deltas = [
    [-1, 0], // North
    [1, 0],  // South
    [0, -1], // West
    [0, 1],  // East
  ];

  const neighbors: Sector[] = [];
  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 12 && nc >= 0 && nc < 12) {
      const neighborId = getSectorId(nr, nc);
      const s = sectorMap.get(neighborId);
      if (s && s.terrain !== 'blocked') {
        neighbors.push(s);
      }
    }
  }
  return neighbors;
}

// Step cost function based on Route Strategy
function calculateStepCost(
  fromSector: Sector,
  toSector: Sector,
  routeType: RouteType,
  isAcidRain: boolean
): number {
  const baseStep = 10;
  const threat = toSector.zombieDensity;
  const cover = toSector.structuralCover;

  if (routeType === 'ghost') {
    // Stealth Priority: heavily penalizes zombie density, favors structural cover & tunnels/alleys
    const stealthBonus = (toSector.terrain === 'tunnel' || toSector.terrain === 'alley') ? (isAcidRain ? 15 : 10) : 0;
    const coverDiscount = (cover / 100) * 12 + stealthBonus;
    const threatPenalty = Math.pow(threat / 10, 1.8) * 8;
    return Math.max(2, baseStep + threatPenalty - coverDiscount);
  } else if (routeType === 'blitz') {
    // Speed Priority: direct path, modest threat penalty
    const threatPenalty = (threat / 100) * 15;
    return baseStep + threatPenalty;
  } else {
    // Scavenge Detour: balanced cost, favors safe roads and supply accessibility
    const threatPenalty = Math.pow(threat / 10, 1.4) * 5;
    const coverBonus = (cover / 100) * 5;
    return Math.max(3, baseStep + threatPenalty - coverBonus);
  }
}

// Generic A* implementation between two points
export function findAStarPath(
  startId: string,
  goalId: string,
  sectorMap: Map<string, Sector>,
  routeType: RouteType,
  isAcidRain: boolean
): string[] {
  if (startId === goalId) return [startId];

  const startCoord = parseSectorId(startId);
  const goalCoord = parseSectorId(goalId);

  const openSet: NodeCost[] = [
    {
      sectorId: startId,
      gScore: 0,
      fScore: heuristic(startCoord.row, startCoord.col, goalCoord.row, goalCoord.col) * 10,
    },
  ];

  const cameFrom = new Map<string, string>();
  const gScores = new Map<string, number>();
  gScores.set(startId, 0);

  const closedSet = new Set<string>();

  while (openSet.length > 0) {
    // Sort to pick lowest fScore
    openSet.sort((a, b) => a.fScore - b.fScore);
    const current = openSet.shift()!;

    if (current.sectorId === goalId) {
      // Reconstruct path
      const path: string[] = [goalId];
      let curr = goalId;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        path.unshift(curr);
      }
      return path;
    }

    closedSet.add(current.sectorId);
    const currSector = sectorMap.get(current.sectorId);
    if (!currSector) continue;

    const neighbors = getNeighbors(currSector.row, currSector.col, sectorMap);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.id)) continue;

      const stepCost = calculateStepCost(currSector, neighbor, routeType, isAcidRain);
      const tentativeG = (gScores.get(current.sectorId) ?? Infinity) + stepCost;

      if (tentativeG < (gScores.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, current.sectorId);
        gScores.set(neighbor.id, tentativeG);

        const h = heuristic(neighbor.row, neighbor.col, goalCoord.row, goalCoord.col) * 10;
        const f = tentativeG + h;

        const existing = openSet.find((n) => n.sectorId === neighbor.id);
        if (existing) {
          existing.gScore = tentativeG;
          existing.fScore = f;
        } else {
          openSet.push({ sectorId: neighbor.id, gScore: tentativeG, fScore: f });
        }
      }
    }
  }

  // Fallback: direct line if disconnected
  return [startId, goalId];
}

// Compute comprehensive statistics for a given path
export function computeRouteStats(
  path: string[],
  type: RouteType,
  sectorMap: Map<string, Sector>,
  isAcidRain: boolean,
  scavengeTarget?: string
): RouteStats {
  const distance = Math.max(0, path.length - 1);
  let peakThreat = 0;
  let totalThreat = 0;
  let estTimeMinutes = 0;

  for (const id of path) {
    const s = sectorMap.get(id);
    if (s) {
      peakThreat = Math.max(peakThreat, s.zombieDensity);
      totalThreat += s.zombieDensity;

      // Base sector transit time: ~12 mins street, 16 mins alley, 10 mins overpass/tunnel
      let transit = 12;
      if (s.terrain === 'alley' || s.terrain === 'building') transit = 16;
      if (s.terrain === 'tunnel') transit = 11;
      if (s.terrain === 'overpass') transit = 8;
      if (s.zombieDensity > 60) transit += 6; // Sneaking delay
      estTimeMinutes += transit;
    }
  }

  // Resource burn calculations:
  // Base calories: ~140 kcal per sector, acid rain / weather +25%
  const weatherMultiplier = isAcidRain ? 1.25 : 1.0;
  const calorieBurn = Math.round(distance * 140 * weatherMultiplier);
  // Base water: ~0.18L per sector, weather +25%
  const waterBurn = parseFloat((distance * 0.18 * weatherMultiplier).toFixed(2));

  // Survival Probability Formula:
  // Ghost: high cover, avoids hordes -> 85-98%
  // Blitz: fast, high encounters -> 50-78%
  // Scavenge: depends on threat & gain -> 72-88%
  const avgThreat = distance > 0 ? totalThreat / distance : 0;
  let baseSurvival = 100 - (avgThreat * 0.45 + peakThreat * 0.35);

  if (type === 'ghost') {
    baseSurvival = Math.min(98, Math.max(45, baseSurvival + 22));
  } else if (type === 'blitz') {
    baseSurvival = Math.min(82, Math.max(25, baseSurvival - 12));
  } else {
    baseSurvival = Math.min(91, Math.max(38, baseSurvival + 6));
  }

  const configs: Record<RouteType, { name: string; color: string; desc: string }> = {
    ghost: {
      name: 'GHOST ROUTE',
      color: '#10b981',
      desc: 'Stealth Priority: Hugs service tunnels & alleyways. Minimizes horde encounters.',
    },
    blitz: {
      name: 'BLITZ ROUTE',
      color: '#f59e0b',
      desc: 'Speed Priority: Direct vector along main arteries. Highest gate clearance margin.',
    },
    scavenge: {
      name: 'SCAVENGE DETOUR',
      color: '#06b6d4',
      desc: 'Resource Priority: Detours via high-value supply caches to refuel rations & water.',
    },
  };

  return {
    type,
    name: configs[type].name,
    color: configs[type].color,
    path,
    distance,
    estTimeMinutes,
    calorieBurn,
    waterBurn,
    peakThreat,
    survivalProbability: Math.round(baseSurvival),
    description: configs[type].desc,
    scavengeTargetSector: scavengeTarget,
  };
}

// Find optimal unlooted supply cache for the Scavenge Detour
function findBestSupplyCache(
  currentSectorId: string,
  sectorMap: Map<string, Sector>,
  inventory: SharedInventory
): Sector | null {
  const currentCoord = parseSectorId(currentSectorId);
  const goalCoord = parseSectorId('L12');

  let bestSector: Sector | null = null;
  let bestScore = -Infinity;

  for (const sector of sectorMap.values()) {
    if (sector.terrain === 'supply' && !sector.looted) {
      const distFromCurrent = heuristic(currentCoord.row, currentCoord.col, sector.row, sector.col);
      const distToGoal = heuristic(sector.row, sector.col, goalCoord.row, goalCoord.col);
      const totalDetourDist = distFromCurrent + distToGoal;

      // Score based on needed supplies vs threat & distance
      const neededFoodScore = inventory.foodKcal < 1500 ? (sector.loot.food / 300) : 2;
      const neededWaterScore = inventory.waterLiters < 2.5 ? (sector.loot.water * 3) : 2;
      const lootValue = neededFoodScore + neededWaterScore + sector.loot.medkits * 5 + sector.loot.flares * 4;

      const penalty = totalDetourDist * 1.5 + (sector.zombieDensity / 100) * 8;
      const score = lootValue - penalty;

      if (score > bestScore) {
        bestScore = score;
        bestSector = sector;
      }
    }
  }

  return bestSector;
}

// Main calculation orchestrator computing all 3 routes simultaneously
export function calculateAllRoutes(
  currentPos: string,
  goalPos: string = 'L12',
  sectors: Sector[],
  inventory: SharedInventory,
  isAcidRain: boolean
): {
  ghost: RouteStats;
  blitz: RouteStats;
  scavenge: RouteStats;
  recommendedRoute: RouteType;
} {
  const sectorMap = new Map<string, Sector>();
  sectors.forEach((s) => sectorMap.set(s.id, s));

  // 1. Ghost Route (Stealth)
  const ghostPath = findAStarPath(currentPos, goalPos, sectorMap, 'ghost', isAcidRain);
  const ghostStats = computeRouteStats(ghostPath, 'ghost', sectorMap, isAcidRain);

  // 2. Blitz Route (Speed)
  const blitzPath = findAStarPath(currentPos, goalPos, sectorMap, 'blitz', isAcidRain);
  const blitzStats = computeRouteStats(blitzPath, 'blitz', sectorMap, isAcidRain);

  // 3. Scavenge Detour Route (Waypoint: Current -> Best Supply -> Goal)
  const bestSupply = findBestSupplyCache(currentPos, sectorMap, inventory);
  let scavengePath: string[] = [];
  let scavengeTarget: string | undefined = undefined;

  if (bestSupply && bestSupply.id !== currentPos && bestSupply.id !== goalPos) {
    scavengeTarget = bestSupply.id;
    const pathToSupply = findAStarPath(currentPos, bestSupply.id, sectorMap, 'scavenge', isAcidRain);
    const pathFromSupplyToGoal = findAStarPath(bestSupply.id, goalPos, sectorMap, 'scavenge', isAcidRain);

    // Merge paths without repeating the waypoint sector
    scavengePath = [...pathToSupply, ...pathFromSupplyToGoal.slice(1)];
  } else {
    scavengePath = findAStarPath(currentPos, goalPos, sectorMap, 'scavenge', isAcidRain);
  }

  const scavengeStats = computeRouteStats(scavengePath, 'scavenge', sectorMap, isAcidRain, scavengeTarget);

  // Determine auto-recommended route:
  // If water < 1.5L or food < 1000 kcal, heavily recommend Scavenge
  let recommendedRoute: RouteType = 'ghost';
  if (inventory.foodKcal < 1000 || inventory.waterLiters < 1.5) {
    recommendedRoute = 'scavenge';
  } else if (ghostStats.peakThreat > 75) {
    recommendedRoute = 'ghost'; // Ghost is safest under threat
  }

  return {
    ghost: ghostStats,
    blitz: blitzStats,
    scavenge: scavengeStats,
    recommendedRoute,
  };
}
