import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Clock, 
  BarChart3, 
  HelpCircle, 
  QrCode, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Heart,
  Settings,
  LayoutGrid
} from 'lucide-react';
import { InverterState, SystemInfo } from '../types/tollpower';
import { AppSettings } from '../types/settings';
import { sfx } from '../utils/sfx';

interface TollpowerNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inverterState: InverterState | null;
  systemInfo: SystemInfo | null;
  settings: AppSettings;
  onOpenQr: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TollpowerNavbar: React.FC<TollpowerNavbarProps> = ({
  activeTab,
  setActiveTab,
  inverterState,
  systemInfo,
  settings,
  onOpenQr,
  onRefresh,
  isRefreshing,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(settings?.features?.soundEffects ?? true);

  const toggleSound = () => {
    const next = !soundEnabled;
    sfx.enabled = next;
    setSoundEnabled(next);
    if (next) sfx.playCoin();
  };

  const isPowerOn = inverterState?.powerState === 'ON';
  const currentWatts = inverterState?.acOutput?.watts ?? 0;
  const batterySoc = inverterState?.dcInput?.stateOfCharge ?? 88;

  // Build navItems dynamically based on enabled features, with "At a Glance" strictly left-most!
  const navItems = [
    { id: 'glance', label: 'At a Glance', icon: LayoutGrid },
    { id: 'dashboard', label: 'Monitor & Control', icon: Activity },
    ...(settings?.features?.timersAndModes ? [{ id: 'timers', label: 'Timers & Modes', icon: Clock }] : []),
    ...(settings?.features?.longTermAnalytics ? [{ id: 'analytics', label: 'Long-Term Analytics', icon: BarChart3 }] : []),
    ...(settings?.features?.setupGuide ? [{ id: 'guide', label: 'Setup Guide', icon: HelpCircle }] : []),
    { id: 'settings', label: 'App Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#141721]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      {/* Subtle 2px Joy-Con Accent Bar (Nintendo touch) */}
      <div className="h-[2.5px] w-full flex">
        <div className="w-1/2 bg-[#38bdf8]" /> {/* Soft Neon Blue */}
        <div className="w-1/2 bg-[#f87171]" /> {/* Soft Neon Red */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div 
            onClick={() => {
              sfx.playClick();
              setActiveTab('glance');
            }}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isPowerOn 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'bg-white/5 border border-white/10 text-slate-400'
            }`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight font-sans group-hover:text-amber-300 transition-colors">
                  Tollpower
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isPowerOn 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400 border border-white/10'
                }`}>
                  {inverterState?.powerState || 'ONLINE'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                <span className="font-mono text-emerald-400 font-semibold">
                  {isPowerOn ? `${currentWatts} W Output` : 'Standby'}
                </span>
                <span>•</span>
                <span className="flex items-center text-rose-400 font-mono">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  {batterySoc}% SOC
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline font-mono text-slate-400">
                  Voltacon 230V / 50Hz
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons (Pixel Style Tiles) */}
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-2xl border transition-colors ${
                soundEnabled 
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? '8-bit Audio: ON' : 'Audio: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Refresh */}
            <button
              onClick={() => {
                sfx.playClick();
                onRefresh();
              }}
              className="p-2 rounded-2xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* App Settings Shortcut */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('settings');
              }}
              className={`p-2 rounded-2xl border transition-colors ${
                activeTab === 'settings'
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="App Settings (GitHub, Updates, Hardware Profile)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Phone & Tablet Connect (Pixel Pill button) */}
            <button
              onClick={() => {
                sfx.playCoin();
                onOpenQr();
              }}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Phone / Tablet Wi-Fi</span>
              <span className="sm:hidden">Wi-Fi</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - With At a Glance on the far left */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sfx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center space-x-2 whitespace-nowrap border ${
                  isActive
                    ? 'bg-white/15 text-white border-white/20 shadow-xs'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
