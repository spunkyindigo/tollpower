import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  FolderGit2
} from 'lucide-react';

export const GitAssistant: React.FC = () => {
  const [username, setUsername] = useState('spunkyindigo');
  const [repoName, setRepoName] = useState('github-ready');
  const [protocol, setProtocol] = useState<'https' | 'ssh'>('https');
  const [defaultBranch, setDefaultBranch] = useState<'main' | 'master'>('main');
  const [commitMessage, setCommitMessage] = useState('feat: initial commit with GitHub ready assets');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeMode, setActiveMode] = useState<'git' | 'gh-cli'>('git');

  const remoteUrl = protocol === 'https'
    ? `https://github.com/${username}/${repoName}.git`
    : `git@github.com:${username}/${repoName}.git`;

  const gitSteps = [
    {
      title: 'Initialize local Git repository',
      cmd: 'git init',
      desc: 'Creates a new .git directory inside your project folder.',
    },
    {
      title: 'Stage all prepared repository files',
      cmd: 'git add .',
      desc: 'Stages README.md, LICENSE, .github workflows, and all source code.',
    },
    {
      title: 'Create the initial commit',
      cmd: `git commit -m "${commitMessage}"`,
      desc: 'Commits your staged changes locally with a descriptive message.',
    },
    {
      title: `Rename default branch to ${defaultBranch}`,
      cmd: `git branch -M ${defaultBranch}`,
      desc: 'Ensures standard GitHub main branch naming.',
    },
    {
      title: 'Add your remote GitHub repository origin',
      cmd: `git remote add origin ${remoteUrl}`,
      desc: 'Links your local repository with GitHub.',
    },
    {
      title: 'Push code and set upstream tracking',
      cmd: `git push -u origin ${defaultBranch}`,
      desc: 'Transfers your commits to GitHub and links the local and remote branches.',
    },
  ];

  const ghCliSteps = [
    {
      title: 'Authenticate with GitHub CLI (if not already logged in)',
      cmd: 'gh auth login',
      desc: 'Select GitHub.com -> HTTPS or SSH -> Browser authentication.',
    },
    {
      title: 'Create public GitHub repository and push code in one command',
      cmd: `gh repo create ${repoName} --public --source=. --remote=origin --push`,
      desc: 'Creates the repository on GitHub, sets remote origin, and pushes code instantly.',
    },
  ];

  const currentSteps = activeMode === 'git' ? gitSteps : ghCliSteps;

  const fullBashScript = activeMode === 'git'
    ? `#!/usr/bin/env bash
# Initialize and push to GitHub
git init
git add .
git commit -m "${commitMessage}"
git branch -M ${defaultBranch}
# If remote exists, update it, otherwise add it:
git remote remove origin 2>/dev/null || true
git remote add origin ${remoteUrl}
git push -u origin ${defaultBranch}
`
    : `#!/usr/bin/env bash
# Push using GitHub CLI
gh auth status 2>/dev/null || gh auth login
gh repo create ${repoName} --public --source=. --remote=origin --push
`;

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-[#58a6ff]" />
              <span>Git & GitHub Push Assistant</span>
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Customized step-by-step commands to push your project directly to GitHub.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            <button
              onClick={() => setActiveMode('git')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeMode === 'git'
                  ? 'bg-[#21262d] text-white shadow-xs'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Standard Git CLI
            </button>
            <button
              onClick={() => setActiveMode('gh-cli')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeMode === 'gh-cli'
                  ? 'bg-[#21262d] text-white shadow-xs'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              GitHub CLI (<code className="font-mono text-[#58a6ff]">gh</code>)
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#21262d]">
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">GitHub Username / Org</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim() || 'username')}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
              placeholder="e.g. octocat"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">Repository Name</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.trim() || 'my-repo')}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
              placeholder="e.g. awesome-project"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">Connection Protocol</label>
            <div className="flex rounded-md border border-[#30363d] overflow-hidden bg-[#0d1117]">
              <button
                type="button"
                onClick={() => setProtocol('https')}
                className={`flex-1 py-1.5 text-xs font-mono transition-colors ${
                  protocol === 'https' ? 'bg-[#21262d] text-white font-semibold' : 'text-[#8b949e]'
                }`}
              >
                HTTPS
              </button>
              <button
                type="button"
                onClick={() => setProtocol('ssh')}
                className={`flex-1 py-1.5 text-xs font-mono transition-colors ${
                  protocol === 'ssh' ? 'bg-[#21262d] text-white font-semibold' : 'text-[#8b949e]'
                }`}
              >
                SSH
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">Default Branch</label>
            <div className="flex rounded-md border border-[#30363d] overflow-hidden bg-[#0d1117]">
              <button
                type="button"
                onClick={() => setDefaultBranch('main')}
                className={`flex-1 py-1.5 text-xs font-mono transition-colors ${
                  defaultBranch === 'main' ? 'bg-[#21262d] text-white font-semibold' : 'text-[#8b949e]'
                }`}
              >
                main
              </button>
              <button
                type="button"
                onClick={() => setDefaultBranch('master')}
                className={`flex-1 py-1.5 text-xs font-mono transition-colors ${
                  defaultBranch === 'master' ? 'bg-[#21262d] text-white font-semibold' : 'text-[#8b949e]'
                }`}
              >
                master
              </button>
            </div>
          </div>
        </div>

        {/* Remote URL preview box */}
        <div className="bg-[#0d1117] p-3 rounded-md border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#8b949e] font-mono">Target Remote:</span>
            <span className="font-mono text-[#58a6ff] select-all break-all">{remoteUrl}</span>
          </div>
          <button
            onClick={() => copyToClipboard(remoteUrl)}
            className="text-xs text-[#8b949e] hover:text-white flex items-center space-x-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Remote URL</span>
          </button>
        </div>
      </div>

      {/* Steps Execution Box */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#1c2128]">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-[#3fb950]" />
            <h3 className="font-semibold text-sm text-white">
              {activeMode === 'git' ? 'Step-by-Step Terminal Instructions' : 'GitHub CLI One-Line Command'}
            </h3>
          </div>

          <button
            onClick={() => copyToClipboard(fullBashScript)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors shadow-xs"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Script Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy All as Bash Script
              </>
            )}
          </button>
        </div>

        <div className="divide-y divide-[#21262d]">
          {currentSteps.map((step, idx) => (
            <div key={idx} className="p-4 space-y-2 hover:bg-[#1c2128]/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#21262d] text-[#8b949e] text-xs font-mono flex items-center justify-center border border-[#30363d]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-xs text-white">{step.title}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(step.cmd, idx)}
                  className="inline-flex items-center px-2 py-1 text-xs rounded bg-[#21262d] text-[#c9d1d9] hover:text-white hover:bg-[#30363d] border border-[#30363d] transition-colors font-mono"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 mr-1 text-[#3fb950]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d] font-mono text-xs text-[#58a6ff] flex items-center justify-between overflow-x-auto">
                <span className="select-all">$ {step.cmd}</span>
              </div>
              <p className="text-[11px] text-[#8b949e]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Tips & Authentication Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
          <div className="flex items-center space-x-2 text-[#d29922]">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="font-semibold text-xs text-white">GitHub Authentication Requirement</h4>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            GitHub no longer accepts account passwords when pushing over HTTPS. Use one of these methods:
          </p>
          <ul className="text-xs text-[#c9d1d9] space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-medium text-white">Personal Access Token (PAT):</span> Create token in{' '}
              <span className="font-mono text-[#58a6ff]">Settings &rarr; Developer Settings &rarr; Tokens (classic)</span> with <code className="font-mono bg-[#0d1117] px-1 rounded">repo</code> scope and use it as your password.
            </li>
            <li>
              <span className="font-medium text-white">SSH Key:</span> Add your public key (<code className="font-mono bg-[#0d1117] px-1 rounded">~/.ssh/id_ed25519.pub</code>) to GitHub for passwordless pushes.
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5">
          <div className="flex items-center space-x-2 text-[#58a6ff]">
            <HelpCircle className="w-4 h-4" />
            <h4 className="font-semibold text-xs text-white">Common Troubleshooting</h4>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-[#f85149] font-mono">fatal: remote origin already exists:</span>
              <p className="text-[#8b949e] font-mono text-[11px] mt-0.5">$ git remote set-url origin {remoteUrl}</p>
            </div>
            <div>
              <span className="text-[#f85149] font-mono">error: src refspec main does not match any:</span>
              <p className="text-[#8b949e] mt-0.5">Ensure you made a commit first with <code className="font-mono text-white">git add . && git commit -m "init"</code> before running <code className="font-mono text-white">git push</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
