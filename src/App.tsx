import React, { useState, useEffect } from 'react';
import { TollpowerNavbar } from './components/TollpowerNavbar';
import { InverterDashboard } from './components/InverterDashboard';
import { TimersAndModesStudio } from './components/TimersAndModesStudio';
import { LongTermAnalytics } from './components/LongTermAnalytics';
import { PiHostAndUpdater } from './components/PiHostAndUpdater';
import { PiHowToGuide } from './components/PiHowToGuide';
import { QrCodeModal } from './components/QrCodeModal';
import { GitPushModal } from './components/GitPushModal';
import { InverterState, InverterTimerRule, AnalyticsData, SystemInfo, GitStatus } from './types/tollpower';

// Default Fallback Voltacon 230V / 48V LiFePO4 State
const DEFAULT_INVERTER_STATE: InverterState = {
  model: 'Voltacon Conversol / Hybrid 5kW 48V',
  powerState: 'ON',
  outputPriority: 'SBU',
  chargerPriority: 'CSO',
  acOutput: {
    voltage: 230.2,
    frequency: 50.0,
    current: 5.6,
    watts: 1289,
    apparentPowerVA: 1350,
    peakWatts: 5000,
    waveform: 'Pure Sine Wave 230V/50Hz',
  },
  dcInput: {
    voltage: 51.4,
    current: 26.8,
    watts: 1378,
    stateOfCharge: 88,
    batteryType: '48V LiFePO4 (16S 200Ah)',
    temperatureC: 24.5,
    bulkVoltage: 56.8,
    floatVoltage: 54.0,
    lowCutoffVoltage: 44.0,
  },
  solar: {
    connected: true,
    voltage: 104.5,
    current: 11.2,
    watts: 1170,
    dailyYieldKWh: 8.42,
  },
  grid: {
    connected: true,
    voltage: 231.4,
    frequency: 50.0,
    status: 'Bypass Ready',
  },
  thermal: {
    inverterTempC: 37.8,
    transformerTempC: 40.2,
    fanSpeedPct: 35,
    auxFanPwmPct: 45,
    fanMode: 'quiet',
    targetMaxTempC: 42,
    estimatedNoiseDba: 26.5,
    nightQuietEnabled: true,
    fanRpm: 1850,
    auxFanRpm: 920,
  },
  relays: {
    mainAc: true,
    auxLoad: false,
    usbPorts: true,
    coolingFan: true,
  },
  alarms: [
    {
      id: 'alarm-1',
      level: 'info',
      message: 'Voltacon 48V pure sine wave output synchronized to 230V / 50.0 Hz',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'alarm-2',
      level: 'info',
      message: 'Direct USB link established with Raspberry Pi (/dev/hidraw0)',
      timestamp: new Date().toISOString(),
    },
  ],
  history: [],
  lastUpdated: new Date().toISOString(),
  connectionType: 'usb-direct',
  usbPort: '/dev/hidraw0 (Voltacon USB OTG)',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [inverterState, setInverterState] = useState<InverterState>(DEFAULT_INVERTER_STATE);
  const [timers, setTimers] = useState<InverterTimerRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGitModal, setShowGitModal] = useState(false);

  // Fetch telemetry from server
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/inverter');
      if (res.ok) {
        const data = await res.json();
        setInverterState(data);
      }
    } catch {}
  };

  const fetchTimers = async () => {
    try {
      const res = await fetch('/api/inverter/timers');
      if (res.ok) {
        const data = await res.json();
        setTimers(data.timers || []);
      }
    } catch {}
  };

  const fetchAnalytics = async (range: '24h' | '7d' | '30d') => {
    try {
      const res = await fetch(`/api/inverter/analytics?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {}
  };

  const fetchSystem = async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch {}

    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
      }
    } catch {}
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchTelemetry(),
      fetchTimers(),
      fetchAnalytics(analyticsRange),
      fetchSystem(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Initial load and live 2.5s polling
  useEffect(() => {
    handleManualRefresh();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAnalytics(analyticsRange);
  }, [analyticsRange]);

  // Inverter Control Handler
  const handleControl = async (action: string, value?: string, relay?: string) => {
    // Optimistic UI updates
    setInverterState(prev => {
      const next = { ...prev };
      if (action === 'powerState' && value) next.powerState = value as any;
      if (action === 'outputPriority' && value) next.outputPriority = value as any;
      if (action === 'chargerPriority' && value) next.chargerPriority = value as any;
      if (action === 'toggleRelay' && relay && relay in next.relays) {
        next.relays = {
          ...next.relays,
          [relay]: !next.relays[relay as keyof typeof next.relays],
        };
      }
      return next;
    });

    try {
      const res = await fetch('/api/inverter/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value, relay }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inverterState) setInverterState(data.inverterState);
      }
    } catch (err) {
      console.error('Inverter control error:', err);
    }
  };

  // Timers Handlers
  const handleAddTimer = async (timer: Partial<InverterTimerRule>) => {
    try {
      const res = await fetch('/api/inverter/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', timer }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timers) setTimers(data.timers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTimer = async (timerId: string, enabled?: boolean) => {
    setTimers(prev => prev.map(t => t.id === timerId ? { ...t, enabled: enabled ?? !t.enabled } : t));
    try {
      const res = await fetch('/api/inverter/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', timerId, enabled }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timers) setTimers(data.timers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTimer = async (timerId: string) => {
    setTimers(prev => prev.filter(t => t.id !== timerId));
    try {
      const res = await fetch('/api/inverter/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', timerId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timers) setTimers(data.timers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const lanUrl = systemInfo?.lanUrl || `http://${window.location.hostname}:3000`;

  return (
    <div className="min-h-screen bg-[#0d1017] text-[#e2e8f0] flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <TollpowerNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inverterState={inverterState}
        systemInfo={systemInfo}
        onOpenQr={() => setShowQrModal(true)}
        onOpenGitModal={() => setShowGitModal(true)}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <InverterDashboard
            state={inverterState}
            onControl={handleControl}
            onRefresh={handleManualRefresh}
          />
        )}

        {activeTab === 'timers' && (
          <TimersAndModesStudio
            inverterState={inverterState}
            timers={timers}
            onControl={handleControl}
            onAddTimer={handleAddTimer}
            onToggleTimer={handleToggleTimer}
            onDeleteTimer={handleDeleteTimer}
          />
        )}

        {activeTab === 'analytics' && (
          <LongTermAnalytics
            analytics={analytics}
            selectedRange={analyticsRange}
            onRangeChange={setAnalyticsRange}
            onRefresh={() => fetchAnalytics(analyticsRange)}
            isLoading={isRefreshing}
          />
        )}

        {activeTab === 'pi-system' && (
          <PiHostAndUpdater
            system={systemInfo}
            gitStatus={gitStatus}
            onRefreshSystem={fetchSystem}
            onOpenGitModal={() => setShowGitModal(true)}
          />
        )}

        {activeTab === 'guide' && (
          <PiHowToGuide />
        )}
      </main>

      {/* QR Code Modal for Phone/Tablet fast connection */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        lanUrl={lanUrl}
        hostname={systemInfo?.hostname || 'tollpower'}
      />

      {/* Git Push Instructions Modal */}
      <GitPushModal
        isOpen={showGitModal}
        onClose={() => setShowGitModal(false)}
        remoteUrl={gitStatus?.remoteUrl || 'https://github.com/spunkyindigo/tollpower.git'}
        onSuccess={fetchSystem}
      />
    </div>
  );
}
