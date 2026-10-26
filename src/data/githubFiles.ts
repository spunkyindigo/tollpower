export interface ProjectFile {
  path: string;
  name: string;
  category: 'core' | 'automation' | 'community' | 'security';
  description: string;
  content: string;
}

export const GITHUB_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'README.md',
    name: 'README.md',
    category: 'core',
    description: 'Repository overview, quickstart instructions, badges, architecture, and guides.',
    content: `# 🚀 GitHub Ready — Repository Preparation & Publishing Studio

[![CI](https://github.com/spunkyindigo/github-ready/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> Comprehensive toolkit to audit, generate, configure, and publish production-grade GitHub repository assets in seconds.

---

## ✨ Features

- 🛡️ **Repository Health & Readiness Audit**: Real-time evaluation of essential repository assets (README, License, CI/CD, Gitignore, Sensitive Files Scanner, Issue Templates, PR Checklist).
- 📝 **Interactive README Studio**: Rich markdown composer with live formatted preview, badge picker, tech stack icons, feature grids, and one-click copy/download.
- ⚖️ **License Matrix & Generator**: Interactive comparison between MIT, Apache 2.0, GPL v3, BSD 3-Clause, ISC, and Unlicense with permissions/conditions/limitations breakdown.
- ⚡ **GitHub Actions CI/CD Generator**: Ready-to-commit workflow recipes for Node.js test & build, GitHub Pages automated deployment, Docker builds, and Release drafters.
- 📋 **GitHub Issue Forms & PR Templates**: Modern GitHub YAML issue forms (bug_report.yml, feature_request.yml) and structured pull request checklists.
- 🔒 **Secrets & Sensitive File Detector**: Pre-push scanner to prevent accidental leaks of API tokens, private keys, .env files, or unignored credential artifacts.
- 💻 **Git Terminal Guide & GitHub CLI Helper**: Interactive terminal command generator (git init, branch rename, remote configuration, SSH/HTTPS toggling, first commit, and gh repo create commands).
- 📦 **One-Click Export**: Download single files or an entire .zip bundle containing complete repository assets ready to drop into any project.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Packaging**: JSZip client-side bundle generation

---

## 🚀 Quick Start

### Installation

\`\`\`bash
git clone https://github.com/<your-username>/github-ready.git
cd github-ready
npm install
npm run dev
\`\`\`

Open \`http://localhost:3000\` in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| \`npm run dev\` | Starts Vite dev server with hot reload |
| \`npm run build\` | Builds optimized production bundle into \`dist/\` |
| \`npm run preview\` | Previews production build locally |
| \`npm run lint\` | Runs TypeScript type checking (\`tsc --noEmit\`) |
| \`npm run clean\` | Cleans build artifacts and caches |

---

## 📄 License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more information.
`
  },
  {
    path: 'LICENSE',
    name: 'LICENSE',
    category: 'core',
    description: 'Apache License 2.0 open-source legal terms and patent grants.',
    content: `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.
      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.
      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

   2. Grant of Copyright License.
      Subject to the terms and conditions of this License, each Contributor
      hereby grants to You a perpetual, worldwide, non-exclusive, no-charge,
      royalty-free, irrevocable copyright license to reproduce, prepare
      Derivative Works of, publicly display, publicly perform, sublicense,
      and distribute the Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License.
      Subject to the terms and conditions of this License, each Contributor
      hereby grants to You a perpetual, worldwide, non-exclusive, no-charge,
      royalty-free, irrevocable patent license to make, have made, use, offer
      to sell, sell, import, and otherwise transfer the Work.

   4. Redistribution.
      You may reproduce and distribute copies of the Work or Derivative Works
      thereof in any medium, with or without modifications, provided that You
      give recipients a copy of this License and retain copyright notices.

   7. Disclaimer of Warranty.
      Unless required by applicable law, Licensor provides the Work on an
      "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
`
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    category: 'core',
    description: 'Git ignore rules preventing commit of node_modules, build artifacts, env secrets, and system files.',
    content: `# Dependency directories
node_modules/
jspm_packages/

# Production build artifacts
dist/
dist-ssr/
build/
*.local

# Environment variables
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local
!.env.example

# Logs and runtime data
*.log
npm-debug.log*
yarn-debug.log*

# Testing & coverage
coverage/
*.lcov

# AI Studio and local tooling cache
.aistudio/
.cache/
.vite/

# Editor directories
.DS_Store
.idea/
.vscode/*
!.vscode/extensions.json
`
  },
  {
    path: '.github/workflows/ci.yml',
    name: '.github/workflows/ci.yml',
    category: 'automation',
    description: 'GitHub Actions Continuous Integration workflow testing typecheck and production build on pull requests and pushes.',
    content: `name: CI / Build & Typecheck

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    name: Lint & Build Verification
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Typecheck / Lint
        run: npm run lint

      - name: Build production bundle
        run: npm run build
`
  },
  {
    path: '.github/ISSUE_TEMPLATE/bug_report.yml',
    name: '.github/ISSUE_TEMPLATE/bug_report.yml',
    category: 'community',
    description: 'GitHub Issue Form for structured, actionable bug submissions.',
    content: `name: 🐛 Bug Report
description: File a bug report to help us improve the application
title: "[Bug]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report an issue! Please check existing issues first before submitting.
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: When I click the generate button...
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: How can maintainers reproduce this behavior?
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen instead?
    validations:
      required: true
  - type: dropdown
    id: environment
    attributes:
      label: Browser / OS
      options:
        - Chrome / Chromium (Desktop)
        - Firefox (Desktop)
        - Safari (macOS / iOS)
        - Edge (Desktop)
        - Mobile Browser (Android / iOS)
        - Other
    validations:
      required: true
`
  },
  {
    path: '.github/ISSUE_TEMPLATE/feature_request.yml',
    name: '.github/ISSUE_TEMPLATE/feature_request.yml',
    category: 'community',
    description: 'GitHub Issue Form for structured feature enhancement ideas.',
    content: `name: 💡 Feature Request
description: Suggest an idea or feature enhancement for this project
title: "[Feature]: "
labels: ["enhancement", "feature"]
body:
  - type: markdown
    attributes:
      value: |
        We welcome feature ideas and suggestions!
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear and concise description of what the problem is.
      placeholder: I'm always frustrated when...
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear and concise description of what you want to happen.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: Any alternative solutions or features you've considered.
`
  },
  {
    path: '.github/PULL_REQUEST_TEMPLATE.md',
    name: '.github/PULL_REQUEST_TEMPLATE.md',
    category: 'community',
    description: 'Pull request template enforcing description, change categorization, and review checklists.',
    content: `## Description
A clear and concise summary of the changes proposed in this Pull Request.

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] ⚡ Performance improvement
- [ ] 📝 Documentation update
- [ ] 🎨 Code style or refactoring (no functional changes)
- [ ] 🧪 Tests addition or improvement

## Checklist
- [ ] My code adheres to the project's code style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have tested changes locally (npm run lint and npm run build pass)
- [ ] No secrets or sensitive environment tokens are committed
`
  },
  {
    path: 'CONTRIBUTING.md',
    name: 'CONTRIBUTING.md',
    category: 'community',
    description: 'Guide for contributors explaining fork, branch, test, and PR workflow.',
    content: `# Contributing Guidelines

Thank you for your interest in contributing to this project!

## Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   \`\`\`bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   \`\`\`
3. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
4. **Create a Feature Branch**:
   \`\`\`bash
   git checkout -b feat/your-feature-name
   \`\`\`

## Development Workflow

- Start dev server: \`npm run dev\`
- Verify types and linting: \`npm run lint\`
- Test production build: \`npm run build\`

## Conventional Commits

- \`feat:\` for new features
- \`fix:\` for bug fixes
- \`docs:\` for documentation updates
- \`refactor:\` for refactoring code
- \`chore:\` for tooling and maintenance
`
  },
  {
    path: 'SECURITY.md',
    name: 'SECURITY.md',
    category: 'security',
    description: 'Security policy detailing supported versions and private vulnerability reporting.',
    content: `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please **do not** report it publicly via GitHub Issues.

Instead, please send an email with the vulnerability details, proof-of-concept, and severity assessment to:
**security@example.com**

We take security issues seriously and will respond promptly to investigate and patch reported concerns.
`
  },
  {
    path: 'CODE_OF_CONDUCT.md',
    name: 'CODE_OF_CONDUCT.md',
    category: 'community',
    description: 'Contributor Covenant Code of Conduct for inclusive collaboration.',
    content: `# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

## Our Standards

Examples of behavior that contributes to a positive environment:
* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes
`
  }
];
