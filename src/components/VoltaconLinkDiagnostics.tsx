import React, { useState, useEffect, useRef } from 'react';
import { 
  Cable, 
  Terminal, 
  Cpu, 
  Activity, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sliders, 
  Copy, 
  Trash2, 
  ShieldCheck, 
  Usb, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  HelpCircle,
  Database
} from 'lucide-react';
import { InverterState, LinkDiagnosticsStatus, LinkDiagnosticsLog, HardwareLinkConfig } from '../types/tollpower';
import { sfx } from '../utils/sfx';

interface VoltaconLinkDiagnosticsProps {
  inverterState: InverterState;
  onRefreshTelemetry: () => void;
}

export const VoltaconLinkDiagnostics: React.FC<VoltaconLinkDiagnosticsProps> = ({
  inverterState,
  onRefreshTelemetry,
}) => {
  const [linkStatus, setLinkStatus] = useState<LinkDiagnosticsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customCommand, setCustomCommand] = useState('QPIGS');
  const [autoCrc, setAutoCrc] = useState(true);
  const [copiedUdev, setCopiedUdev] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Interface Configuration form state
  const [configPort, setConfigPort] = useState('/dev/hidraw0');
  const [configBaud, setConfigBaud] = useState(2400);
  const [configProtocol, setConfigProtocol] = useState<'PI30' | 'PI18' | 'PI16'>('PI30');
  const [configTimeout, setConfigTimeout] = useState(1500);
  const [configInterval, setConfigInterval] = useState(2500);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Fetch full link diagnostics from server
  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/inverter/link-status');
      if (res.ok) {
        const data: LinkDiagnosticsStatus = await res.json();
        setLinkStatus(data);
        setConfigPort(data.devicePort || '/dev/hidraw0');
        setConfigBaud(data.baudRate || 2400);
        setConfigProtocol((data.protocol as any) || 'PI30');
      }
    } catch (e) {
      console.error('Failed to load link status:', e);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll console when new logs arrive
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [linkStatus?.recentLogs, autoScroll]);

  // Master Switch: Toggle Simulation vs Live Real Hardware
  const handleToggleMode = async (nextSimMode: boolean) => {
    sfx.playClick();
    setIsLoading(true);
    try {
      const res = await fetch('/api/inverter/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationMode: nextSimMode }),
      });
      if (res.ok) {
        sfx.playSuccess();
        await fetchDiagnostics();
        onRefreshTelemetry();
      }
    } catch (err) {
      console.error('Error toggling mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save interface configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playClick();
    setIsSavingConfig(true);
    setConfigMessage(null);
    try {
      const res = await fetch('/api/inverter/link-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          port: configPort,
          baudRate: Number(configBaud),
          protocol: configProtocol,
          timeoutMs: Number(configTimeout),
          pollingIntervalMs: Number(configInterval),
        }),
      });
      if (res.ok) {
        sfx.playSuccess();
        setConfigMessage('Interface settings applied successfully.');
        setTimeout(() => setConfigMessage(null), 4000);
        await fetchDiagnostics();
      }
    } catch (err: any) {
      setConfigMessage(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Test link handshake probe
  const handleProbe = async () => {
    sfx.playClick();
    setIsProbing(true);
    try {
      await fetch('/api/inverter/link-probe', { method: 'POST' });
      await fetchDiagnostics();
      onRefreshTelemetry();
      sfx.playCoin();
    } catch (err) {
      console.error('Probe failed:', err);
    } finally {
      setIsProbing(false);
    }
  };

  // Execute raw PI30 command
  const handleSendCommand = async (cmdToSend?: string) => {
    const cmd = (cmdToSend || customCommand).trim();
    if (!cmd) return;
    sfx.playClick();
    setIsSending(true);
    try {
      await fetch('/api/inverter/raw-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, autoCrc }),
      });
      await fetchDiagnostics();
      onRefreshTelemetry();
    } catch (err) {
      console.error('Command failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Clear diagnostic logs
  const handleClearLogs = async () => {
    sfx.playClick();
    try {
      await fetch('/api/inverter/clear-logs', { method: 'POST' });
      await fetchDiagnostics();
    } catch {}
  };

  // Copy logs to clipboard
  const handleCopyLogs = () => {
    if (!linkStatus?.recentLogs) return;
    sfx.playCoin();
    const formatted = linkStatus.recentLogs
      .map(l => `[${l.timestamp}] [${l.type}] ${l.command ? `${l.command} ` : ''}${l.note || ''} ${l.rawAscii ? `| ${l.rawAscii}` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  // Copy udev rule snippet
  const handleCopyUdev = () => {
    sfx.playCoin();
    const udevText = `# /etc/udev/rules.d/99-voltacon.rules\n# Grant non-root access to Voltacon / Voltronic USB HID link (VID 0665 PID 5161)\nSUBSYSTEM=="hidraw", ATTRS{idVendor}=="0665", ATTRS{idProduct}=="5161", MODE="0666", GROUP="dialout"\nSUBSYSTEM=="tty", ATTRS{idVendor}=="0403", MODE="0666", GROUP="dialout"`;
    navigator.clipboard.writeText(udevText);
    setCopiedUdev(true);
    setTimeout(() => setCopiedUdev(false), 2500);
  };

  const isSimulated = linkStatus?.simulationMode ?? inverterState?.isSimulationMode ?? true;
  const isConnected = linkStatus?.hardwareStatus === 'connected';
  const hasHardwareError = !isConnected && !isSimulated;

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Mode Switch (DEMO vs REAL) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isSimulated 
          ? 'bg-amber-950/20 border-amber-500/30' 
          : isConnected 
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.1)]'
            : 'bg-rose-950/20 border-rose-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${
                isSimulated 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : isConnected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {isSimulated ? <Sliders className="w-4 h-4" /> : <Cable className="w-4 h-4" />}
              </span>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>{isSimulated ? 'Demo & Simulation Mode Active' : 'Live Hardware Mode (Strict Real Data)'}</span>
                </h2>
                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span>{isSimulated ? 'Synthetic 230V telemetry' : `Direct physical link (${linkStatus?.devicePort || '/dev/hidraw0'})`}</span>
                  <span>·</span>
                  <span>{isSimulated ? 'No physical inverter required' : (isConnected ? 'Handshake verified' : 'Awaiting physical signal')}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isSimulated ? (
                <span>
                  Tollpower is currently running in <strong className="text-amber-300">Demo Mode</strong>. Voltages, PV yield, and battery SOC are synthesized by the simulation daemon. Switch to <strong className="text-emerald-300">Live Hardware Mode</strong> when your Raspberry Pi is wired to your Voltacon inverter to only display genuine telemetry.
                </span>
              ) : (
                <span>
                  <strong className="text-emerald-300">Live Hardware Mode</strong> is engaged. All simulated fluctuation and jitter are strictly halted. Every watt, voltage, and relay status is parsed directly from real serial/HID queries. If your Voltacon cable is disconnected, the UI will accurately report offline.
                </span>
              )}
            </p>
          </div>

          {/* THE BIG SWITCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-[#090b10] p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                disabled={isLoading}
                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  isSimulated
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulated (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                disabled={isLoading}
                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  !isSimulated
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Live Hardware Only</span>
              </button>
            </div>

            <button
              onClick={handleProbe}
              disabled={isProbing}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 flex items-center justify-center space-x-1.5 transition-colors"
              title="Send test handshake frame"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Probe Link</span>
            </button>
          </div>
        </div>

        {/* Real Hardware Warning when disconnected in Real Mode */}
        {hasHardwareError && (
          <div className="mt-4 pt-3.5 border-t border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Voltacon Inverter Disconnected / No Reply on {linkStatus?.devicePort || '/dev/hidraw0'}</p>
              <p className="text-slate-400 mt-0.5">
                Strict Real Hardware Mode is active. Simulated data has been suppressed (0 W output shown). Connect the USB OTG cable or USB-to-RS232 adapter to your Raspberry Pi, verify <code className="text-rose-200 bg-white/5 px-1 py-0.5 rounded">dialout</code> group permissions, or switch back to Demo Mode.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hardware Link Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <Cable className="w-3.5 h-3.5 text-sky-400" />
            <span>Port Node</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white truncate" title={linkStatus?.devicePort}>
            {linkStatus?.devicePort || '/dev/hidraw0'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {linkStatus?.protocol || 'PI30'} · {linkStatus?.baudRate || 2400} baud
          </div>
        </div>

        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Link State</span>
          </div>
          <div className="mt-1 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-mono text-xs font-bold text-white">
              {isConnected ? 'LINK ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {isSimulated ? 'Simulated Daemon' : 'Real Hardware Node'}
          </div>
        </div>

        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Roundtrip Latency</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {linkStatus?.latencyMs ?? 18} ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            CRC-CCITT (XMODEM)
          </div>
        </div>

        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            <span>Queries Sent</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {linkStatus?.counters?.queriesSent ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            RX: {linkStatus?.counters?.responsesReceived ?? 0} packets
          </div>
        </div>

        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>CRC Integrity</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {linkStatus?.counters?.crcErrors === 0 ? '100% Valid' : `${linkStatus?.counters?.crcErrors} Errors`}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Timeouts: {linkStatus?.counters?.timeouts ?? 0}
          </div>
        </div>

        <div className="p-3.5 bg-[#141721] rounded-2xl border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
            <Usb className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pi USB Permissions</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {linkStatus?.permissions?.canRead ? 'Read/Write OK' : 'Check Dialout'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title={linkStatus?.permissions?.error}>
            {linkStatus?.permissions?.canWrite ? 'Access Granted' : 'Permission Denied'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interface Settings (Left) + Terminal & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Hardware Interface Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-[#141721] rounded-2xl border border-white/10">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Inverter Link Settings</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Linux /dev Rig</span>
            </div>

            <form onSubmit={handleSaveConfig} className="mt-4 space-y-4">
              {/* Device Path */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Device Node Path
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={configPort}
                    onChange={(e) => setConfigPort(e.target.value)}
                    placeholder="/dev/hidraw0 or /dev/ttyUSB0"
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  
                  {/* Quick Select Candidates */}
                  {linkStatus?.availablePorts && linkStatus.availablePorts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {linkStatus.availablePorts.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setConfigPort(p.split(' ')[0])}
                          className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors ${
                            configPort === p.split(' ')[0]
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Voltacon OTG is typically <code className="text-slate-300">/dev/hidraw0</code>. USB-Serial adapters use <code className="text-slate-300">/dev/ttyUSB0</code>.
                </p>
              </div>

              {/* Protocol & Baud Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Protocol Variant
                  </label>
                  <select
                    value={configProtocol}
                    onChange={(e) => setConfigProtocol(e.target.value as any)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="PI30">PI30 (Standard Voltacon/Axpert)</option>
                    <option value="PI18">PI18 (Infinisolar Hybrid)</option>
                    <option value="PI16">PI16 (Legacy MKS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Serial Baud Rate
                  </label>
                  <select
                    value={configBaud}
                    onChange={(e) => setConfigBaud(Number(e.target.value))}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value={2400}>2400 baud (Standard RJ45)</option>
                    <option value={9600}>9600 baud</option>
                    <option value={19200}>19200 baud</option>
                  </select>
                </div>
              </div>

              {/* Polling Interval & Timeout */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Polling Interval
                  </label>
                  <select
                    value={configInterval}
                    onChange={(e) => setConfigInterval(Number(e.target.value))}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value={1000}>1000 ms (Fast)</option>
                    <option value={2500}>2500 ms (Recommended)</option>
                    <option value={5000}>5000 ms (Relaxed)</option>
                    <option value={10000}>10000 ms (Slow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Timeout Threshold
                  </label>
                  <select
                    value={configTimeout}
                    onChange={(e) => setConfigTimeout(Number(e.target.value))}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value={1000}>1000 ms</option>
                    <option value={1500}>1500 ms (Default)</option>
                    <option value={3000}>3000 ms</option>
                  </select>
                </div>
              </div>

              {configMessage && (
                <div className={`p-2.5 rounded-xl text-xs font-medium ${
                  configMessage.includes('Fail') 
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {configMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingConfig}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                {isSavingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Apply Link Configuration</span>
              </button>
            </form>
          </div>

          {/* Raspberry Pi Hardware & Udev Setup Helper */}
          <div className="p-5 bg-[#141721] rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Pi Linux Permissions Helper</h3>
              </div>
              <button
                onClick={handleCopyUdev}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                title="Copy udev rules to clipboard"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedUdev ? 'Copied!' : 'Copy Rule'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To allow Tollpower to read <code className="text-slate-300">/dev/hidraw*</code> on Raspberry Pi without running as root, apply this udev rule:
            </p>

            <pre className="p-2.5 bg-[#0d1017] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin">
              {`SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0665", ATTRS{idProduct}=="5161", MODE="0666", GROUP="dialout"`}
            </pre>

            <div className="space-y-1 text-[11px] text-slate-400">
              <p>1. Run: <code className="text-emerald-400 font-mono">sudo usermod -a -G dialout pi</code></p>
              <p>2. Reload: <code className="text-emerald-400 font-mono">sudo udevadm control --reload-rules && sudo udevadm trigger</code></p>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Command Console & Frame Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Protocol Command Tester */}
          <div className="p-5 bg-[#141721] rounded-2xl border border-white/10">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Inverter Protocol Command Tester</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <label className="flex items-center space-x-1.5 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoCrc}
                    onChange={(e) => setAutoCrc(e.target.checked)}
                    className="rounded bg-[#0d1017] border-white/20 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-[11px]">Auto CRC-CCITT</span>
                </label>
              </div>
            </div>

            {/* Quick Command Action Buttons */}
            <div className="mt-3.5">
              <div className="text-[11px] text-slate-400 mb-2 font-medium">Standard Voltronic / Voltacon PI30 Commands:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { cmd: 'QPIGS', desc: 'General Status (V, A, W, SOC)' },
                  { cmd: 'QPIRI', desc: 'Rated Specs & Battery Limits' },
                  { cmd: 'QMOD', desc: 'Operating Mode' },
                  { cmd: 'QFLAG', desc: 'Enabled Flags' },
                  { cmd: 'QPIWS', desc: 'Warning & Fault Flags' },
                  { cmd: 'QVFW', desc: 'DSP Main Firmware Version' },
                  { cmd: 'QID', desc: 'Inverter Serial Number' },
                ].map((item) => (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => {
                      setCustomCommand(item.cmd);
                      handleSendCommand(item.cmd);
                    }}
                    disabled={isSending}
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-semibold border border-white/10 transition-colors flex items-center space-x-1.5"
                    title={item.desc}
                  >
                    <span className="text-emerald-400">{item.cmd}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">· {item.cmd === 'QPIGS' ? 'Status' : item.cmd === 'QPIRI' ? 'Ratings' : item.cmd === 'QMOD' ? 'Mode' : item.cmd}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Command Input */}
            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="Enter Voltronic command (e.g. QPIGS, QPIRI, QMOD, QDI)"
                  className="w-full bg-[#0d1017] border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendCommand();
                    }
                  }}
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-500 select-none">
                  +CRC
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSendCommand()}
                disabled={isSending || !customCommand.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0"
              >
                {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Query</span>
              </button>
            </div>

            {/* Last Command Frame Inspector */}
            {linkStatus?.lastCommandResponse && (
              <div className="mt-4 p-3.5 bg-[#0d1017] rounded-xl border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-400">
                      {linkStatus.lastCommandResponse.command}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {linkStatus.lastCommandResponse.latencyMs}ms roundtrip
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    linkStatus.lastCommandResponse.validCrc
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {linkStatus.lastCommandResponse.validCrc ? 'CRC CHECKSUM VALID' : 'CRC ERROR'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400">TX Raw Frame (Hex + ASCII):</div>
                    <div className="text-slate-200 mt-1 break-all select-all">
                      {linkStatus.lastCommandResponse.rawHex || '5150494753...'}
                    </div>
                  </div>

                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400">RX Response Payload (ASCII):</div>
                    <div className="text-emerald-300 mt-1 break-all select-all">
                      {linkStatus.lastCommandResponse.rawAscii || '(230.2 50.0 230.0...'}
                    </div>
                  </div>
                </div>

                {/* Parsed QPIGS Tokens Breakdown */}
                {linkStatus.lastParsedQPIGS && (
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[11px] font-medium text-slate-400 mb-1.5">Parsed Telemetry Fields:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 bg-white/5 rounded">
                        <span className="text-slate-500">AC Output:</span>{' '}
                        <span className="text-white font-bold">{linkStatus.lastParsedQPIGS.acOutputActivePowerWatts} W</span>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded">
                        <span className="text-slate-500">AC Voltage:</span>{' '}
                        <span className="text-white font-bold">{linkStatus.lastParsedQPIGS.acOutputVoltage} V</span>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded">
                        <span className="text-slate-500">Battery:</span>{' '}
                        <span className="text-white font-bold">{linkStatus.lastParsedQPIGS.batteryVoltage} V ({linkStatus.lastParsedQPIGS.batteryCapacitySoc}%)</span>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded">
                        <span className="text-slate-500">PV Input:</span>{' '}
                        <span className="text-white font-bold">{linkStatus.lastParsedQPIGS.pvChargingPowerWatts} W</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Diagnostic Packet Console */}
          <div className="p-5 bg-[#141721] rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Live Serial / HID Traffic Log</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    autoScroll ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {autoScroll ? 'Scroll: ON' : 'Scroll: OFF'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 transition-colors"
                  title="Copy log to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 transition-colors"
                  title="Clear log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrolling Console Window */}
            <div className="h-64 bg-[#090b10] rounded-xl border border-white/5 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin">
              {(!linkStatus?.recentLogs || linkStatus.recentLogs.length === 0) ? (
                <div className="text-slate-500 text-center py-8">
                  No packets recorded yet. Traffic will appear as queries execute.
                </div>
              ) : (
                linkStatus.recentLogs.map((log: LinkDiagnosticsLog) => {
                  const time = new Date(log.timestamp).toLocaleTimeString();
                  return (
                    <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                      <span className="text-slate-600 shrink-0 select-none">{time}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        log.type === 'TX'
                          ? 'bg-purple-500/20 text-purple-300'
                          : log.type === 'RX'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : log.type === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-slate-300 break-all">
                        {log.command && <strong className="text-white mr-1.5">{log.command}</strong>}
                        {log.rawAscii && <span className="text-emerald-400 mr-1.5">{log.rawAscii}</span>}
                        {log.rawHex && <span className="text-slate-500 text-[10px] mr-1.5">[{log.rawHex}]</span>}
                        {log.note && <span className="text-slate-400 italic">({log.note})</span>}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
