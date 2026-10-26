# 🚀 GitHub Ready — Repository Preparation & Publishing Studio

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
- 📋 **GitHub Issue Forms & PR Templates**: Modern GitHub YAML issue forms (`bug_report.yml`, `feature_request.yml`) and structured pull request checklists.
- 🔒 **Secrets & Sensitive File Detector**: Pre-push scanner to prevent accidental leaks of API tokens, private keys, `.env` files, or unignored credential artifacts.
- 💻 **Git Terminal Guide & GitHub CLI Helper**: Interactive terminal command generator (`git init`, branch rename, remote configuration, SSH/HTTPS toggling, first commit, and `gh repo create` commands).
- 📦 **One-Click Export**: Download single files or an entire `.zip` bundle containing complete repository assets ready to drop into any project.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Packaging**: JSZip client-side bundle generation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/github-ready.git
   cd github-ready
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with hot reload |
| `npm run build` | Builds optimized production bundle into `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans build artifacts and caches |

---

## 🤝 Contributing

Contributions are always welcome! Check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started and review our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for more information.
