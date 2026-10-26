import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  X, 
  GitBranch, 
  ArrowUpRight, 
  Key, 
  UploadCloud, 
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { sfx } from '../utils/sfx';

interface GitPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  remoteUrl: string;
  onSuccess?: () => void;
}

export const GitPushModal: React.FC<GitPushModalProps> = ({
  isOpen,
  onClose,
  remoteUrl: initialRemoteUrl,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'cli'>('direct');
  const [remoteUrl, setRemoteUrl] = useState(initialRemoteUrl || 'https://github.com/spunkyindigo/tollpower.git');
  const [token, setToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    success?: boolean;
    message?: string;
    logs?: string[];
  } | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const commands = [
    { label: 'Step 1: Check Git Repo', cmd: 'git status' },
    { label: 'Step 2: Add Remote Origin', cmd: `git remote set-url origin ${remoteUrl} || git remote add origin ${remoteUrl}` },
    { label: 'Step 3: Set Branch to Main', cmd: 'git branch -M main' },
    { label: 'Step 4: Push to GitHub', cmd: 'git push -u origin main' },
  ];

  const fullScript = commands.map(c => c.cmd).join('\n');

  const copyCmd = async (cmd: string, index?: number) => {
    sfx.playCoin();
    try {
      await navigator.clipboard.writeText(cmd);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
      }
    } catch {}
  };

  const handleDirectPush = async (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playPowerUp();
    setIsPushing(true);
    setPushStatus(null);

    try {
      const res = await fetch('/api/git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          remoteUrl: remoteUrl.trim(),
          commitMessage: 'feat: Tollpower Voltacon 230V hybrid inverter monitor & Pi control station',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sfx.playCoin();
        setPushStatus({
          success: true,
          message: data.message || 'Successfully pushed to GitHub!',
          logs: data.logs || [],
        });
        if (onSuccess) onSuccess();
      } else {
        setPushStatus({
          success: false,
          message: data.error || 'Failed to push to GitHub.',
          logs: data.logs || [data.error || 'Push failed'],
        });
      }
    } catch (err: any) {
      setPushStatus({
        success: false,
        message: err.message || 'Network request failed',
        logs: [`Error: ${err.message}`],
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#151822] border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5 text-white">
            <span className="p-2 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold tracking-tight">Push Tollpower to GitHub</h3>
              <p className="text-xs text-slate-400">Sync code to your remote repository</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-[#0d1017] rounded-2xl border border-white/10">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('direct');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'direct'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Direct Push (Recommended)</span>
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('cli');
            }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'cli'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal CLI Commands</span>
          </button>
        </div>

        {/* Direct Push Tab */}
        {activeTab === 'direct' && (
          <form onSubmit={handleDirectPush} className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-semibold text-slate-200">GitHub Repository URL</label>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                  >
                    <span>Create new repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={remoteUrl}
                  onChange={e => setRemoteUrl(e.target.value)}
                  placeholder="https://github.com/username/tollpower.git"
                  className="w-full bg-[#0d1017] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>GitHub Personal Access Token (PAT)</span>
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Tollpower+Inverter+Station"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <span>Generate token (repo scope)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                  className="w-full bg-[#0d1017] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required to authorize push to GitHub. Used only for this push session; never stored in plaintext.
                </p>
              </div>
            </div>

            {/* Live Push Logs */}
            {pushStatus && (
              <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                pushStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center space-x-2 font-semibold">
                  {pushStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{pushStatus.message}</span>
                </div>
                {pushStatus.logs && pushStatus.logs.length > 0 && (
                  <div className="bg-[#0a0d14] p-2.5 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
                    {pushStatus.logs.map((log, idx) => (
                      <div key={idx} className="leading-tight text-slate-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <a
                href={remoteUrl.replace(/\.git$/, '')}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>View on GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPushing || !token.trim()}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <UploadCloud className={`w-3.5 h-3.5 mr-1.5 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Pushing to GitHub...' : 'Push to GitHub'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CLI Commands Tab */}
        {activeTab === 'cli' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Prefer running git from your terminal? Run these commands in your cloned project directory:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {commands.map((c, idx) => (
                <div key={idx} className="bg-[#0d1017] p-2.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-amber-300 block mb-0.5 font-sans font-semibold">{c.label}</span>
                    <span className="text-sky-300 select-all">$ {c.cmd}</span>
                  </div>
                  <button
                    onClick={() => copyCmd(c.cmd, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => copyCmd(fullScript)}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all active:scale-[0.98]"
              >
                {copiedAll ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                <span>{copiedAll ? 'Commands Copied!' : 'Copy Entire Script'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
