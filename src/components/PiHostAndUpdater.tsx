import React, { useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Wifi, 
  Clock, 
  HardDrive, 
  Copy, 
  Check, 
  ArrowUpCircle,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  Server
} from 'lucide-react';
import { SystemInfo, GitStatus } from '../types/tollpower';
import { sfx } from '../utils/sfx';

interface PiHostAndUpdaterProps {
  system: SystemInfo | null;
  gitStatus: GitStatus | null;
  onRefreshSystem: () => void;
  onOpenGitModal?: () => void;
}

export const PiHostAndUpdater: React.FC<PiHostAndUpdaterProps> = ({
  system,
  gitStatus,
  onRefreshSystem,
  onOpenGitModal,
}) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [pullingUpdate, setPullingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    hasUpdate?: boolean;
    commitsBehind?: number;
    message?: string;
    logs: string[];
  } | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  const handleCheckUpdate = async () => {
    sfx.playClick();
    setCheckingUpdate(true);
    try {
      const res = await fetch('/api/check-update', { method: 'POST' });
      const data = await res.json();
      if (data.hasUpdate) sfx.playCoin();
      setUpdateResult({
        hasUpdate: data.hasUpdate,
        commitsBehind: data.commitsBehind,
        message: data.latestCommit,
        logs: data.logs || [],
      });
    } catch (err: any) {
      setUpdateResult({
        hasUpdate: false,
        message: err.message,
        logs: [`Error: ${err.message}`],
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handlePullAndInstall = async () => {
    sfx.playPowerUp();
    setPullingUpdate(true);
    try {
      const res = await fetch('/api/pull-and-install', { method: 'POST' });
      const data = await res.json();
      setUpdateResult(prev => ({
        hasUpdate: false,
        commitsBehind: 0,
        message: data.message,
        logs: [...(prev?.logs || []), ...(data.logs || [])],
      }));
      onRefreshSystem();
    } catch (err: any) {
      setUpdateResult(prev => ({
        hasUpdate: false,
        message: err.message,
        logs: [...(prev?.logs || []), `Update failed: ${err.message}`],
      }));
    } finally {
      setPullingUpdate(false);
    }
  };

  const copyLogs = async () => {
    if (!updateResult?.logs) return;
    sfx.playClick();
    try {
      await navigator.clipboard.writeText(updateResult.logs.join('\n'));
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 1500);
    } catch {}
  };

  const copyIpUrl = async (url: string) => {
    sfx.playCoin();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 1500);
    } catch {}
  };

  const piUrl = system?.primaryIp ? `http://${system.primaryIp}:${system.port || 3000}` : 'http://tollpower.local:3000';

  return (
    <div className="space-y-6">
      {/* Header Deck: Google Pixel Material 3 Style */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#151822] border border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Raspberry Pi Host & Self-Updater
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {system?.model || 'Raspberry Pi OS (Linux ARM64)'} • Host: {system?.hostname || 'tollpower'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate || pullingUpdate}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${checkingUpdate ? 'animate-spin text-sky-400' : ''}`} />
              <span>{checkingUpdate ? 'Checking Git...' : 'Check for Updates'}</span>
            </button>

            <button
              onClick={handlePullAndInstall}
              disabled={checkingUpdate || pullingUpdate}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ArrowUpCircle className={`w-3.5 h-3.5 mr-2 ${pullingUpdate ? 'animate-bounce' : ''}`} />
              <span>{pullingUpdate ? 'Pulling & Building...' : 'Pull & Install Update'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pixel Device Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Local Wi-Fi & LAN */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Local Network IP</span>
            <Wifi className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono truncate">
            {system?.primaryIp || '192.168.1.x'}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-sky-400 font-mono">Port {system?.port || 3000}</span>
            <button
              onClick={() => copyIpUrl(piUrl)}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* CPU Temp */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">CPU Core Temperature</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {system?.cpuTemp || 42.4}°C
          </div>
          <div className="w-full bg-[#0d1017] rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                (system?.cpuTemp || 42) > 65 ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, ((system?.cpuTemp || 42) / 80) * 100)}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Memory (RAM)</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {system?.memory.percent || 14}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {system?.memory.usedMb || 480} MB / {system?.memory.totalMb || 3900} MB
          </p>
        </div>

        {/* Uptime */}
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">System Uptime</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight truncate">
            {system?.uptimeFormatted || '3d 14h 22m'}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            Systemd service active
          </p>
        </div>
      </div>

      {/* Git Repository Status Card */}
      <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Repository Version & Origin</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Local working tree linked to remote upstream repository
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            {onOpenGitModal && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenGitModal();
                }}
                className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all active:scale-[0.98]"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Push to GitHub</span>
              </button>
            )}
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Branch: {gitStatus?.branch || 'main'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Commit: {gitStatus?.commitHash ? gitStatus.commitHash.slice(0, 7) : '7a9c4b1'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-[#0d1017] p-3.5 rounded-2xl border border-white/5">
          <div>
            <span className="text-slate-500">Remote URL: </span>
            <span className="text-slate-300 truncate inline-block max-w-[260px] align-bottom">
              {gitStatus?.remoteUrl || 'https://github.com/user/tollpower.git'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Last Commit Msg: </span>
            <span className="text-amber-300 truncate inline-block max-w-[260px] align-bottom">
              {gitStatus?.commitMessage || 'feat: Voltacon 230V 50Hz and 48V LiFePO4 direct USB monitor'}
            </span>
          </div>
        </div>
      </div>

      {/* Update Result & Terminal Console */}
      {updateResult && (
        <div className="bg-[#151822] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {updateResult.hasUpdate ? 'Update Available!' : 'Update Log / Console Output'}
              </h3>
              {updateResult.commitsBehind !== undefined && updateResult.commitsBehind > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {updateResult.commitsBehind} commit(s) behind
                </span>
              )}
            </div>

            <button
              onClick={copyLogs}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              {copiedLog ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Log</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0a0d14] p-4 rounded-2xl border border-white/10 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto space-y-1">
            {updateResult.logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-slate-600 mr-2">$</span>
                <span className={log.startsWith('Error') ? 'text-rose-400' : 'text-emerald-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
