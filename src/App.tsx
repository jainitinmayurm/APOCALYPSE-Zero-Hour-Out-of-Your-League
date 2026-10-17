import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sector, 
  Survivor, 
  SharedInventory, 
  RouteType, 
  MapInteractionMode,
  TacticalDilemma,
  SyncPacketPayload,
  TelemetryLogEntry 
} from './types';
import { generateInitialMap, parseSectorId, getSectorId } from './data/initialMap';
import { calculateAllRoutes } from './utils/pathfinder';
import { soundEngine } from './utils/soundEngine';

import { Header } from './components/Header';
import { SurvivorPanel } from './components/SurvivorPanel';
import { TacticalMap } from './components/TacticalMap';
import { ThreatSimulatorBar } from './components/ThreatSimulatorBar';
import { RouteComparisonBar } from './components/RouteComparisonBar';
import { OfflineSyncPanel } from './components/OfflineSyncPanel';
import { DecisionModal, DILEMMA_PRESETS } from './components/DecisionModal';
import { SectorTelemetryModal } from './components/SectorTelemetryModal';

const STORAGE_KEY = 'beacon19_tactical_state_v2';

export default function App() {
  // 1. Initial State Definitions
  const initialAarav: Survivor = {
    name: 'Aarav',
    role: 'Field Scout & Heavy Carrier',
    health: 94,
    stamina: 88,
    hydration: 82,
    status: 'Optimal',
    packLoadKg: 24.5,
  };

  const initialMira: Survivor = {
    name: 'Mira',
    role: 'Combat Medic & Comms Specialist',
    health: 86,
    stamina: 79,
    hydration: 85,
    status: 'Optimal',
    radioSignalIntegrity: 74,
  };

  const initialInventory: SharedInventory = {
    foodKcal: 2200,
    waterLiters: 3.4,
    medkits: 3,
    flares: 2,
    batteryPercent: 88,
  };

  // 2. State hooks with LocalStorage persistence
  const [sectors, setSectors] = useState<Sector[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sectors`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generateInitialMap();
  });

  const [currentPos, setCurrentPos] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_pos`) || 'A1';
  });

  const [aarav, setAarav] = useState<Survivor>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_aarav`);
    return saved ? JSON.parse(saved) : initialAarav;
  });

  const [mira, setMira] = useState<Survivor>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_mira`);
    return saved ? JSON.parse(saved) : initialMira;
  });

  const [inventory, setInventory] = useState<SharedInventory>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inv`);
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_countdown`);
    return saved ? parseInt(saved, 10) : 3 * 3600 + 45 * 60; // 03:45:00
  });

  const [activeRouteType, setActiveRouteType] = useState<RouteType>('ghost');
  const [interactionMode, setInteractionMode] = useState<MapInteractionMode>('inspect');
  const [isAcidRain, setIsAcidRain] = useState<boolean>(false);
  const [isAmbushAlert, setIsAmbushAlert] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);
  const [activePreset, setActivePreset] = useState<number>(1);
  const [isAirGapMode, setIsAirGapMode] = useState<boolean>(false);
  const [devicePerspective, setDevicePerspective] = useState<'all' | 'aarav' | 'mira'>('all');

  // Sync simulation state
  const [pendingDeltaPackets, setPendingDeltaPackets] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncPacket, setSyncPacket] = useState<SyncPacketPayload | null>(null);

  // Modals & Inspection
  const [inspectedSector, setInspectedSector] = useState<Sector | null>(null);
  const [hoveredSector, setHoveredSector] = useState<Sector | null>(null);
  const [activeDilemma, setActiveDilemma] = useState<TacticalDilemma | null>(null);
  const [isDilemmaOpen, setIsDilemmaOpen] = useState<boolean>(false);

  // Comms Log
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'log-1',
      time: '06:00:14',
      source: 'SYSTEM',
      message: 'Day 19 Tactical Terminal boot sequence complete. GPS unavailable. Offline dead-reckoning engaged.',
      type: 'info',
    },
    {
      id: 'log-2',
      time: '06:01:22',
      source: 'BEACON_RADAR',
      message: 'The Last Beacon (L12) high-frequency evacuation beacon acquired. Gate closure in 03:45:00.',
      type: 'warn',
    },
    {
      id: 'log-3',
      time: '06:02:40',
      source: 'AARAV_01',
      message: 'Safehouse A1 secure. Rations packed (2,200 kcal, 3.4L H2O). Awaiting departure vector.',
      type: 'success',
    },
  ]);

  const addLog = useCallback((source: TelemetryLogEntry['source'], message: string, type: TelemetryLogEntry['type'] = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: TelemetryLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: timeStr,
      source,
      message,
      type,
    };
    setTelemetryLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sectors`, JSON.stringify(sectors));
    localStorage.setItem(`${STORAGE_KEY}_pos`, currentPos);
    localStorage.setItem(`${STORAGE_KEY}_aarav`, JSON.stringify(aarav));
    localStorage.setItem(`${STORAGE_KEY}_mira`, JSON.stringify(mira));
    localStorage.setItem(`${STORAGE_KEY}_inv`, JSON.stringify(inventory));
    localStorage.setItem(`${STORAGE_KEY}_countdown`, countdownSeconds.toString());
  }, [sectors, currentPos, aarav, mira, inventory, countdownSeconds]);

  // Live Countdown Timer (1 sec tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          addLog('BEACON_RADAR', 'EVACUATION GATES CLOSED AT SECTOR L12. ZERO EXTRACTION WINDOW REMAINING.', 'danger');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [addLog]);

  // 3. Multi-Heuristic A* Path Calculation
  const routeCalculations = useMemo(() => {
    return calculateAllRoutes(currentPos, 'L12', sectors, inventory, isAcidRain);
  }, [currentPos, sectors, inventory, isAcidRain]);

  const activeRoute = routeCalculations[activeRouteType];

  // 4. Reset Function
  const handleResetToDay19 = useCallback(() => {
    soundEngine.playSonarPing();
    const freshMap = generateInitialMap();
    setSectors(freshMap);
    setCurrentPos('A1');
    setAarav(initialAarav);
    setMira(initialMira);
    setInventory(initialInventory);
    setCountdownSeconds(3 * 3600 + 45 * 60);
    setActiveRouteType('ghost');
    setIsAcidRain(false);
    setIsAmbushAlert(false);
    setPendingDeltaPackets(0);
    setActivePreset(1);
    addLog('SYSTEM', 'Hard Reset: Day 19 Initial baseline restored. Safehouse Metro A1 ready.', 'info');
  }, [addLog]);

  // 5. Judge Demo Presets Loader
  const handleLoadPreset = useCallback((presetId: number) => {
    soundEngine.playSonarPing();
    setActivePreset(presetId);

    if (presetId === 1) {
      // Dawn Start at A1
      handleResetToDay19();
      addLog('SYSTEM', 'Loaded Demo Preset 1: Day 19 Morning Departure from Safehouse A1.', 'success');
    } else if (presetId === 2) {
      // Mid-City Ambush at F6
      const baseMap = generateInitialMap();
      const updated = baseMap.map((s) => {
        if (s.id === 'F6' || s.id === 'E6' || s.id === 'F7') {
          return { ...s, zombieDensity: 88, terrain: 'street' as const };
        }
        return s;
      });
      setSectors(updated);
      setCurrentPos('D4');
      setCountdownSeconds(2 * 3600 + 15 * 60);
      setAarav({ ...initialAarav, stamina: 68, hydration: 65, status: 'Fatigued' });
      setMira({ ...initialMira, stamina: 72, hydration: 70 });
      setInventory({ ...initialInventory, foodKcal: 1600, waterLiters: 2.1 });
      setIsAmbushAlert(true);
      soundEngine.playHordeAlert();
      addLog('BEACON_RADAR', 'Loaded Demo Preset 2: Mid-City Ambush. Massive horde detected across Sector F6 highway corridor.', 'danger');
    } else if (presetId === 3) {
      // Critical Dehydration Crisis (Forces Scavenge Detour)
      const baseMap = generateInitialMap();
      setSectors(baseMap);
      setCurrentPos('E4');
      setCountdownSeconds(1 * 3600 + 50 * 60);
      setAarav({ ...initialAarav, stamina: 42, hydration: 28, status: 'Dehydrated' });
      setMira({ ...initialMira, stamina: 45, hydration: 32, status: 'Dehydrated' });
      setInventory({ ...initialInventory, foodKcal: 700, waterLiters: 0.7 });
      setActiveRouteType('scavenge');
      soundEngine.playHordeAlert();
      addLog('AARAV_01', 'Loaded Demo Preset 3: Critical Thirst Crisis. Hydration 28%, Water 0.7L. Auto-switching to Scavenge Detour.', 'warn');
    } else if (presetId === 4) {
      // Final Evacuation Approach (K10 -> L12)
      const baseMap = generateInitialMap();
      setSectors(baseMap);
      setCurrentPos('K10');
      setCountdownSeconds(28 * 60); // 28 minutes left!
      setAarav({ ...initialAarav, health: 70, stamina: 35, hydration: 40, status: 'Exposed' });
      setMira({ ...initialMira, health: 75, stamina: 38, hydration: 44, status: 'Exposed' });
      setInventory({ ...initialInventory, foodKcal: 400, waterLiters: 0.9, flares: 1 });
      setActiveRouteType('blitz');
      soundEngine.playHordeAlert();
      addLog('BEACON_RADAR', 'Loaded Demo Preset 4: Final Approach! Beacon gates closing in 28 mins! Sprint vector active.', 'danger');
    }
  }, [handleResetToDay19, addLog]);

  // 6. Turn-by-Turn Step Forward Execution
  const handleStepForward = useCallback(() => {
    const path = activeRoute.path;
    const currentIndex = path.indexOf(currentPos);

    if (currentIndex === -1 || currentIndex >= path.length - 1) {
      if (currentPos === 'L12') {
        soundEngine.playSupplyPickup();
        addLog('BEACON_RADAR', 'MISSION SUCCESS! Aarav and Mira have reached The Last Beacon (L12)! Evacuation confirmed.', 'success');
      } else {
        addLog('SYSTEM', 'Cannot step forward: Destination reached or path re-calculation required.', 'warn');
      }
      return;
    }

    const nextSectorId = path[currentIndex + 1];
    const nextSector = sectors.find((s) => s.id === nextSectorId);
    if (!nextSector) return;

    // Move survivor
    setCurrentPos(nextSectorId);

    // Resource burns
    const weatherMult = isAcidRain ? 1.25 : 1.0;
    const foodBurn = Math.round(140 * weatherMult);
    const waterBurn = parseFloat((0.18 * weatherMult).toFixed(2));

    setInventory((prev) => ({
      ...prev,
      foodKcal: Math.max(0, prev.foodKcal - foodBurn),
      waterLiters: Math.max(0, parseFloat((prev.waterLiters - waterBurn).toFixed(2))),
      batteryPercent: Math.max(5, prev.batteryPercent - 1),
    }));

    // Survivor status updates
    setAarav((prev) => {
      const newStamina = Math.max(10, prev.stamina - (isAcidRain ? 6 : 4));
      const newHydration = Math.max(10, prev.hydration - 5);
      let status = prev.status;
      if (newHydration < 30) status = 'Dehydrated';
      else if (newStamina < 30) status = 'Fatigued';
      else if (nextSector.zombieDensity > 60) status = 'Exposed';
      return { ...prev, stamina: newStamina, hydration: newHydration, status };
    });

    setMira((prev) => {
      const newStamina = Math.max(10, prev.stamina - (isAcidRain ? 5 : 4));
      const newHydration = Math.max(10, prev.hydration - 5);
      let status = prev.status;
      if (newHydration < 30) status = 'Dehydrated';
      else if (newStamina < 30) status = 'Fatigued';
      else if (nextSector.zombieDensity > 60) status = 'Exposed';
      return { ...prev, stamina: newStamina, hydration: newHydration, status };
    });

    // Advance countdown by 12 mins
    setCountdownSeconds((prev) => Math.max(0, prev - 12 * 60));

    // Handle Flare decay
    setSectors((prev) =>
      prev.map((s) => {
        if (s.hasDecoyFlare && (s.flareTurnsRemaining ?? 0) > 0) {
          const remaining = (s.flareTurnsRemaining ?? 0) - 1;
          return {
            ...s,
            flareTurnsRemaining: remaining,
            hasDecoyFlare: remaining > 0,
          };
        }
        return s;
      })
    );

    addLog('AARAV_01', `Advanced to ${nextSector.name} (${nextSectorId}). Threat: ${nextSector.zombieDensity}%, Cover: ${nextSector.structuralCover}%.`, 'info');

    // Auto Scavenge check
    if (nextSector.terrain === 'supply' && !nextSector.looted) {
      soundEngine.playSupplyPickup();
      const loot = nextSector.loot;
      setInventory((prev) => ({
        ...prev,
        foodKcal: prev.foodKcal + loot.food,
        waterLiters: parseFloat((prev.waterLiters + loot.water).toFixed(2)),
        medkits: prev.medkits + loot.medkits,
        flares: prev.flares + loot.flares,
      }));

      // Mark sector looted
      setSectors((prev) =>
        prev.map((s) => (s.id === nextSectorId ? { ...s, looted: true } : s))
      );

      addLog('MIRA_02', `SCAVENGED CACHE at ${nextSectorId}: +${loot.food}kcal, +${loot.water}L H2O, +${loot.medkits} Medkits, +${loot.flares} Flares!`, 'success');
    }

    // Trigger Dilemma on critical condition or high threat
    if (nextSector.zombieDensity >= 70 && !isDilemmaOpen) {
      soundEngine.playHordeAlert();
      setActiveDilemma(DILEMMA_PRESETS[1]); // Bio-quarantine / Ambush
      setIsDilemmaOpen(true);
    } else if (inventory.waterLiters < 1.2 && !isDilemmaOpen) {
      soundEngine.playHordeAlert();
      setActiveDilemma(DILEMMA_PRESETS[2]); // Hydration crisis
      setIsDilemmaOpen(true);
    } else if (nextSectorId === 'K11' && countdownSeconds < 45 * 60 && !isDilemmaOpen) {
      soundEngine.playHordeAlert();
      setActiveDilemma(DILEMMA_PRESETS[4]); // Final Beacon approach
      setIsDilemmaOpen(true);
    }
  }, [activeRoute, currentPos, sectors, isAcidRain, isDilemmaOpen, inventory, countdownSeconds, addLog]);

  // 7. Map Tools Handler
  const handleSectorClick = useCallback((sector: Sector) => {
    soundEngine.playSonarPing();

    if (interactionMode === 'inspect') {
      setInspectedSector(sector);
    } else if (interactionMode === 'paint_horde') {
      soundEngine.playHordeAlert();
      const { row, col } = parseSectorId(sector.id);
      // Spawn +50% threat on cell and +20% on adjacent
      setSectors((prev) =>
        prev.map((s) => {
          if (s.id === sector.id) {
            return { ...s, zombieDensity: Math.min(100, s.zombieDensity + 50) };
          }
          const dr = Math.abs(s.row - row);
          const dc = Math.abs(s.col - col);
          if (dr <= 1 && dc <= 1) {
            return { ...s, zombieDensity: Math.min(100, s.zombieDensity + 20) };
          }
          return s;
        })
      );
      addLog('BEACON_RADAR', `Tactical Alert: Zombie Horde surge painted at ${sector.id} (+50% Density). Rerouting active.`, 'danger');
    } else if (interactionMode === 'toggle_block') {
      setSectors((prev) =>
        prev.map((s) => {
          if (s.id === sector.id) {
            const newTerrain = s.terrain === 'blocked' ? 'street' : 'blocked';
            return { ...s, terrain: newTerrain };
          }
          return s;
        })
      );
      addLog('AARAV_01', `Roadblock toggled at Sector ${sector.id}. Vector recalculated.`, 'warn');
    } else if (interactionMode === 'drop_supply') {
      soundEngine.playSupplyPickup();
      setSectors((prev) =>
        prev.map((s) => {
          if (s.id === sector.id) {
            return {
              ...s,
              terrain: 'supply',
              looted: false,
              loot: { food: 1200, water: 2.0, medkits: 1, flares: 1 },
            };
          }
          return s;
        })
      );
      addLog('MIRA_02', `Emergency Supply Cache airdropped at Sector ${sector.id}.`, 'success');
    } else if (interactionMode === 'deploy_flare') {
      if (inventory.flares < 1) {
        addLog('SYSTEM', 'Cannot deploy decoy flare: Zero flares in shared inventory.', 'warn');
        return;
      }
      soundEngine.playHordeAlert();
      // Deduct flare
      setInventory((prev) => ({ ...prev, flares: prev.flares - 1 }));

      const { row, col } = parseSectorId(sector.id);
      // Deploy flare and suck threat toward it from 3x3 radius
      setSectors((prev) =>
        prev.map((s) => {
          if (s.id === sector.id) {
            return {
              ...s,
              hasDecoyFlare: true,
              flareTurnsRemaining: 3,
              zombieDensity: Math.min(95, s.zombieDensity + 40),
            };
          }
          const dr = Math.abs(s.row - row);
          const dc = Math.abs(s.col - col);
          if (dr <= 1 && dc <= 1) {
            // Relieve adjacent cells
            return { ...s, zombieDensity: Math.max(10, s.zombieDensity - 35) };
          }
          return s;
        })
      );
      addLog('AARAV_01', `Acoustic Decoy Flare ignited at ${sector.id}! Hordes drawn inward away from perimeter.`, 'success');
    }
  }, [interactionMode, inventory.flares, addLog]);

  // 8. Threat Simulator Top Toolbar Handlers
  const handleSpawnAmbush = useCallback(() => {
    const path = activeRoute.path;
    if (path.length <= 2) return;
    const midIndex = Math.floor(path.length / 2);
    const targetSectorId = path[midIndex];

    setSectors((prev) =>
      prev.map((s) => (s.id === targetSectorId ? { ...s, zombieDensity: 88 } : s))
    );
    setIsAmbushAlert(true);
    soundEngine.playHordeAlert();
    addLog('BEACON_RADAR', `AMBUSH DETECTED! High-density zombie horde (88%) spawned at mid-point ${targetSectorId}!`, 'danger');

    setTimeout(() => setIsAmbushAlert(false), 5000);
  }, [activeRoute, addLog]);

  const handleAdvanceTime = useCallback(() => {
    // Cellular automata horde migration: hordes shift slightly toward noisy/central sectors
    setSectors((prev) =>
      prev.map((s) => {
        if (s.zombieDensity > 50 && s.terrain !== 'beacon') {
          // slight random diffusion
          const delta = (Math.random() - 0.45) * 8;
          return { ...s, zombieDensity: Math.min(98, Math.max(15, Math.round(s.zombieDensity + delta))) };
        }
        return s;
      })
    );
    // Decrease beacon timer by 30 mins
    setCountdownSeconds((prev) => Math.max(0, prev - 30 * 60));
    addLog('SYSTEM', 'Time Jump +30m executed. Zombie hordes migrated. Evacuation countdown decremented.', 'warn');
  }, [addLog]);

  const handleCollapseOverpass = useCallback(() => {
    const overpassSectors = ['E6', 'E7', 'F6'];
    setSectors((prev) =>
      prev.map((s) => {
        if (overpassSectors.includes(s.id)) {
          return { ...s, terrain: 'blocked', name: `Collapsed Highway Viaduct (${s.id})` };
        }
        return s;
      })
    );
    soundEngine.playHordeAlert();
    addLog('BEACON_RADAR', 'STRUCTURAL FAILURE: Central Highway Overpass (E6, E7, F6) has collapsed into impassable rubble!', 'danger');
  }, [addLog]);

  const handleToggleAcidRain = useCallback(() => {
    setIsAcidRain((prev) => {
      const next = !prev;
      addLog('SYSTEM', next ? 'Atmospheric Alert: Acid Rain engaged (+25% burn, +30% tunnel cover).' : 'Atmospheric Alert: Acid Rain cleared.', 'warn');
      return next;
    });
  }, [addLog]);

  // 9. Survivor Panel Handlers
  const handleEatRation = useCallback(() => {
    setInventory((prev) => ({ ...prev, foodKcal: Math.max(0, prev.foodKcal - 600) }));
    setAarav((prev) => ({ ...prev, stamina: Math.min(100, prev.stamina + 15), status: prev.stamina + 15 > 40 ? 'Optimal' : prev.status }));
    setMira((prev) => ({ ...prev, stamina: Math.min(100, prev.stamina + 15), status: prev.stamina + 15 > 40 ? 'Optimal' : prev.status }));
    addLog('AARAV_01', 'Consumed field ration (-600 kcal): +15% Stamina replenished for Aarav & Mira.', 'info');
  }, [addLog]);

  const handleDrinkWater = useCallback(() => {
    setInventory((prev) => ({ ...prev, waterLiters: parseFloat(Math.max(0, prev.waterLiters - 0.5).toFixed(2)) }));
    setAarav((prev) => ({ ...prev, hydration: Math.min(100, prev.hydration + 20), status: prev.hydration + 20 > 40 ? 'Optimal' : prev.status }));
    setMira((prev) => ({ ...prev, hydration: Math.min(100, prev.hydration + 20), status: prev.hydration + 20 > 40 ? 'Optimal' : prev.status }));
    addLog('MIRA_02', 'Rationed drinking water (-0.5L): +20% Hydration restored.', 'info');
  }, [addLog]);

  const handleApplyMedkit = useCallback((targetName: 'Aarav' | 'Mira') => {
    setInventory((prev) => ({ ...prev, medkits: Math.max(0, prev.medkits - 1) }));
    if (targetName === 'Aarav') {
      setAarav((prev) => ({ ...prev, health: Math.min(100, prev.health + 35) }));
      addLog('MIRA_02', `Applied trauma medkit to Aarav: +35% Health stabilized.`, 'success');
    } else {
      setMira((prev) => ({ ...prev, health: Math.min(100, prev.health + 35) }));
      addLog('AARAV_01', `Assisted Mira with trauma medkit: +35% Health stabilized.`, 'success');
    }
  }, [addLog]);

  // 10. Dilemma Execution
  const handleSelectChoice = useCallback((choiceIndex: number) => {
    if (!activeDilemma) return;
    const choice = activeDilemma.choices[choiceIndex];

    // Apply resource impact
    const r = choice.resourceImpact;
    setInventory((prev) => ({
      ...prev,
      foodKcal: Math.max(0, prev.foodKcal + (r.food || 0)),
      waterLiters: parseFloat(Math.max(0, prev.waterLiters + (r.water || 0)).toFixed(2)),
      medkits: Math.max(0, prev.medkits + (r.medkits || 0)),
      flares: Math.max(0, prev.flares + (r.flares || 0)),
    }));

    if (r.stamina) {
      setAarav((prev) => ({ ...prev, stamina: Math.min(100, Math.max(10, prev.stamina + r.stamina!)) }));
      setMira((prev) => ({ ...prev, stamina: Math.min(100, Math.max(10, prev.stamina + r.stamina!)) }));
    }

    if (r.timeMinutes) {
      setCountdownSeconds((prev) => Math.max(0, prev - r.timeMinutes! * 60));
    }

    if (choice.routeAction === 'reroute_tunnel') {
      setActiveRouteType('ghost');
    } else if (choice.routeAction === 'scavenge_detour') {
      setActiveRouteType('scavenge');
    }

    soundEngine.playSupplyPickup();
    addLog('DEAD_AIR_SYNC', `DILEMMA RESOLVED: Selected "${choice.label}". Survival Odds Delta: ${choice.survivalImpact > 0 ? '+' : ''}${choice.survivalImpact}%.`, 'success');

    setIsDilemmaOpen(false);
  }, [activeDilemma, addLog]);

  // 11. P2P Offline Sync Simulator
  const handleSimulateAaravScout = useCallback(() => {
    // Generate 2 un-synced hazards/supplies scouted only by Aarav
    setPendingDeltaPackets((prev) => prev + 2);
    setSectors((prev) => {
      const copy = [...prev];
      const s1 = copy.find((s) => s.id === 'D5');
      const s2 = copy.find((s) => s.id === 'G4');
      if (s1) {
        s1.scoutedBy = 'aarav';
        s1.zombieDensity = 72;
      }
      if (s2) {
        s2.scoutedBy = 'aarav';
        s2.terrain = 'supply';
        s2.looted = false;
        s2.loot = { food: 800, water: 1.5, medkits: 1, flares: 0 };
      }
      return copy;
    });

    addLog('AARAV_01', 'Aarav scouted ahead 2 sectors: Discovered Nest at D5 (72% threat) and Pharmacy cache at G4. Buffer stored on Unit 01.', 'warn');
  }, [addLog]);

  const handleBroadcastSync = useCallback(() => {
    setIsSyncing(true);
    soundEngine.playAcousticModemSync();

    const payload: SyncPacketPayload = {
      from: 'AARAV_01',
      day: 19,
      timestamp: new Date().toISOString(),
      pos: currentPos,
      hazards: [
        { sectorId: 'D5', density: 72 },
        { sectorId: 'D7', density: 88 },
      ],
      supplies: [
        { sectorId: 'G4', loot: { food: 800, water: 1.5, medkits: 1, flares: 0 } },
      ],
      checksum: '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase(),
    };

    setSyncPacket(payload);

    setTimeout(() => {
      // Sync all sectors to 'both'
      setSectors((prev) => prev.map((s) => ({ ...s, scoutedBy: 'both' as const })));
      setPendingDeltaPackets(0);
      setIsSyncing(false);
      soundEngine.playSupplyPickup();

      addLog('DEAD_AIR_SYNC', `ACOUSTIC FSK HANDSHAKE COMPLETE: Checksum ${payload.checksum} verified. Mira Unit 02 brought to 100% parity.`, 'success');
    }, 1250);
  }, [currentPos, addLog]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Command Bar */}
      <Header
        countdownSeconds={countdownSeconds}
        survivalProbability={activeRoute.survivalProbability}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundEngine.toggleMute())}
        onReset={handleResetToDay19}
        onLoadPreset={handleLoadPreset}
        activePreset={activePreset}
        isAirGapMode={isAirGapMode}
      />

      {/* Main 12-Column Tactical Dashboard Layout */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar (3 Columns): Survivor Telemetry & Shared Ration Pack */}
        <div className="lg:col-span-3 h-full">
          <SurvivorPanel
            aarav={aarav}
            mira={mira}
            inventory={inventory}
            onEatRation={handleEatRation}
            onDrinkWater={handleDrinkWater}
            onApplyMedkit={handleApplyMedkit}
            onTriggerDilemma={() => {
              setActiveDilemma(DILEMMA_PRESETS[0]);
              setIsDilemmaOpen(true);
            }}
          />
        </div>

        {/* Center Panel (6 Columns): Threat Sim Toolbar + Tactical 12x12 Map + Step Engine */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <ThreatSimulatorBar
            onSpawnAmbush={handleSpawnAmbush}
            onAdvanceTime={handleAdvanceTime}
            onCollapseOverpass={handleCollapseOverpass}
            onToggleAcidRain={handleToggleAcidRain}
            onStepForward={handleStepForward}
            isAcidRain={isAcidRain}
            isAmbushAlert={isAmbushAlert}
            canStep={currentPos !== 'L12'}
            currentSectorId={currentPos}
          />

          <TacticalMap
            sectors={sectors}
            currentPos={currentPos}
            ghostRoute={routeCalculations.ghost}
            blitzRoute={routeCalculations.blitz}
            scavengeRoute={routeCalculations.scavenge}
            activeRouteType={activeRouteType}
            interactionMode={interactionMode}
            onSetInteractionMode={setInteractionMode}
            onSectorClick={handleSectorClick}
            devicePerspective={devicePerspective}
            hoveredSector={hoveredSector}
            onHoverSector={setHoveredSector}
          />

          {/* Route Comparison Matrix */}
          <RouteComparisonBar
            ghostRoute={routeCalculations.ghost}
            blitzRoute={routeCalculations.blitz}
            scavengeRoute={routeCalculations.scavenge}
            selectedRouteType={activeRouteType}
            recommendedRouteType={routeCalculations.recommendedRoute}
            onSelectRoute={setActiveRouteType}
          />
        </div>

        {/* Right Sidebar (3 Columns): DEAD-AIR Offline P2P Sync & Live Comms Log */}
        <div className="lg:col-span-3 h-full">
          <OfflineSyncPanel
            isAirGapMode={isAirGapMode}
            onToggleAirGap={() => setIsAirGapMode((prev) => !prev)}
            devicePerspective={devicePerspective}
            onSetDevicePerspective={setDevicePerspective}
            pendingDeltaPackets={pendingDeltaPackets}
            onSimulateAaravScout={handleSimulateAaravScout}
            onBroadcastSync={handleBroadcastSync}
            isSyncing={isSyncing}
            syncPacket={syncPacket}
            telemetryLogs={telemetryLogs}
          />
        </div>
      </main>

      {/* Tactical Dilemma Modal */}
      <DecisionModal
        dilemma={activeDilemma}
        isOpen={isDilemmaOpen}
        onClose={() => setIsDilemmaOpen(false)}
        onSelectChoice={handleSelectChoice}
      />

      {/* Sector Telemetry Dossier Modal */}
      <SectorTelemetryModal
        sector={inspectedSector}
        isOpen={!!inspectedSector}
        onClose={() => setInspectedSector(null)}
        onScavengeLoot={(sectorId) => {
          const s = sectors.find((sec) => sec.id === sectorId);
          if (s && !s.looted) {
            setInventory((prev) => ({
              ...prev,
              foodKcal: prev.foodKcal + s.loot.food,
              waterLiters: parseFloat((prev.waterLiters + s.loot.water).toFixed(2)),
              medkits: prev.medkits + s.loot.medkits,
              flares: prev.flares + s.loot.flares,
            }));
            setSectors((prev) =>
              prev.map((sec) => (sec.id === sectorId ? { ...sec, looted: true } : sec))
            );
            addLog('MIRA_02', `Manually scavenged cache at ${sectorId}: +${s.loot.food}kcal, +${s.loot.water}L.`, 'success');
          }
        }}
        onAdjustThreat={(sectorId, delta) => {
          setSectors((prev) =>
            prev.map((s) =>
              s.id === sectorId
                ? { ...s, zombieDensity: Math.min(100, Math.max(0, s.zombieDensity + delta)) }
                : s
            )
          );
          addLog('BEACON_RADAR', `Threat density adjusted manually at ${sectorId} (${delta > 0 ? '+' : ''}${delta}%).`, 'info');
        }}
      />
    </div>
  );
}
