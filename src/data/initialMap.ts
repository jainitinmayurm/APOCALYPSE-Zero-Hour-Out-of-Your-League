import { Sector, TerrainType, LootManifest } from '../types';

export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const COL_COUNT = 12;

export function getSectorId(row: number, col: number): string {
  return `${ROW_LABELS[row]}${col + 1}`;
}

export function parseSectorId(id: string): { row: number; col: number } {
  const rowLetter = id[0];
  const colNum = parseInt(id.slice(1), 10);
  const row = ROW_LABELS.indexOf(rowLetter);
  const col = colNum - 1;
  return { row, col };
}

export function generateInitialMap(): Sector[] {
  const sectors: Sector[] = [];

  // Special sectors catalog
  const specialSectors: Record<string, Partial<Sector>> = {
    A1: {
      name: 'Safehouse Metro Station',
      terrain: 'safehouse',
      zombieDensity: 0,
      structuralCover: 95,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    L12: {
      name: 'The Last Beacon Evac Compound',
      terrain: 'beacon',
      zombieDensity: 5,
      structuralCover: 100,
      scoutedBy: 'both',
      loot: { food: 2000, water: 10, medkits: 5, flares: 4 },
      looted: false,
    },
    C4: {
      name: 'Mercy City Pharmacy',
      terrain: 'supply',
      zombieDensity: 32,
      structuralCover: 75,
      scoutedBy: 'aarav',
      loot: { food: 900, water: 2.5, medkits: 2, flares: 1 },
      looted: false,
    },
    B9: {
      name: 'National Guard Armory',
      terrain: 'supply',
      zombieDensity: 58,
      structuralCover: 85,
      scoutedBy: 'mira',
      loot: { food: 1400, water: 1.5, medkits: 1, flares: 3 },
      looted: false,
    },
    F3: {
      name: 'Wholesale Ration Depot',
      terrain: 'supply',
      zombieDensity: 45,
      structuralCover: 60,
      scoutedBy: 'both',
      loot: { food: 2400, water: 4.0, medkits: 1, flares: 1 },
      looted: false,
    },
    H8: {
      name: 'Fire Station 09',
      terrain: 'supply',
      zombieDensity: 40,
      structuralCover: 80,
      scoutedBy: 'aarav',
      loot: { food: 800, water: 2.0, medkits: 2, flares: 2 },
      looted: false,
    },
    E10: {
      name: 'Collapsed Highway Overpass',
      terrain: 'blocked',
      zombieDensity: 20,
      structuralCover: 30,
      scoutedBy: 'mira',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    G6: {
      name: 'Bio-Quarantine Crater',
      terrain: 'building',
      zombieDensity: 92,
      structuralCover: 15,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    J4: {
      name: 'Subway Service Tunnel Alpha',
      terrain: 'tunnel',
      zombieDensity: 18,
      structuralCover: 90,
      scoutedBy: 'aarav',
      loot: { food: 400, water: 1.0, medkits: 0, flares: 1 },
      looted: false,
    },
    J5: {
      name: 'Subway Service Tunnel Bravo',
      terrain: 'tunnel',
      zombieDensity: 15,
      structuralCover: 90,
      scoutedBy: 'aarav',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    J6: {
      name: 'Subway Service Tunnel Charlie',
      terrain: 'tunnel',
      zombieDensity: 22,
      structuralCover: 88,
      scoutedBy: 'mira',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    D7: {
      name: 'Infested Plaza (Horde Nest)',
      terrain: 'street',
      zombieDensity: 88,
      structuralCover: 20,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    I9: {
      name: 'Grand Central Ruins (Horde Nest)',
      terrain: 'street',
      zombieDensity: 85,
      structuralCover: 25,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    // Highway overpasses
    E6: {
      name: 'Central Overpass North',
      terrain: 'overpass',
      zombieDensity: 42,
      structuralCover: 50,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    E7: {
      name: 'Central Overpass Mid',
      terrain: 'overpass',
      zombieDensity: 40,
      structuralCover: 45,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    F6: {
      name: 'Central Overpass South',
      terrain: 'overpass',
      zombieDensity: 46,
      structuralCover: 48,
      scoutedBy: 'both',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    // Pre-blocked rubble choke points
    C8: {
      name: 'Rubble Barricade C8',
      terrain: 'blocked',
      zombieDensity: 15,
      structuralCover: 70,
      scoutedBy: 'mira',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    H3: {
      name: 'Submerged Sewer Canal',
      terrain: 'blocked',
      zombieDensity: 10,
      structuralCover: 20,
      scoutedBy: 'aarav',
      loot: { food: 0, water: 0, medkits: 0, flares: 0 },
      looted: true,
    },
    K8: {
      name: 'Burned Military Checkpoint',
      terrain: 'supply',
      zombieDensity: 52,
      structuralCover: 65,
      scoutedBy: 'mira',
      loot: { food: 600, water: 1.0, medkits: 1, flares: 1 },
      looted: false,
    },
  };

  // Generate 12x12 grid
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const id = getSectorId(r, c);

      if (specialSectors[id]) {
        sectors.push({
          id,
          row: r,
          col: c,
          name: specialSectors[id].name || `Sector ${id}`,
          terrain: specialSectors[id].terrain || 'street',
          zombieDensity: specialSectors[id].zombieDensity ?? 30,
          structuralCover: specialSectors[id].structuralCover ?? 50,
          loot: specialSectors[id].loot || { food: 0, water: 0, medkits: 0, flares: 0 },
          looted: specialSectors[id].looted ?? false,
          scoutedBy: specialSectors[id].scoutedBy || 'both',
          hasDecoyFlare: false,
          flareTurnsRemaining: 0,
        });
      } else {
        // Procedural realistic city terrain
        // Pseudo-random based on coordinates for determinism
        const hash = (r * 13 + c * 37 + (r ^ c) * 7) % 100;
        let terrain: TerrainType = 'street';
        let structuralCover = 40;
        let zombieDensity = 25;
        let scoutedBy: 'both' | 'aarav' | 'mira' = 'both';
        let loot: LootManifest = { food: 0, water: 0, medkits: 0, flares: 0 };
        let looted = true;

        if (hash < 20) {
          terrain = 'alley';
          structuralCover = 75;
          zombieDensity = 20 + (hash % 25);
          scoutedBy = hash % 2 === 0 ? 'aarav' : 'both';
        } else if (hash < 40) {
          terrain = 'building';
          structuralCover = 80;
          zombieDensity = 30 + (hash % 35);
          scoutedBy = hash % 2 === 0 ? 'mira' : 'both';
        } else if (hash < 48) {
          terrain = 'supply';
          structuralCover = 60;
          zombieDensity = 35 + (hash % 30);
          loot = {
            food: (hash % 3 + 1) * 350,
            water: ((hash % 2) + 0.8),
            medkits: hash % 4 === 0 ? 1 : 0,
            flares: hash % 3 === 0 ? 1 : 0,
          };
          looted = false;
        } else if (hash < 52 && r > 2 && r < 10 && c > 2 && c < 10) {
          terrain = 'overpass';
          structuralCover = 45;
          zombieDensity = 28;
        } else {
          terrain = 'street';
          structuralCover = 35;
          zombieDensity = 25 + (hash % 40);
        }

        // Distance from safehouse (A1 = (0,0)) increases general threat toward center
        const distCenter = Math.hypot(r - 5.5, c - 5.5);
        if (distCenter < 3) {
          zombieDensity = Math.min(95, zombieDensity + 25);
        }

        const streetNames = [
          'Terminal Blvd', 'Ash Corridor', 'Ironworks Alley', 'Broad St Viaduct',
          'Mercy Crossing', 'Redacted Ave', 'Haven Lane', 'Perimeter Trench',
          'Siren Way', 'Cinder St', 'Overlook Drive', 'Decay Plaza',
          'Ghost Line', 'Quarantine Rim', 'Sentry Path', 'Dead End Reach'
        ];
        const name = `${streetNames[(r * 4 + c) % streetNames.length]} (${id})`;

        sectors.push({
          id,
          row: r,
          col: c,
          name,
          terrain,
          zombieDensity: Math.round(zombieDensity),
          structuralCover,
          loot,
          looted,
          scoutedBy,
          hasDecoyFlare: false,
          flareTurnsRemaining: 0,
        });
      }
    }
  }

  return sectors;
}
