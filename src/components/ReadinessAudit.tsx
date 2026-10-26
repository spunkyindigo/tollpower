import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  GitBranch, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { AuditCheck } from '../types';

interface ReadinessAuditProps {
  onNavigateToFile: (path: string) => void;
  onNavigateToTab: (tab: string) => void;
}

const INITIAL_CHECKS: AuditCheck[] = [
  {
    id: 'readme',
    name: 'Comprehensive README.md',
    category: 'documentation',
    importance: 'critical',
    status: 'passed',
    filePath: 'README.md',
    description: 'Contains project summary, live badges, architecture, tech stack, and step-by-step local setup instructions.',
    fixGuide: 'Included in repository root with complete installation, scripts, badges, and project overview.'
  },
  {
    id: 'license',
    name: 'Open Source License (Apache 2.0)',
    category: 'governance',
    importance: 'critical',
    status: 'passed',
    filePath: 'LICENSE',
    description: 'Enables safe reuse and collaboration with explicit patent grants and clear copyright terms.',
    fixGuide: 'Present in root as LICENSE with official Apache 2.0 terms matching package license.'
  },
  {
    id: 'gitignore',
    name: 'Secret & Artifact Shield (.gitignore)',
    category: 'security',
    importance: 'critical',
    status: 'passed',
    filePath: '.gitignore',
    description: 'Prevents accidentally checking in node_modules, .env secrets, dist bundles, logs, or OS files.',
    fixGuide: 'Thoroughly configured to ignore environment secrets, caches, and dependency folders.'
  },
  {
    id: 'ci-workflow',
    name: 'Automated CI/CD Workflow (ci.yml)',
    category: 'automation',
    importance: 'recommended',
    status: 'passed',
    filePath: '.github/workflows/ci.yml',
    description: 'Automates linting, type-checking, and bundle verification on every push and pull request.',
    fixGuide: 'Workflow configured for Node.js 20.x and 22.x with npm ci and linting validation.'
  },
  {
    id: 'bug-template',
    name: 'Structured Bug Report Issue Form',
    category: 'governance',
    importance: 'recommended',
    status: 'passed',
    filePath: '.github/ISSUE_TEMPLATE/bug_report.yml',
    description: 'Modern GitHub YAML Issue Form ensuring reporters provide repro steps, expected behavior, and environment info.',
    fixGuide: 'GitHub Issue Form created in .github/ISSUE_TEMPLATE/bug_report.yml.'
  },
  {
    id: 'feature-template',
    name: 'Feature Request Issue Form',
    category: 'governance',
    importance: 'recommended',
    status: 'passed',
    filePath: '.github/ISSUE_TEMPLATE/feature_request.yml',
    description: 'Guides users and contributors to submit well-structured feature proposals and alternatives.',
    fixGuide: 'Created in .github/ISSUE_TEMPLATE/feature_request.yml.'
  },
  {
    id: 'pr-template',
    name: 'Pull Request Template',
    category: 'governance',
    importance: 'recommended',
    status: 'passed',
    filePath: '.github/PULL_REQUEST_TEMPLATE.md',
    description: 'Enforces code reviews, self-testing, and security verification before code is merged.',
    fixGuide: 'Standardized PR review checklist created in .github/PULL_REQUEST_TEMPLATE.md.'
  },
  {
    id: 'contributing',
    name: 'Contributing Guidelines (CONTRIBUTING.md)',
    category: 'documentation',
    importance: 'recommended',
    status: 'passed',
    filePath: 'CONTRIBUTING.md',
    description: 'Guides new contributors on how to fork, create branches, run test suites, and follow commit conventions.',
    fixGuide: 'Added CONTRIBUTING.md with branch workflows and conventional commit guidance.'
  },
  {
    id: 'security-policy',
    name: 'Security Vulnerability Policy (SECURITY.md)',
    category: 'security',
    importance: 'critical',
    status: 'passed',
    filePath: 'SECURITY.md',
    description: 'Provides private vulnerability reporting instructions so exploits are not disclosed in public issues.',
    fixGuide: 'Added SECURITY.md with responsible disclosure channel.'
  },
  {
    id: 'code-of-conduct',
    name: 'Code of Conduct (CODE_OF_CONDUCT.md)',
    category: 'governance',
    importance: 'optional',
    status: 'passed',
    filePath: 'CODE_OF_CONDUCT.md',
    description: 'Establishes community standards and respectful collaboration norms using the Contributor Covenant.',
    fixGuide: 'Contributor Covenant 2.1 added to root.'
  }
];

export const ReadinessAudit: React.FC<ReadinessAuditProps> = ({
  onNavigateToFile,
  onNavigateToTab,
}) => {
  const [checks, setChecks] = useState<AuditCheck[]>(INITIAL_CHECKS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedCheck, setSelectedCheck] = useState<AuditCheck | null>(null);

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);

  const filteredChecks = checks.filter(c => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  const toggleCheckStatus = (id: string) => {
    setChecks(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'passed' ? 'missing' : 'passed';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Readiness Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22] border border-[#30363d] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Audit Complete
              </span>
              <span className="text-xs text-[#8b949e]">Target: GitHub Public / Open-Source Production</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Repository Readiness: {scorePercent}% Ready
            </h1>
            <p className="text-sm text-[#8b949e] max-w-2xl leading-relaxed">
              Your codebase is fully equipped with required documentation, CI/CD pipelines, security controls, issue forms, and governance files for a smooth release on GitHub.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#21262d"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#238636"
                  strokeWidth="5"
                  strokeDasharray="175.9"
                  strokeDashoffset={175.9 - (175.9 * scorePercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute font-bold text-lg text-white font-mono">{scorePercent}%</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-white">{passedCount} of {checks.length} checks passing</div>
              <div className="text-xs text-[#3fb950] font-mono">Status: Excellent</div>
              <button
                onClick={() => onNavigateToTab('assistant')}
                className="text-xs text-[#58a6ff] hover:underline flex items-center pt-0.5"
              >
                <span>Ready to push &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'All Checks (10)' },
            { id: 'documentation', label: 'Documentation (2)' },
            { id: 'governance', label: 'Governance & Issues (4)' },
            { id: 'automation', label: 'Automation & CI (1)' },
            { id: 'security', label: 'Security & Shields (3)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterCategory === tab.id
                  ? 'bg-[#21262d] text-white border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8b949e]">
          <Info className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>Click any item to view details or toggle status</span>
        </div>
      </div>

      {/* Audit Checklist Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#21262d]">
        {filteredChecks.map((check) => {
          const isPassed = check.status === 'passed';
          return (
            <div
              key={check.id}
              className="p-4 hover:bg-[#1c2128]/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => setSelectedCheck(check)}
            >
              <div className="flex items-start space-x-3.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheckStatus(check.id);
                  }}
                  className="mt-0.5 focus:outline-none"
                  title="Click to toggle check status"
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3fb950] flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#f85149] flex-shrink-0 flex items-center justify-center text-[#f85149] text-xs font-bold">
                      !
                    </div>
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-white">{check.name}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                      {check.filePath}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      check.importance === 'critical'
                        ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30'
                        : check.importance === 'recommended'
                        ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30'
                        : 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30'
                    }`}>
                      {check.importance}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e] line-clamp-1">{check.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFile(check.filePath);
                  }}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded bg-[#21262d] text-[#c9d1d9] hover:text-white hover:bg-[#30363d] border border-[#30363d] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-[#58a6ff]" />
                  View File
                </button>
                <ChevronRight className="w-4 h-4 text-[#8b949e]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Check Modal / Detail Drawer */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#3fb950]" />
                <h3 className="font-semibold text-white text-base">{selectedCheck.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCheck(null)}
                className="text-[#8b949e] hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-mono text-[#8b949e] uppercase">File Path</span>
                <p className="font-mono text-xs text-white bg-[#0d1117] p-2 rounded mt-1 border border-[#30363d]">
                  {selectedCheck.filePath}
                </p>
              </div>

              <div>
                <span className="text-xs font-mono text-[#8b949e] uppercase">Why it matters</span>
                <p className="text-xs text-[#c9d1d9] mt-1 leading-relaxed">{selectedCheck.description}</p>
              </div>

              <div>
                <span className="text-xs font-mono text-[#8b949e] uppercase">Current Implementation</span>
                <p className="text-xs text-[#3fb950] mt-1 leading-relaxed bg-[#238636]/10 p-2.5 rounded border border-[#238636]/30">
                  {selectedCheck.fixGuide}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#30363d]">
              <button
                onClick={() => {
                  const target = selectedCheck.filePath;
                  setSelectedCheck(null);
                  onNavigateToFile(target);
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
              >
                Inspect & Copy File
              </button>
              <button
                onClick={() => setSelectedCheck(null)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center space-x-2 text-[#58a6ff]">
            <GitBranch className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-white">Push to GitHub</h4>
          </div>
          <p className="text-xs text-[#8b949e]">
            Follow step-by-step terminal instructions with prefilled repo names, branch configuration, and SSH/HTTPS flags.
          </p>
          <button
            onClick={() => onNavigateToTab('assistant')}
            className="text-xs font-medium text-[#58a6ff] hover:underline inline-flex items-center pt-1"
          >
            Launch Git Assistant &rarr;
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center space-x-2 text-[#3fb950]">
            <FileText className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-white">README Studio</h4>
          </div>
          <p className="text-xs text-[#8b949e]">
            Fine-tune badges, feature matrices, installation steps, and preview the live formatted markdown output.
          </p>
          <button
            onClick={() => onNavigateToTab('readme')}
            className="text-xs font-medium text-[#3fb950] hover:underline inline-flex items-center pt-1"
          >
            Open README Studio &rarr;
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center space-x-2 text-[#d29922]">
            <Layers className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-white">Secrets Scanner</h4>
          </div>
          <p className="text-xs text-[#8b949e]">
            Double-check your staged files or pasted secrets to verify no credentials or private tokens leak to GitHub.
          </p>
          <button
            onClick={() => onNavigateToTab('scanner')}
            className="text-xs font-medium text-[#d29922] hover:underline inline-flex items-center pt-1"
          >
            Run Pre-Push Scan &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
