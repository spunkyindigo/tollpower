import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  Code, 
  Plus, 
  Trash2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { README_PRESETS, compileReadme } from '../data/readmePresets';
import { ReadmeConfig } from '../types';
import { downloadSingleFile } from '../utils/zipExport';

export const ReadmeStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('react-vite');
  const [config, setConfig] = useState<ReadmeConfig>(README_PRESETS['react-vite']);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  const loadPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setConfig({ ...README_PRESETS[presetKey] });
  };

  const compiledMarkdown = compileReadme(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    downloadSingleFile('README.md', compiledMarkdown);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setConfig(prev => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleBadge = (badgeKey: keyof ReadmeConfig['badges']) => {
    setConfig(prev => ({
      ...prev,
      badges: {
        ...prev.badges,
        [badgeKey]: !prev.badges[badgeKey]
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#3fb950]" />
              <span>Interactive README Studio</span>
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Customize project documentation, select badges, add features, and preview live formatted markdown.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-[#21262d] text-white hover:bg-[#30363d] border border-[#30363d] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download README.md
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#21262d]">
          <span className="text-xs font-mono text-[#8b949e]">Template Presets:</span>
          {Object.entries({
            'react-vite': 'React 19 + Vite App',
            'full-stack': 'Full-Stack Node & Express',
            'ai-gemini': 'Google Gemini AI App',
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedPreset === key
                  ? 'bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/40'
                  : 'bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
              Project Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Project Title</label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Tagline / Short Summary</label>
                <textarea
                  rows={2}
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">GitHub Owner</label>
                  <input
                    type="text"
                    value={config.repoOwner}
                    onChange={(e) => setConfig({ ...config, repoOwner: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={config.repoName}
                    onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Badges Toggle */}
            <div className="pt-2 border-t border-[#21262d] space-y-2">
              <label className="block text-xs text-[#8b949e]">Shields.io Badges to Display</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries({
                  ci: 'GitHub Actions CI',
                  license: 'License Badge',
                  react: 'React 19',
                  typescript: 'TypeScript',
                  vite: 'Vite 8',
                  tailwind: 'Tailwind CSS',
                  prsWelcome: 'PRs Welcome',
                }).map(([key, label]) => {
                  const bKey = key as keyof ReadmeConfig['badges'];
                  const isChecked = config.badges[bKey];
                  return (
                    <label
                      key={key}
                      onClick={() => toggleBadge(bKey)}
                      className={`flex items-center space-x-2 p-2 rounded border cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-[#238636]/10 border-[#238636]/40 text-white'
                          : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded bg-[#0d1117] border-[#30363d] text-[#238636]"
                      />
                      <span className="text-[11px] font-mono">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Key Features List */}
            <div className="pt-2 border-t border-[#21262d] space-y-2">
              <label className="block text-xs text-[#8b949e]">Key Features</label>
              <div className="space-y-1.5">
                {config.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0d1117] px-2.5 py-1.5 rounded border border-[#30363d] text-xs">
                    <span className="text-[#c9d1d9] truncate mr-2">{feat}</span>
                    <button
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-[#8b949e] hover:text-[#f85149]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                  placeholder="Add custom feature bullet..."
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  onClick={handleAddFeature}
                  className="px-3 py-1.5 bg-[#21262d] text-white hover:bg-[#30363d] border border-[#30363d] rounded-md text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dual View (Preview / Raw Markdown) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col h-[700px]">
            <div className="p-3 border-b border-[#30363d] bg-[#1c2128] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-md flex items-center space-x-1.5 transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-[#21262d] text-white border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Formatted Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-xs font-medium rounded-md flex items-center space-x-1.5 transition-colors ${
                    viewMode === 'raw'
                      ? 'bg-[#21262d] text-white border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Raw Markdown</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-[#8b949e]">
                {compiledMarkdown.length} characters
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {viewMode === 'raw' ? (
                <textarea
                  readOnly
                  value={compiledMarkdown}
                  className="w-full h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-xs p-4 rounded-md border border-[#30363d] resize-none focus:outline-none"
                />
              ) : (
                <div className="space-y-5 text-sm text-[#c9d1d9] max-w-none prose prose-invert">
                  <div className="border-b border-[#30363d] pb-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{config.projectName}</h1>
                    
                    {/* Live Badges Display */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {config.badges.ci && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#238636] text-white">
                          CI passing
                        </span>
                      )}
                      {config.badges.license && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#1f6feb] text-white">
                          license {config.license}
                        </span>
                      )}
                      {config.badges.react && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#007acc] text-white">
                          React 19
                        </span>
                      )}
                      {config.badges.typescript && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#3178c6] text-white">
                          TypeScript 5
                        </span>
                      )}
                      {config.badges.vite && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#646cff] text-white">
                          Vite 8
                        </span>
                      )}
                      {config.badges.tailwind && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#06b6d4] text-white">
                          Tailwind v4
                        </span>
                      )}
                      {config.badges.prsWelcome && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#238636] text-white">
                          PRs welcome
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-xs text-[#8b949e] border-l-2 border-[#58a6ff] pl-3 italic">
                      {config.tagline}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">✨ Key Features</h2>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#c9d1d9]">
                      {config.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">🛠️ Tech Stack</h2>
                    <ul className="space-y-1 text-xs text-[#c9d1d9]">
                      {config.techStack.map((t, i) => (
                        <li key={i}>
                          <span className="font-semibold text-white">{t.name}:</span>{' '}
                          <span className="text-[#8b949e]">{t.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">🚀 Getting Started</h2>
                    <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d] font-mono text-xs text-[#58a6ff] space-y-1">
                      <p className="text-[#8b949e]"># 1. Clone repository</p>
                      <p>git clone https://github.com/{config.repoOwner}/{config.repoName}.git</p>
                      <p className="text-[#8b949e] pt-1"># 2. Install dependencies</p>
                      <p>{config.installCommand}</p>
                      <p className="text-[#8b949e] pt-1"># 3. Launch dev server</p>
                      <p>{config.devCommand}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">📜 Available Scripts</h2>
                    <div className="border border-[#30363d] rounded-md overflow-hidden text-xs">
                      <table className="w-full divide-y divide-[#30363d]">
                        <thead className="bg-[#1c2128]">
                          <tr>
                            <th className="px-3 py-2 text-left font-mono text-white">Command</th>
                            <th className="px-3 py-2 text-left text-white">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262d] font-mono text-[11px]">
                          <tr>
                            <td className="px-3 py-1.5 text-[#58a6ff]">{config.devCommand}</td>
                            <td className="px-3 py-1.5 text-[#8b949e]">Start Vite development server</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 text-[#58a6ff]">{config.buildCommand}</td>
                            <td className="px-3 py-1.5 text-[#8b949e]">Compile production bundle</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-1.5 text-[#58a6ff]">npm run lint</td>
                            <td className="px-3 py-1.5 text-[#8b949e]">Verify TypeScript types & syntax</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
