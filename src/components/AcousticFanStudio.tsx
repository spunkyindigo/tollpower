import React, { useState } from 'react';
import { 
  Fan, 
  Thermometer, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Moon, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Info, 
  Check, 
  Cpu, 
  Flame, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { InverterState } from '../types/tollpower';
import { sfx } from '../utils/sfx';

interface AcousticFanStudioProps {
  state: InverterState;
  onRefresh: () => void;
}

export const AcousticFanStudio: React.FC<AcousticFanStudioProps> = ({
  state,
  onRefresh,
}) => {
  const thermal = state.thermal || {
    inverterTempC: 38.2,
    transformerTempC: 40.5,
    fanSpeedPct: 30,
    auxFanPwmPct: 45,
    fanMode: 'quiet',
    targetMaxTempC: 42,
    estimatedNoiseDba: 25.8,
    nightQuietEnabled: true,
    fanRpm: 1650,
    auxFanRpm: 920,
  };

  const [fanMode, setFanMode] = useState<'quiet' | 'balanced' | 'performance' | 'manual'>(
    thermal.fanMode || 'quiet'
  );
  const [auxPwm, setAuxPwm] = useState<number>(thermal.auxFanPwmPct ?? 45);
  const [targetTemp, setTargetTemp] = useState<number>(thermal.targetMaxTempC ?? 42);
  const [nightQuiet, setNightQuiet] = useState<boolean>(thermal.nightQuietEnabled ?? true);
  const [showWiringGuide, setShowWiringGuide] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (updates: Partial<{
    fanMode: 'quiet' | 'balanced' | 'performance' | 'manual';
    auxFanPwmPct: number;
    targetMaxTempC: number;
    nightQuietEnabled: boolean;
    coolingFanRelay: boolean;
  }>) => {
    sfx.playClick();
    setSaving(true);
    try {
      const res = await fetch('/api/inverter/thermal-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const dba = thermal.estimatedNoiseDba !== null && thermal.estimatedNoiseDba !== undefined ? thermal.estimatedNoiseDba : null;
  const isWhisperQuiet = dba !== null ? dba < 32 : true;
  const isModerateNoise = dba !== null && dba >= 32 && dba < 45;

  return (
    <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Fan className={`w-6 h-6 ${thermal.fanSpeedPct > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: `${Math.max(0.5, 4 - (thermal.fanSpeedPct / 30))}s` }} />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Thermal & Acoustic Noise Control
              </h3>
              <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                dba === null
                  ? 'bg-white/5 text-slate-500 border border-white/10'
                  : isWhisperQuiet
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isModerateNoise
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {dba === null ? 'SENSORS OFFLINE' : isWhisperQuiet ? 'WHISPER QUIET' : isModerateNoise ? 'MODERATE ACOUSTIC' : 'ACTIVE COOLING'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Intelligent cooling curve to suppress high-RPM inverter fan roar and keep unit quiet.
            </p>
          </div>
        </div>

        {/* Real-time Decibel Meter */}
        <div className="flex items-center space-x-3 bg-[#0d1017] p-3 rounded-2xl border border-white/10 self-start sm:self-auto">
          <div className="p-2 rounded-xl bg-white/5 text-slate-400">
            {isWhisperQuiet ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block font-medium">Sound Level</span>
            <span className="text-base sm:text-lg font-mono font-extrabold text-white">
              {dba !== null ? `~${dba}` : '--'}{' '}
              <span className="text-xs font-normal text-slate-400">dBA</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Gauge Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Core Heatsink Temp */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inverter Heatsink</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${thermal.inverterTempC !== null ? 'text-white' : 'text-slate-500'}`}>
            {thermal.inverterTempC !== null ? `${thermal.inverterTempC}°C` : '-- °C'}
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            {thermal.inverterTempC !== null
              ? (thermal.inverterTempC < 45 ? 'Below noisy fan trigger (48°C)' : 'Active internal threshold')
              : 'Sensor offline / disconnected'}
          </p>
        </div>

        {/* Transformer Temp */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Transformer Core</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${thermal.transformerTempC !== null ? 'text-white' : 'text-slate-500'}`}>
            {thermal.transformerTempC !== null ? `${thermal.transformerTempC}°C` : '-- °C'}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {thermal.transformerTempC !== null ? 'Pure Sine Inverter Stage' : 'Sensor offline / disconnected'}
          </p>
        </div>

        {/* Internal Fan */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inverter Internal Fan</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
              Firmware Safety
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-sky-400">
            {thermal.fanSpeedPct}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ~{thermal.fanRpm ?? 1650} RPM
          </p>
        </div>

        {/* Pi Aux Silent Fan */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pi Aux Silent Fan</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Pi PWM / Relay
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {thermal.auxFanPwmPct}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ~{thermal.auxFanRpm ?? 920} RPM (Low Noise)
          </p>
        </div>
      </div>

      {/* Acoustic Profiles Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          Acoustic Profile Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'quiet',
              title: 'Quiet Acoustic (Recommended)',
              desc: 'Early silent airflow (38°C) prevents inverter high-RPM fans from triggering. Capped night charging heat.',
              badge: '~24-28 dBA',
              color: 'emerald',
            },
            {
              id: 'balanced',
              title: 'Balanced Curve',
              desc: 'Dynamic fan ramp matching ambient temp and AC load power curve.',
              badge: '~32-38 dBA',
              color: 'sky',
            },
            {
              id: 'performance',
              title: 'Performance Turbo',
              desc: 'Maximum airflow priority for hot summer days and sustained 4.5kW+ loads.',
              badge: '~48-55 dBA',
              color: 'amber',
            },
          ].map(profile => {
            const isSelected = fanMode === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setFanMode(profile.id as any);
                  handleUpdate({ fanMode: profile.id as any });
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-white/10 border-sky-400 shadow-sm'
                    : 'bg-[#0d1017] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {profile.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {profile.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {profile.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Fan PWM Slider & Night Quiet Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
        {/* Aux Fan PWM Manual Speed Control */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Pi Silent Aux Fan Speed: {auxPwm}%</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">GPIO 18 / Relay</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={auxPwm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setAuxPwm(val);
              setFanMode('manual');
            }}
            onMouseUp={() => handleUpdate({ auxFanPwmPct: auxPwm, fanMode: 'manual' })}
            onTouchEnd={() => handleUpdate({ auxFanPwmPct: auxPwm, fanMode: 'manual' })}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-white/10 rounded-lg"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0% (Silent Off)</span>
            <span>50% (Whisper Noctua)</span>
            <span>100% (Full Turbo)</span>
          </div>
        </div>

        {/* Night Acoustic Throttling Switch */}
        <div className="bg-[#0d1017] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center space-x-2 text-white">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold">Overnight Silent Charging</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Throttles charging amps between 23:00 - 07:00 to keep the transformer cool and eliminate fan screaming while sleeping.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !nightQuiet;
              setNightQuiet(next);
              handleUpdate({ nightQuietEnabled: next });
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              nightQuiet
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {nightQuiet ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Accordion: How Tollpower Solves Inverter Fan Noise */}
      <div className="border border-white/10 rounded-2xl bg-[#0d1017] overflow-hidden">
        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            setShowWiringGuide(!showWiringGuide);
          }}
          className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.02]"
        >
          <span className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>How does Tollpower control fan noise? (Technical Answer & Setup)</span>
          </span>
          <span className="text-sky-400">{showWiringGuide ? 'Hide Details' : 'View Guide'}</span>
        </button>

        {showWiringGuide && (
          <div className="p-4 pt-1 text-xs text-slate-300 space-y-3 border-t border-white/5 leading-relaxed">
            <p>
              <strong className="text-white">1. Can we directly override the internal fan speed?</strong>
              <br />
              Voltacon (Voltronic/Axpert) hybrid inverters report temperature and fan RPM over USB, but the inverter manufacturer's firmware locks internal fan safety curves inside the DSP. It does not allow serial commands to turn off internal fans while 5,000W is flowing (to prevent MOSFET burnout).
            </p>
            <p>
              <strong className="text-white">2. So how do we make the unit whisper quiet?</strong>
              <br />
              The internal screamer fans only trigger when the internal heatsink reaches ~48°C - 52°C. 
              By installing an inexpensive, whisper-quiet external 120mm/140mm low-RPM fan (e.g., Noctua NF-A12x25 or be quiet! Silent Wings, running at &lt; 20 dBA) over the bottom intake, Tollpower can trigger gentle airflow at 38°C. This keeps the core below 45°C indefinitely, meaning the loud internal factory fan <strong className="text-emerald-400">never spools up!</strong>
            </p>
            <div className="bg-[#151822] p-3 rounded-xl border border-white/10 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="text-amber-300 font-bold">Wiring Options on your Raspberry Pi:</div>
              <div>• Option A: 12V Fan switched by Pi 2-Channel Relay HAT (Tollpower toggles the Cooling Fan relay).</div>
              <div>• Option B: 4-Pin PWM Fan connected to Pi GPIO 18 (Hardware PWM Pin 12) for smooth speed ramping (0-100%).</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
