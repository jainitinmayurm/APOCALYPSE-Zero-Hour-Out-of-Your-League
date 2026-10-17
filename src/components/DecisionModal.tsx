import React from 'react';
import { TacticalDilemma } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface DecisionModalProps {
  dilemma: TacticalDilemma | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectChoice: (choiceIndex: number) => void;
}

export const DILEMMA_PRESETS: TacticalDilemma[] = [
  {
    id: 'dilemma-1',
    title: 'CRISIS: MERCIFUL PHARMACY BREACH',
    location: 'Sector C4 // Commercial Crossing',
    triggerCondition: 'Critical Medkit Depletion & Local Horde Movement',
    narrative:
      'Aarav and Mira have reached the perimeter of Mercy City Pharmacy. A cluster of 15 infected are beating against the glass storefront. Inside lies a sealed trauma locker and fresh water gallons. Aarav is breathing heavily under his 24kg pack, and Mira notes their hydration is sinking fast.',
    choices: [
      {
        label: 'TACTICAL DECOY BREACH (HIGH RISK / HIGH REWARD)',
        description: 'Deploy 1 Acoustic Decoy Flare into the opposite alleyway. Scavenge the pharmacy locker unhindered.',
        survivalImpact: 14,
        resourceImpact: {
          flares: -1,
          food: 900,
          water: 2.5,
          medkits: 2,
          timeMinutes: 15,
        },
        routeAction: 'none',
      },
      {
        label: 'SUBWAY TUNNEL BYPASS (STEALTH DRIFT)',
        description: 'Bypass the pharmacy entirely via the flooded service tunnel J4. Avoid combat at the cost of calorie burn.',
        survivalImpact: 8,
        resourceImpact: {
          food: -250,
          water: -0.4,
          stamina: -15,
          timeMinutes: 30,
        },
        routeAction: 'reroute_tunnel',
      },
      {
        label: 'EMERGENCY HALF-RATION SPRINT',
        description: 'Cut daily rations by 50% and perform a sustained double-time march across the broad avenue before dawn.',
        survivalImpact: -5,
        resourceImpact: {
          stamina: -25,
          food: -100,
          timeMinutes: -20,
        },
        routeAction: 'none',
      },
    ],
  },
  {
    id: 'dilemma-2',
    title: 'AMBUSH: BIO-QUARANTINE SPIKE',
    location: 'Sector G6 // Crater Verge',
    triggerCondition: 'Extreme Zombie Density (>85%) on Trajectory',
    narrative:
      'The direct path through Central Overpass is choked with dense, twitching crowds. Sensors register a bio-containment breach crater emitting chemical particulate. Mira’s radio picks up faint screams from another scavenger team being overrun.',
    choices: [
      {
        label: 'RADIO SIGNAL DISTRACTION BURST',
        description: 'Overload Mira’s portable radio transceiver to emit a high-gain feedback siren, peeling the horde 2 sectors away.',
        survivalImpact: 18,
        resourceImpact: {
          timeMinutes: 10,
          stamina: -10,
        },
        routeAction: 'none',
      },
      {
        label: 'HEAVY SUPPRESSION & COVER RUN',
        description: 'Aarav leads a forceful dash through the peripheral building ruins utilizing concrete columns for ballistic cover.',
        survivalImpact: -10,
        resourceImpact: {
          stamina: -30,
          water: -0.6,
          timeMinutes: 5,
        },
        routeAction: 'none',
      },
      {
        label: 'FULL WESTERN DETOUR VIA ARATION DEPOT',
        description: 'Abandon current heading. Pivot 4 sectors west toward the Wholesale Ration Depot (F3) to refuel and flank.',
        survivalImpact: 12,
        resourceImpact: {
          food: 1200,
          water: 2.0,
          timeMinutes: 45,
        },
        routeAction: 'scavenge_detour',
      },
    ],
  },
  {
    id: 'dilemma-3',
    title: 'CRITICAL HYDRATION DEPLETION',
    location: 'Sector E8 // High Sun Grid',
    triggerCondition: 'Water Rations Dropped Below 1.2 Liters',
    narrative:
      'Both survivors have dry throats and pounding temples. Aarav’s reflexes are slowing, increasing risk of fatal ambush. A rooftop water condensation tower is spotted 100 meters above on an abandoned commercial bank.',
    choices: [
      {
        label: 'CLIMB WATER TOWER SCALING',
        description: 'Ascend emergency fire escape to harvest 3.0 Liters of purified rainwater from the filtration tank.',
        survivalImpact: 16,
        resourceImpact: {
          water: 3.0,
          stamina: -20,
          timeMinutes: 20,
        },
        routeAction: 'none',
      },
      {
        label: 'ENDURANCE MARCH WITHOUT STOPPING',
        description: 'Conserve daylight and press forward to the Beacon without pausing, burning through sheer willpower.',
        survivalImpact: -15,
        resourceImpact: {
          stamina: -35,
          timeMinutes: -15,
        },
        routeAction: 'none',
      },
      {
        label: 'SHARE EMERGENCY SALINE POUCH',
        description: 'Mira mixes medical saline and electrolyte tablets to temporarily stabilize Aarav’s circulatory system.',
        survivalImpact: 6,
        resourceImpact: {
          medkits: -1,
          water: 0.8,
          stamina: 10,
        },
        routeAction: 'none',
      },
    ],
  },
  {
    id: 'dilemma-4',
    title: 'BLOCKED ARTERY: COLLAPSED OVERPASS',
    location: 'Sector E10 // Overpass Rubble',
    triggerCondition: 'Major Structural Collapse',
    narrative:
      'Massive concrete slabs from the highway viaduct have crushed the intersection. Twisted rebar and fire make vehicle or fast foot transit impossible. A narrow subway grate is the only gap visible.',
    choices: [
      {
        label: 'PRY OPEN SUBWAY GRATE (STEALTH VECTOR)',
        description: 'Use Aarav’s crowbar to force the subterranean hatch, entering the low-threat tunnel network.',
        survivalImpact: 15,
        resourceImpact: {
          stamina: -15,
          timeMinutes: 15,
        },
        routeAction: 'reroute_tunnel',
      },
      {
        label: 'SCALE RUBBLE UNDER COVER OF SMOKE',
        description: 'Scramble directly over the jagged concrete piles. High noise risk, but maintains straight-line vector.',
        survivalImpact: -8,
        resourceImpact: {
          stamina: -25,
          timeMinutes: 5,
        },
        routeAction: 'none',
      },
      {
        label: 'FLARE DECOY PERIMETER CLEARING',
        description: 'Throw a flare to lure wandering lurkers away from the alleyway flanking the collapsed ramp.',
        survivalImpact: 10,
        resourceImpact: {
          flares: -1,
          timeMinutes: 10,
        },
        routeAction: 'none',
      },
    ],
  },
  {
    id: 'dilemma-5',
    title: 'THE LAST BEACON GATES CLOSING',
    location: 'Sector K11 // Beacon Perimeter Verge',
    triggerCondition: 'Within 2 Sectors of Goal L12 & Countdown < 45m',
    narrative:
      'The searchlights of The Last Beacon Evacuation Compound are visible across the razor wire. Loudspeakers blare: "GATE LOCKDOWN IN 30 MINUTES. AUTOMATED TURRETS ENGAGING." An armed horde is closing from the rear.',
    choices: [
      {
        label: 'MAXIMUM ADRENALINE BREACH',
        description: 'Sprint all out for the outer gates. Dump heavy packs, burn remaining stamina, and radio Beacon command.',
        survivalImpact: 22,
        resourceImpact: {
          stamina: -50,
          food: -200,
          timeMinutes: -15,
        },
        routeAction: 'none',
      },
      {
        label: 'DEPLOY DUAL FLARE FIREWALL',
        description: 'Ignite all remaining flares to create an acoustic wall of sound and light, choking the horde’s path.',
        survivalImpact: 28,
        resourceImpact: {
          flares: -2,
          timeMinutes: 5,
        },
        routeAction: 'none',
      },
      {
        label: 'RADIO ENCRYPTED SOS FREQUENCY',
        description: 'Mira transmits the military authorization code from Sector B9 armory to open the rear maintenance hatch.',
        survivalImpact: 35,
        resourceImpact: {
          timeMinutes: 10,
        },
        routeAction: 'none',
      },
    ],
  },
];

export const DecisionModal: React.FC<DecisionModalProps> = ({
  dilemma,
  isOpen,
  onClose,
  onSelectChoice,
}) => {
  if (!isOpen || !dilemma) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-amber-500/80 rounded-xl max-w-2xl w-full p-5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Warning Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-950/80 border border-amber-600/60 text-amber-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                TACTICAL SURVIVAL DILEMMA
              </span>
              <h2 className="text-base font-mono font-bold text-zinc-100 mt-0.5">
                {dilemma.title}
              </h2>
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>{dilemma.location}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400">{dilemma.triggerCondition}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg mb-4 text-xs font-mono text-zinc-300 leading-relaxed">
          {dilemma.narrative}
        </div>

        {/* Choices */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
            CHOOSE TACTICAL RESPONSE VECTOR:
          </div>

          {dilemma.choices.map((c, idx) => (
            <div
              key={idx}
              onClick={() => {
                soundEngine.playSonarPing();
                onSelectChoice(idx);
              }}
              className="group cursor-pointer bg-zinc-900/90 border border-zinc-800 hover:border-amber-500 rounded-lg p-3 transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <div className="text-xs font-mono font-bold text-zinc-100 group-hover:text-amber-300 flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-0.5" />
                    <span>{c.label}</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-1 pl-5">
                    {c.description}
                  </p>
                </div>

                {/* Survival Impact Badge */}
                <div
                  className={`flex-shrink-0 flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                    c.survivalImpact >= 0
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50'
                      : 'bg-red-950/60 text-red-400 border-red-600/50'
                  }`}
                >
                  {c.survivalImpact >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {c.survivalImpact >= 0 ? `+${c.survivalImpact}%` : `${c.survivalImpact}%`} ODDS
                  </span>
                </div>
              </div>

              {/* Resource Impacts Strip */}
              <div className="flex items-center gap-2 pl-5 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/80">
                <span className="text-zinc-400 font-semibold">DELTA:</span>
                {c.resourceImpact.food && (
                  <span className={c.resourceImpact.food > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    Food {c.resourceImpact.food > 0 ? `+${c.resourceImpact.food}` : c.resourceImpact.food}kcal
                  </span>
                )}
                {c.resourceImpact.water && (
                  <span className={c.resourceImpact.water > 0 ? 'text-emerald-400' : 'text-cyan-400'}>
                    Water {c.resourceImpact.water > 0 ? `+${c.resourceImpact.water}` : c.resourceImpact.water}L
                  </span>
                )}
                {c.resourceImpact.medkits && (
                  <span className="text-red-400">
                    Medkits {c.resourceImpact.medkits > 0 ? `+${c.resourceImpact.medkits}` : c.resourceImpact.medkits}
                  </span>
                )}
                {c.resourceImpact.flares && (
                  <span className="text-purple-400">
                    Flares {c.resourceImpact.flares > 0 ? `+${c.resourceImpact.flares}` : c.resourceImpact.flares}
                  </span>
                )}
                {c.resourceImpact.stamina && (
                  <span className="text-yellow-400">
                    Stamina {c.resourceImpact.stamina > 0 ? `+${c.resourceImpact.stamina}` : c.resourceImpact.stamina}%
                  </span>
                )}
                {c.resourceImpact.timeMinutes && (
                  <span className="text-zinc-400">
                    Time {c.resourceImpact.timeMinutes > 0 ? `+${c.resourceImpact.timeMinutes}` : c.resourceImpact.timeMinutes}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
