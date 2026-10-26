import { ReadmeConfig } from '../types';

export const README_PRESETS: Record<string, ReadmeConfig> = {
  'react-vite': {
    projectName: 'My Modern React App',
    tagline: 'High-performance React application powered by Vite, TypeScript, and Tailwind CSS.',
    repoOwner: 'octocat',
    repoName: 'my-react-app',
    license: 'Apache-2.0',
    badges: {
      ci: true,
      license: true,
      react: true,
      typescript: true,
      vite: true,
      tailwind: true,
      prsWelcome: true,
    },
    features: [
      '⚡ Lightning fast development with Vite HMR',
      '💎 Full TypeScript safety and type inference',
      '🎨 Modern, responsive styling with Tailwind CSS',
      '🛡️ Production-ready build and minification pipeline',
      '📦 Modular component structure and clean architecture'
    ],
    techStack: [
      { name: 'React 19', desc: 'Frontend UI library' },
      { name: 'TypeScript', desc: 'Typed JavaScript' },
      { name: 'Vite', desc: 'Next-generation frontend tooling' },
      { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
      { name: 'Lucide React', desc: 'Crisp vector icon suite' }
    ],
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    includeContributing: true,
    includeLicense: true
  },
  'full-stack': {
    projectName: 'Full-Stack Express & React Suite',
    tagline: 'End-to-end full-stack web application with Node/Express backend and React UI.',
    repoOwner: 'octocat',
    repoName: 'fullstack-suite',
    license: 'MIT',
    badges: {
      ci: true,
      license: true,
      react: true,
      typescript: true,
      vite: true,
      tailwind: true,
      prsWelcome: true,
    },
    features: [
      '🚀 Unified client and server development workflow',
      '🔒 Secure REST API proxy and backend controllers',
      '🌐 Seamless client-side routing and state handling',
      '🛠️ Automated linting, type checks, and build validations'
    ],
    techStack: [
      { name: 'Express', desc: 'Fast, minimalist Node.js web server' },
      { name: 'React', desc: 'Client frontend interface' },
      { name: 'TypeScript', desc: 'Type safety across backend and frontend' },
      { name: 'Tailwind CSS', desc: 'Design system styling' }
    ],
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    includeContributing: true,
    includeLicense: true
  },
  'ai-gemini': {
    projectName: 'Gemini AI Assistant & Agent Studio',
    tagline: 'Intelligent workflow studio built with Google Gemini GenAI SDK and modern web standards.',
    repoOwner: 'spunkyindigo',
    repoName: 'gemini-agent-studio',
    license: 'Apache-2.0',
    badges: {
      ci: true,
      license: true,
      react: true,
      typescript: true,
      vite: true,
      tailwind: true,
      prsWelcome: true,
    },
    features: [
      '🧠 Powered by latest Google GenAI SDK (@google/genai)',
      '⚡ Server-side API key proxy protection without client leaks',
      '💬 Streaming responses, tool calls, and structured output',
      '📱 Responsive developer dashboard with real-time feedback'
    ],
    techStack: [
      { name: '@google/genai', desc: 'Official Google Gen AI TypeScript SDK' },
      { name: 'React 19', desc: 'Reactive user interface' },
      { name: 'Tailwind CSS', desc: 'Clean, modern typography and dark layout' }
    ],
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    includeContributing: true,
    includeLicense: true
  }
};

export function compileReadme(config: ReadmeConfig): string {
  const badgesList: string[] = [];

  if (config.badges.ci) {
    badgesList.push(`[![CI](https://github.com/${config.repoOwner}/${config.repoName}/actions/workflows/ci.yml/badge.svg)](https://github.com/${config.repoOwner}/${config.repoName})`);
  }
  if (config.badges.license) {
    badgesList.push(`[![License](https://img.shields.io/badge/License-${config.license.replace('-', '_')}-blue.svg)](LICENSE)`);
  }
  if (config.badges.react) {
    badgesList.push(`[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev)`);
  }
  if (config.badges.typescript) {
    badgesList.push(`[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)`);
  }
  if (config.badges.vite) {
    badgesList.push(`[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)`);
  }
  if (config.badges.tailwind) {
    badgesList.push(`[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)`);
  }
  if (config.badges.prsWelcome) {
    badgesList.push(`[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)`);
  }

  const badgesBlock = badgesList.length > 0 ? badgesList.join('\n') + '\n\n' : '';

  const featuresBlock = config.features.map(f => `- ${f}`).join('\n');

  const techStackBlock = config.techStack
    .map(t => `- **${t.name}**: ${t.desc}`)
    .join('\n');

  let markdown = `# ${config.projectName}\n\n`;
  if (badgesBlock) markdown += `${badgesBlock}`;
  markdown += `> ${config.tagline}\n\n---\n\n`;
  markdown += `## ✨ Key Features\n\n${featuresBlock}\n\n---\n\n`;
  markdown += `## 🛠️ Tech Stack\n\n${techStackBlock}\n\n---\n\n`;
  markdown += `## 🚀 Getting Started\n\n### Prerequisites\n- Node.js 20.x or higher\n- npm, pnpm, or yarn\n\n`;
  markdown += `### Installation\n\n\`\`\`bash\n# 1. Clone the repository\ngit clone https://github.com/${config.repoOwner}/${config.repoName}.git\n\n# 2. Navigate to project root\ncd ${config.repoName}\n\n# 3. Install dependencies\n${config.installCommand}\n\n# 4. Start local development\n${config.devCommand}\n\`\`\`\n\n---\n\n`;
  markdown += `## 📜 Available Scripts\n\n| Command | Description |\n| :--- | :--- |\n| \`${config.devCommand}\` | Starts dev server on local port |\n| \`${config.buildCommand}\` | Compiles production bundle |\n| \`npm run lint\` | Runs static type checks and verification |\n\n`;

  if (config.includeContributing) {
    markdown += `---\n\n## 🤝 Contributing\n\nContributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.\n\n`;
  }

  if (config.includeLicense) {
    markdown += `---\n\n## 📄 License\n\nDistributed under the ${config.license} License. See [LICENSE](LICENSE) for details.\n`;
  }

  return markdown;
}
