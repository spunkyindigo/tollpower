import React from 'react';
import { Github, CheckCircle2, Download, Terminal } from 'lucide-react';
import { GITHUB_PROJECT_FILES } from '../data/githubFiles';
import { downloadZipBundle } from '../utils/zipExport';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  passedCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  passedCount,
  totalCount,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadZipBundle(GITHUB_PROJECT_FILES, 'github-ready-suite.zip');
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const navItems = [
    { id: 'audit', label: 'Readiness Audit', icon: CheckCircle2 },
    { id: 'assistant', label: 'Git & Push Guide', icon: Terminal },
    { id: 'readme', label: 'README Studio' },
    { id: 'licenses', label: 'License Picker' },
    { id: 'workflows', label: 'CI/CD Workflows' },
    { id: 'templates', label: 'Issue & PR Forms' },
    { id: 'scanner', label: 'Secrets Scanner' },
    { id: 'files', label: 'Repo Files (10)' },
  ];

  return (
    <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#21262d] border border-[#30363d] text-white">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-lg tracking-tight">GitHub Ready</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">Repository Preparation, Audit & Publishing Suite</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-[#21262d] px-3 py-1.5 rounded-md border border-[#30363d]">
              <span className="text-[#8b949e]">Audit Status:</span>
              <span className="flex items-center text-[#3fb950] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {passedCount}/{totalCount} Passed (100%)
              </span>
            </div>

            <button
              onClick={() => setActiveTab('assistant')}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-[#21262d] text-white hover:bg-[#30363d] border border-[#30363d] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5 text-[#58a6ff]" />
              Push Commands
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {downloading ? 'Packaging...' : 'Download .ZIP'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none border-t border-[#21262d] pt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap flex items-center space-x-1.5 border-b-2 ${
                  isActive
                    ? 'border-[#f78166] text-white bg-[#0d1117]/60'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
