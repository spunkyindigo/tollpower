import React, { useState } from 'react';
import { 
  Zap, 
  Power, 
  Sun, 
  BatteryCharging, 
  Plug, 
  Heart, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight,
  AlertTriangle,
  Clock,
  Shield,
  Coins,
  Fan,
  Thermometer,
  Sliders,
  CheckCircle2,
  ArrowRightLeft,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import { InverterState } from '../types/tollpower';
import { AppSettings } from '../types/settings';
import { sfx } from '../utils/sfx';
import { AcousticFanStudio } from './AcousticFanStudio';

interface InverterDashboardProps {
  state: InverterState;
  settings?: AppSettings;
  onControl: (action: string, value?: string, relay?: string) => Promise<void>;
  onRefresh?: () => void;
}

export const InverterDashboard: React.FC<InverterDashboardProps> = ({
  state,
  settings,
  onControl,
  onRefresh,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, value?: string, relay?: string) => {
    if (action === 'powerState') {
      if (value === 'ON') sfx.playPowerUp();
      else if (value === 'OFF') sfx.playPowerDown();
      else sfx.playClick();
    } else if (action === 'outputPriority' || action === 'chargerPriority') {
      sfx.playCoin();
    } else {
      sfx.playClick();
    }

    setLoadingAction(`${action}-${value || relay || ''}`);
    try {
      await onControl(action, value, relay);
    } finally {
      setTimeout(() => setLoadingAction(null), 300);
    }
  };

  const isPowerOn = state.powerState === 'ON';
  const isStandby = state.powerState === 'STANDBY';
  const isOff = state.powerState === 'OFF';

  const loadPercent = Math.min(100, Math.round((state.acOutput.watts / state.acOutput.peakWatts) * 100));

  return (
    <div className="space-y-6">
      {/* Master Control Deck (Pixel Material 3 Surface + Soft Accents) */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isPowerOn 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                : isStandby
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-white/5 border border-white/10 text-slate-400'
            }`}>
              <Power className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  {state.model}
                </h2>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  isPowerOn 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : isStandby
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {state.powerState}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono flex items-center space-x-2">
                <span>Port: {state.usbPort.split(' ')[0]}</span>
                <span>•</span>
                <span className="text-emerald-400">230V / 50.0 Hz Pure Sine</span>
              </p>
            </div>
          </div>

          {/* Quick Settings Style Power Switch Buttons (Pixel Pill Group) */}
          <div className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => handleAction('powerState', 'ON')}
              disabled={loadingAction === 'powerState-ON'}
              className={`py-2 px-3.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                isPowerOn
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>ON</span>
            </button>

            <button
              onClick={() => handleAction('powerState', 'STANDBY')}
              disabled={loadingAction === 'powerState-STANDBY'}
              className={`py-2 px-3.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                isStandby
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>STANDBY</span>
            </button>

            <button
              onClick={() => handleAction('powerState', 'OFF')}
              disabled={loadingAction === 'powerState-OFF'}
              className={`py-2 px-3.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                isOff
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>OFF</span>
            </button>
          </div>
        </div>

        {/* Priority Selectors (45% Analytical + 35% Pixel UI + 20% Nintendo Mode Badge) */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Output Source Priority */}
          <div className="bg-[#10121a] p-4 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Output Source Priority</span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30">
                ACTIVE: {state.outputPriority}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SBU', title: 'SBU Priority', desc: 'Solar > Battery > Grid' },
                { id: 'SOL', title: 'SOL Priority', desc: 'Solar First' },
                { id: 'UTI', title: 'UTI Priority', desc: 'Grid First' },
              ].map(item => {
                const isSelected = state.outputPriority === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAction('outputPriority', item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400/50 text-white shadow-xs'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Charger Source Priority */}
          <div className="bg-[#10121a] p-4 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                <span>Charger Source Priority</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                ACTIVE: {state.chargerPriority}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CSO', title: 'CSO Mode', desc: 'Solar First Charge' },
                { id: 'SNU', title: 'SNU Mode', desc: 'Solar & Grid (Fast)' },
                { id: 'OSO', title: 'OSO Mode', desc: 'Only Solar' },
              ].map(item => {
                const isSelected = state.chargerPriority === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAction('chargerPriority', item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400/50 text-white shadow-xs'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Cards (Crystal Clear Data + Soft Curves) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. AC Output Power (230V 50Hz) */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-sm text-white">AC Output Power</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              230V / 50.0 Hz
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              {state.acOutput.watts}
            </span>
            <span className="text-base font-semibold text-slate-400">Watts</span>
            <span className="text-xs text-slate-400 font-mono ml-auto">({state.acOutput.apparentPowerVA} VA)</span>
          </div>

          {/* Load Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Inverter Load: {loadPercent}%</span>
              <span>Capacity: {state.acOutput.peakWatts}W</span>
            </div>
            <div className="w-full bg-[#10121a] rounded-full h-2.5 overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loadPercent > 80 ? 'bg-rose-500' : loadPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-center">
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Voltage</span>
              <span className="text-sm font-bold text-white">{state.acOutput.voltage} V</span>
            </div>
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Current</span>
              <span className="text-sm font-bold text-white">{state.acOutput.current} A</span>
            </div>
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Freq</span>
              <span className="text-sm font-bold text-white">{state.acOutput.frequency} Hz</span>
            </div>
          </div>
        </div>

        {/* 2. 48V LiFePO4 Battery Bank */}
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 ${
          state.dcInput.stateOfCharge !== null ? 'bg-[#151822] border-white/10' : 'bg-[#12141c] border-white/10 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${state.dcInput.stateOfCharge !== null ? 'text-rose-400' : 'text-slate-400'}`}>
              <Heart className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-sm text-white">48V Battery Bank</h3>
            </div>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
              state.dcInput.stateOfCharge !== null
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-slate-500 bg-white/5 border-white/10'
            }`}>
              {state.dcInput.stateOfCharge !== null ? '16S LiFePO4' : 'OFFLINE / UNMEASURED'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                {state.dcInput.stateOfCharge !== null ? `${state.dcInput.stateOfCharge}%` : '--'}
              </span>
              <span className={`text-xs font-mono ${state.dcInput.stateOfCharge !== null ? 'text-slate-400' : 'text-slate-500'}`}>
                {state.dcInput.stateOfCharge !== null ? 'SOC' : 'SOC (Dead)'}
              </span>
            </div>
            <span className="text-sm font-mono px-3 py-1 rounded-full bg-[#10121a] border border-white/10 text-emerald-400 font-bold">
              {state.dcInput.voltage > 0 ? `${state.dcInput.voltage} VDC` : '-- VDC'}
            </span>
          </div>

          {/* Battery level indicator */}
          <div className="w-full bg-[#10121a] rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                state.dcInput.stateOfCharge !== null ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
              style={{ width: `${state.dcInput.stateOfCharge !== null ? state.dcInput.stateOfCharge : 0}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-center">
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">DC Draw</span>
              <span className="text-sm font-bold text-white">
                {state.dcInput.stateOfCharge !== null ? `${state.dcInput.current} A` : '-- A'}
              </span>
            </div>
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Power</span>
              <span className="text-sm font-bold text-white">
                {state.dcInput.stateOfCharge !== null ? `${state.dcInput.watts} W` : '-- W'}
              </span>
            </div>
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Temp</span>
              <span className="text-sm font-bold text-white">
                {state.dcInput.temperatureC !== null && state.dcInput.temperatureC !== undefined ? `${state.dcInput.temperatureC} °C` : '-- °C'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Solar PV Generation */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <Sun className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Solar PV Generation</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
              MPPT Active
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              {state.solar.watts}
            </span>
            <span className="text-base font-semibold text-slate-400">Watts</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
            <span>Today's Harvest:</span>
            <span className="text-emerald-400 font-bold text-sm">{state.solar.dailyYieldKWh} kWh</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-center">
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">PV Voltage</span>
              <span className="text-sm font-bold text-white">{state.solar.voltage} V</span>
            </div>
            <div className="bg-[#10121a] p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">PV Current</span>
              <span className="text-sm font-bold text-white">{state.solar.current} A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relays & Socket Controls */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm">
              {settings?.features.externalRelays ? 'Remote Sockets & Relays Control' : 'Inverter AC Output Control'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {settings?.features.externalRelays 
              ? 'Pi Direct GPIO & Inverter Bridge' 
              : 'Voltacon Pure Sine Direct Link'}
          </span>
        </div>

        <div className={`grid grid-cols-1 ${settings?.features.externalRelays ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'} gap-3`}>
          {[
            {
              key: 'mainAc',
              label: 'Main 230V AC Outlets',
              desc: 'Protected inverter feed (Built-in)',
              active: state.relays.mainAc,
              icon: Zap,
              isNative: true,
            },
            {
              key: 'auxLoad',
              label: 'Aux Dump Relay',
              desc: 'Water heater / dump load',
              active: state.relays.auxLoad,
              icon: Plug,
              isNative: false,
            },
            {
              key: 'usbPorts',
              label: 'USB & 12V Hub',
              desc: 'Pi and router rail',
              active: state.relays.usbPorts,
              icon: Radio,
              isNative: false,
            },
            {
              key: 'coolingFan',
              label: 'Exhaust Fan',
              desc: `${state.thermal.fanSpeedPct}% PWM Speed`,
              active: state.relays.coolingFan,
              icon: Fan,
              isNative: false,
            },
          ]
            .filter(relay => relay.isNative || settings?.features.externalRelays)
            .map(relay => (
            <div
              key={relay.key}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                relay.active
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-[#10121a] border-white/5 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <relay.icon className={`w-4 h-4 ${relay.active ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-white">{relay.label}</span>
                </div>
                <p className="text-[11px] text-slate-400">{relay.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAction('toggleRelay', undefined, relay.key)}
                className={`p-1.5 rounded-lg transition-transform active:scale-95 ${
                  relay.active ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                }`}
              >
                {relay.active ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          ))}

          {!settings?.features.externalRelays && (
            <div className="p-4 rounded-2xl border border-white/5 bg-[#10121a] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="space-y-1">
                <span className="text-slate-300 font-semibold block">Aux GPIO Relays Hidden</span>
                <p className="text-[11px] text-slate-400">
                  Minimal Pi + Voltacon profile active. External contactors can be toggled on in App Settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thermals & Grid Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Thermometer className="w-4 h-4 text-rose-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Inverter Thermals</h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Core Temp</span>
              <span className={`text-base font-bold ${state.thermal.inverterTempC !== null ? 'text-white' : 'text-slate-500'}`}>
                {state.thermal.inverterTempC !== null ? `${state.thermal.inverterTempC} °C` : '-- °C'}
              </span>
            </div>
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Transformer</span>
              <span className={`text-base font-bold ${state.thermal.transformerTempC !== null ? 'text-white' : 'text-slate-500'}`}>
                {state.thermal.transformerTempC !== null ? `${state.thermal.transformerTempC} °C` : '-- °C'}
              </span>
            </div>
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Fan Speed</span>
              <span className="text-base font-bold text-sky-400">
                {state.thermal.inverterTempC !== null ? `${state.thermal.fanSpeedPct}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Plug className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">UK Grid / Shore 230V Bypass</h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Status</span>
              <span className="text-xs font-bold text-emerald-400">{state.grid.status}</span>
            </div>
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Grid Volts</span>
              <span className="text-base font-bold text-white">{state.grid.voltage} V</span>
            </div>
            <div className="bg-[#10121a] p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Grid Freq</span>
              <span className="text-base font-bold text-white">{state.grid.frequency} Hz</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Acoustic & Thermal Noise Control Studio - Only rendered if fanNoiseAcoustics is enabled in settings */}
      {settings?.features.fanNoiseAcoustics && (
        <AcousticFanStudio state={state} onRefresh={onRefresh || (() => {})} />
      )}

      {/* Events Log */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Activity className="w-4 h-4 text-sky-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono">Inverter Activity & Events</h4>
          </div>
          <button
            onClick={() => handleAction('testAlarm')}
            className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            Trigger Diagnostic
          </button>
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto">
          {state.alarms.map(alarm => (
            <div
              key={alarm.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#10121a] border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  alarm.level === 'critical' ? 'bg-rose-500' : alarm.level === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className="text-slate-200">{alarm.message}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(alarm.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
