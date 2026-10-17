import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  RefreshCw, 
  Radio, 
  Terminal, 
  QrCode, 
  Volume2, 
  CheckCircle, 
  AlertCircle,
  Binary,
  Layers,
  Send
} from 'lucide-react';
import { SyncPacketPayload, TelemetryLogEntry, Sector } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface OfflineSyncPanelProps {
  isAirGapMode: boolean;
  onToggleAirGap: () => void;
  devicePerspective: 'all' | 'aarav' | 'mira';
  onSetDevicePerspective: (p: 'all' | 'aarav' | 'mira') => void;
  pendingDeltaPackets: number;
  onSimulateAaravScout: () => void;
  onBroadcastSync: () => void;
  isSyncing: boolean;
  syncPacket: SyncPacketPayload | null;
  telemetryLogs: TelemetryLogEntry[];
}

export const OfflineSyncPanel: React.FC<OfflineSyncPanelProps> = ({
  isAirGapMode,
  onToggleAirGap,
  devicePerspective,
  onSetDevicePerspective,
  pendingDeltaPackets,
  onSimulateAaravScout,
  onBroadcastSync,
  isSyncing,
  syncPacket,
  telemetryLogs,
}) => {
  const [onlineStatus, setOnlineStatus] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate 8x8 matrix cells based on checksum / payload for visual optical code
  const getMatrixPattern = (seedStr: string) => {
    const cells: boolean[] = [];
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < 64; i++) {
      // Corners are always finder patterns (like QR codes)
      const r = Math.floor(i / 8);
      const c = i % 8;
      if (
        (r < 2 && c < 2) ||
        (r < 2 && c > 5) ||
        (r > 5 && c < 2)
      ) {
        cells.push(true);
      } else {
        cells.push(((hash >> (i % 31)) & 1) === 1);
      }
    }
    return cells;
  };

  const payloadString = syncPacket ? JSON.stringify(syncPacket) : 'DEAD-AIR-IDLE-CARRIER';
  const base64Payload = syncPacket ? btoa(payloadString).slice(0, 32) + '...' : '0xDEADBEEF...';
  const matrixCells = getMatrixPattern(payloadString);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
            DEAD-AIR // P2P Sync Engine
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">AIR-GAP P2P</span>
      </div>

      {/* Air Gap Status & Hard Blackout Switch */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAirGapMode || !onlineStatus ? (
              <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <div className="text-xs font-mono font-bold text-zinc-200">
                {isAirGapMode ? 'TOTAL GRID BLACKOUT' : onlineStatus ? 'LOCAL NETWORK DETECTED' : 'OFFLINE AIR-GAP'}
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                100% LocalStorage &amp; Acoustic P2P Active
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSonarPing();
              onToggleAirGap();
            }}
            className={`px-2 py-1 text-[10px] font-mono rounded border font-bold transition-all ${
              isAirGapMode
                ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {isAirGapMode ? 'DISENGAGE' : 'SIMULATE BLACKOUT'}
          </button>
        </div>
      </div>

      {/* Device Perspective Switcher */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
        <div className="text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-cyan-400" /> DEVICE PERSPECTIVE
          </span>
          <span className="text-[10px] text-zinc-500">DUAL-PHONE RECON</span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onSetDevicePerspective('aarav')}
            className={`py-1 px-1 text-[10px] font-mono rounded border flex flex-col items-center transition-all ${
              devicePerspective === 'aarav'
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📱 AARAV</span>
            <span className="text-[8px] opacity-75">Scout Unit 01</span>
          </button>

          <button
            onClick={() => onSetDevicePerspective('mira')}
            className={`py-1 px-1 text-[10px] font-mono rounded border flex flex-col items-center transition-all ${
              devicePerspective === 'mira'
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📱 MIRA</span>
            <span className="text-[8px] opacity-75">Medic Unit 02</span>
          </button>

          <button
            onClick={() => onSetDevicePerspective('all')}
            className={`py-1 px-1 text-[10px] font-mono rounded border flex flex-col items-center transition-all ${
              devicePerspective === 'all'
                ? 'bg-purple-950/70 border-purple-500 text-purple-300 font-bold'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🔀 SPLIT-VIEW</span>
            <span className="text-[8px] opacity-75">Full Telemetry</span>
          </button>
        </div>
      </div>

      {/* Unsynced Recon & Acoustic Sync Controls */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Recon Parity Status
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              pendingDeltaPackets > 0
                ? 'bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
            }`}
          >
            {pendingDeltaPackets > 0 ? `${pendingDeltaPackets} DELTA PACKETS` : '100% PARITY'}
          </span>
        </div>

        {/* Scout Ahead Button (Simulates Aarav exploring alone) */}
        <button
          onClick={() => {
            soundEngine.playSonarPing();
            onSimulateAaravScout();
          }}
          className="w-full py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
          title="Simulate Aarav scouting ahead: generates 2 new hazard/supply intel packets on Unit 01"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>[🔭 Simulate Aarav Scouting Ahead (+2 Deltas)]</span>
        </button>

        {/* Broadcast Acoustic + Optical Sync Packet */}
        <button
          onClick={() => {
            onBroadcastSync();
          }}
          disabled={isSyncing}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-mono text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all border border-cyan-400"
          title="Emit Web Audio FSK modem burst + Optical Matrix code to sync Mira's device"
        >
          <Volume2 className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? 'BROADCASTING ACOUSTIC FSK MODEM...' : '[📡 BROADCAST ACOUSTIC + OPTICAL SYNC]'}
          </span>
        </button>

        {/* Animated Ultrasonic Frequency Waveform & 8x8 Optical Matrix */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800 flex items-center gap-3">
          {/* 8x8 Optical Sync Matrix */}
          <div className="flex-shrink-0 bg-white p-1 rounded">
            <div className="grid grid-cols-8 grid-rows-8 gap-[1px] w-14 h-14 bg-zinc-200">
              {matrixCells.map((isActive, idx) => (
                <div
                  key={idx}
                  className={`${isActive ? 'bg-black' : 'bg-white'} ${
                    isSyncing ? 'transition-colors duration-100' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Ultrasonic Waveform Visualizer & Telemetry */}
          <div className="flex-1 space-y-1 font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400">FSK MODEM / 1800Hz</span>
              <span className="text-cyan-400 font-bold">{isSyncing ? 'TX: ACTIVE' : 'CARRIER: STANDBY'}</span>
            </div>

            {/* Canvas/CSS Waveform bars */}
            <div className="flex items-end gap-[2px] h-6 bg-zinc-900/80 rounded px-1 py-0.5 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => {
                const height = isSyncing
                  ? Math.sin((i + Date.now() / 80) * 0.8) * 40 + 50
                  : Math.max(10, (i % 5) * 4);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-75 ${
                      isSyncing ? 'bg-cyan-400' : 'bg-zinc-700'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            <div className="text-[9px] text-zinc-500 truncate" title={payloadString}>
              CRC: <span className="text-zinc-300">{syncPacket?.checksum || '0x4F7A9B1C'}</span> | {base64Payload}
            </div>
          </div>
        </div>
      </div>

      {/* Live Tactical Comms & Telemetry Log */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 flex-1 flex flex-col min-h-[160px]">
        <div className="flex items-center justify-between mb-1.5 border-b border-zinc-800/80 pb-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300 uppercase">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tactical Comms Log</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">LIVE FEED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] pr-1">
          {telemetryLogs.map((log) => {
            const getColor = () => {
              switch (log.type) {
                case 'danger': return 'text-red-400';
                case 'warn': return 'text-amber-400';
                case 'success': return 'text-emerald-400';
                default: return 'text-zinc-400';
              }
            };
            return (
              <div key={log.id} className="leading-tight flex items-start gap-1">
                <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                <span className="text-zinc-500 font-bold flex-shrink-0">{log.source}:</span>
                <span className={getColor()}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
