export type TerrainType =
  | 'street'
  | 'alley'
  | 'building'
  | 'supply'
  | 'tunnel'
  | 'overpass'
  | 'safehouse'
  | 'beacon'
  | 'blocked';

export type ScoutedBy = 'both' | 'aarav' | 'mira';

export interface LootManifest {
  food: number; // kcal
  water: number; // Liters
  medkits: number;
  flares: number;
}

export interface Sector {
  id: string; // e.g. "A1", "C4"
  row: number; // 0 to 11 (A-L)
  col: number; // 0 to 11 (1-12)
  name: string;
  terrain: TerrainType;
  zombieDensity: number; // 0 - 100%
  structuralCover: number; // 0 - 100%
  loot: LootManifest;
  looted: boolean;
  scoutedBy: ScoutedBy;
  hasDecoyFlare?: boolean;
  flareTurnsRemaining?: number;
}

export type RouteType = 'ghost' | 'blitz' | 'scavenge';

export interface RouteStats {
  type: RouteType;
  name: string;
  color: string;
  path: string[]; // Sector IDs
  distance: number; // Sectors count
  estTimeMinutes: number;
  calorieBurn: number; // kcal
  waterBurn: number; // L
  peakThreat: number; // %
  survivalProbability: number; // %
  description: string;
  scavengeTargetSector?: string;
}

export interface Survivor {
  name: string;
  role: string;
  health: number; // 0 - 100%
  stamina: number; // 0 - 100%
  hydration: number; // 0 - 100%
  status: 'Optimal' | 'Fatigued' | 'Dehydrated' | 'Exposed' | 'Critical';
  packLoadKg?: number;
  radioSignalIntegrity?: number; // 0 - 100%
}

export interface SharedInventory {
  foodKcal: number;
  waterLiters: number;
  medkits: number;
  flares: number;
  batteryPercent: number;
}

export type MapInteractionMode =
  | 'inspect'
  | 'paint_horde'
  | 'toggle_block'
  | 'drop_supply'
  | 'deploy_flare';

export interface TacticalDilemma {
  id: string;
  title: string;
  triggerCondition: string;
  narrative: string;
  location: string;
  choices: {
    label: string;
    description: string;
    survivalImpact: number; // delta %
    resourceImpact: {
      food?: number;
      water?: number;
      medkits?: number;
      flares?: number;
      stamina?: number;
      timeMinutes?: number;
    };
    routeAction?: 'none' | 'reroute_tunnel' | 'scavenge_detour';
  }[];
}

export interface SyncPacketPayload {
  from: string;
  day: number;
  timestamp: string;
  pos: string;
  hazards: { sectorId: string; density: number }[];
  supplies: { sectorId: string; loot: LootManifest }[];
  checksum: string;
}

export interface TelemetryLogEntry {
  id: string;
  time: string;
  source: 'SYSTEM' | 'AARAV_01' | 'MIRA_02' | 'BEACON_RADAR' | 'DEAD_AIR_SYNC';
  message: string;
  type: 'info' | 'warn' | 'danger' | 'success';
}
