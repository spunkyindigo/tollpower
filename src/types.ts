export interface AuditCheck {
  id: string;
  name: string;
  category: 'documentation' | 'governance' | 'automation' | 'security';
  description: string;
  importance: 'critical' | 'recommended' | 'optional';
  status: 'passed' | 'warning' | 'missing';
  filePath: string;
  fixGuide: string;
}

export interface LicenseItem {
  id: string;
  name: string;
  spdxId: string;
  tagline: string;
  popular: boolean;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  template: (year: number, holder: string) => string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  recommendedFilename: string;
  generateYaml: (config: {
    nodeVersions: string[];
    packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
    branches: string[];
  }) => string;
}

export interface ReadmeConfig {
  projectName: string;
  tagline: string;
  repoOwner: string;
  repoName: string;
  license: string;
  badges: {
    ci: boolean;
    license: boolean;
    react: boolean;
    typescript: boolean;
    vite: boolean;
    tailwind: boolean;
    prsWelcome: boolean;
  };
  features: string[];
  techStack: { name: string; desc: string }[];
  installCommand: string;
  devCommand: string;
  buildCommand: string;
  includeContributing: boolean;
  includeLicense: boolean;
}

export interface SecretLeakMatch {
  rule: string;
  severity: 'critical' | 'high' | 'medium';
  match: string;
  line: number;
  snippet: string;
  recommendation: string;
}
