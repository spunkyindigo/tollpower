import React from 'react';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Plug, 
  Power, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  Cpu,
  TrendingUp,
  Sparkles,
  Wifi,
  Sliders
} from 'lucide-react';
import { InverterState } from '../types/tollpower';
import { AppSettings } from '../types/settings';
import { sfx } from '../utils/sfx';

interface AtAGlanceDashboardProps {
  state: InverterState;
  settings: AppSettings;
  onControl: (action: string, value?: string, relay?: string) => Promise<void>;
  onNavigateTab: (tabId: string) => void;
  onRefresh?: () => void;
}

export const AtAGlanceDashboard: React.FC<AtAGlanceDashboardProps> = ({
  state,
  settings,
  onControl,
  onNavigateTab,
  onRefresh,
}) => {
  const isPowerOn = state.powerState === 'ON';
  const isStandby = state.powerState === 'STANDBY';
  const isOff = state.powerState === 'OFF';

  const loadPercent = Math.min(100, Math.round((state.acOutput.watts / state.acOutput.peakWatts) * 100));
  const isCharging = state.dcInput.watts > 0 && state.solar.watts > 0;

  const handlePower = async (mode: 'ON' | 'STANDBY' | 'OFF') => {
    if (mode === 'ON') sfx.playPowerUp();
    else if (mode === 'OFF') sfx.playPowerDown();
    else sfx.playClick();
    await onControl('powerState', mode);
  };

  return (
    <div className="flex flex-col justify-between space-y-3.5 sm:space-y-4 max-h-[calc(100vh-7.5rem)] select-none">
      {/* 1. Headline Header Strip */}
      <div className="bg-[#151822] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all ${
            isPowerOn 
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
              : isStandby
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'bg-white/5 border border-white/10 text-slate-400'
          }`}>
            <Zap className="w-5 h-5 fill-current" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight font-sans">
                {state.model.split('/')[0].trim()}
              </h2>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                isPowerOn 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : isStandby
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {state.powerState}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                state.isSimulationMode
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}>
                {state.isSimulationMode ? 'DEMO' : 'LIVE HW'}
              </span>
              <span className="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Mode: {state.outputPriority}
              </span>
            </div>
            
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
              <span className="text-sky-400">● Link: Pi USB ({state.usbPort.split(' ')[0]})</span>
              <span>•</span>
              <span className="text-emerald-400">230V / 50.0 Hz Pure Sine</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-amber-300">LiFePO4 48V</span>
            </p>
          </div>
        </div>

        {/* Compact Quick Actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => handlePower('ON')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isPowerOn ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ON
            </button>
            <button
              onClick={() => handlePower('STANDBY')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isStandby ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              STANDBY
            </button>
            <button
              onClick={() => handlePower('OFF')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isOff ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              OFF
            </button>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onNavigateTab('dashboard');
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center space-x-1 transition-all"
            title="Open Full Monitor & Controls"
          >
            <span className="hidden sm:inline">Detailed View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Mode Hardware Offline Alert */}
      {!state.isSimulationMode && state.hardwareStatus === 'disconnected' && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-rose-300">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span><strong>Physical Inverter Disconnected:</strong> Live Hardware Mode is active with 0 simulated data. Connect Voltacon OTG cable to Raspberry Pi or toggle Demo Mode.</span>
          </div>
          <button
            onClick={() => onNavigateTab('voltacon')}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-lg shrink-0"
          >
            Voltacon Link & Settings →
          </button>
        </div>
      )}

      {/* 2. The 4 Essential Headlines (No scrolling required) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
        {/* CARD 1: SOLAR GENERATION */}
        <div className="bg-[#151822] border border-amber-400/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300">
              <Sun className="w-4 h-4 fill-amber-400/30 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Solar Array</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
              {state.solar.connected ? 'HARVESTING' : 'IDLE'}
            </span>
          </div>

          <div className="my-2 sm:my-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline space-x-1">
              <span>{state.solar.watts.toLocaleString()}</span>
              <span className="text-sm sm:text-lg font-bold text-amber-400">W</span>
            </div>
            <p className="text-xs text-amber-300/80 font-mono mt-1 font-medium">
              +{state.solar.dailyYieldKWh.toFixed(2)} kWh Today
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>PV: {state.solar.voltage.toFixed(1)}V</span>
            <span>{state.solar.current.toFixed(1)}A MPPT</span>
          </div>
        </div>

        {/* CARD 2: AC LOAD POWER */}
        <div className="bg-[#151822] border border-sky-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sky-400">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">AC Output Load</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
              {loadPercent}% LOAD
            </span>
          </div>

          <div className="my-2 sm:my-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline space-x-1">
              <span>{state.acOutput.watts.toLocaleString()}</span>
              <span className="text-sm sm:text-lg font-bold text-sky-400">W</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  loadPercent > 80 ? 'bg-rose-500' : loadPercent > 50 ? 'bg-amber-400' : 'bg-sky-400'
                }`}
                style={{ width: `${Math.max(4, loadPercent)}%` }}
              />
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{state.acOutput.voltage.toFixed(1)}V</span>
            <span>{state.acOutput.current.toFixed(1)}A • {state.acOutput.frequency.toFixed(0)}Hz</span>
          </div>
        </div>

        {/* CARD 3: 48V BATTERY BANK */}
        <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group ${
          state.dcInput.stateOfCharge !== null
            ? 'bg-[#151822] border-emerald-500/20'
            : 'bg-[#12141c] border-white/10 opacity-80'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${
              state.dcInput.stateOfCharge !== null ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              <BatteryCharging className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">48V Battery</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              state.dcInput.stateOfCharge === null
                ? 'bg-white/5 text-slate-500 border border-white/10'
                : isCharging 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/10 text-slate-300'
            }`}>
              {state.dcInput.stateOfCharge === null ? 'NO SENSOR / DEAD' : isCharging ? 'CHARGING' : 'FLOAT'}
            </span>
          </div>

          <div className="my-2 sm:my-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline space-x-1">
              <span>{state.dcInput.stateOfCharge !== null ? state.dcInput.stateOfCharge : '--'}</span>
              <span className={`text-sm sm:text-lg font-bold ${state.dcInput.stateOfCharge !== null ? 'text-emerald-400' : 'text-slate-500'}`}>% SOC</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 font-medium">
              {state.dcInput.stateOfCharge !== null
                ? `${state.dcInput.voltage.toFixed(1)} V • ${state.dcInput.batteryType.split(' ')[0]}`
                : 'Link Down • Disconnected'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {state.dcInput.stateOfCharge !== null
                ? (state.dcInput.watts > 0 ? `+${state.dcInput.watts}W` : `${state.dcInput.watts}W`)
                : 'Power: --'}
            </span>
            <span>
              Temp: {state.dcInput.temperatureC !== null && state.dcInput.temperatureC !== undefined ? `${state.dcInput.temperatureC}°C` : '--'}
            </span>
          </div>
        </div>

        {/* CARD 4: UK GRID / SHORELINE BYPASS */}
        <div className="bg-[#151822] border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-300">
              <Plug className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">230V Grid Bypass</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {state.grid.status}
            </span>
          </div>

          <div className="my-2 sm:my-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline space-x-1">
              <span>{state.grid.voltage.toFixed(1)}</span>
              <span className="text-sm sm:text-lg font-bold text-purple-400">V</span>
            </div>
            <p className="text-xs text-purple-300/80 font-mono mt-1 font-medium">
              {state.grid.frequency.toFixed(1)} Hz • UK Standard
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Priority: {state.outputPriority}</span>
            <span className="text-emerald-400">Tariff Saver ON</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Headline Pulse & Hardware Baseline Strip */}
      <div className="bg-[#151822] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-300">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              state.hardwareStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`} />
            <span className="font-semibold text-white">System Status:</span>
            <span className={`font-bold ${
              state.hardwareStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {state.hardwareStatus === 'connected' 
                ? (state.isSimulationMode ? 'DEMO SIMULATOR ACTIVE' : 'ALL SYSTEMS NOMINAL') 
                : 'HARDWARE DISCONNECTED'}
            </span>
          </div>

          <div className="hidden sm:inline-block text-slate-600">•</div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Inverter Core Temp:</span>
            <span className={`font-bold ${state.thermal.inverterTempC !== null ? 'text-slate-200' : 'text-slate-500'}`}>
              {state.thermal.inverterTempC !== null ? `${state.thermal.inverterTempC}°C` : '-- (Dead / Offline)'}
            </span>
          </div>

          <div className="hidden sm:inline-block text-slate-600">•</div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Hardware Profile:</span>
            <span className="font-semibold text-sky-400">
              {settings.hardwareProfile === 'pi-voltacon-minimal' 
                ? 'Minimal Pi + Voltacon Direct' 
                : 'Full Expansion Rig'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <span>Last Telemetry: {new Date(state.lastUpdated).toLocaleTimeString()}</span>
          {onRefresh && (
            <button
              onClick={() => {
                sfx.playClick();
                onRefresh();
              }}
              className="text-sky-400 hover:text-sky-300 underline font-semibold ml-1 cursor-pointer"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
