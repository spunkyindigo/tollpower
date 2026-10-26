import { WorkflowTemplate } from '../types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'ci-matrix',
    title: 'Node.js Multi-Version CI',
    category: 'Testing & Build',
    recommendedFilename: '.github/workflows/ci.yml',
    description: 'Runs linting and build checks across multiple Node.js versions on every push and pull request.',
    generateYaml: ({ nodeVersions, packageManager, branches }) => {
      const installCmd = packageManager === 'npm' ? 'npm ci' : `${packageManager} install --frozen-lockfile`;
      const runCmd = packageManager === 'npm' ? 'npm run' : packageManager;
      const matrixStr = nodeVersions.map(v => `'${v}'`).join(', ');
      const branchesStr = branches.map(b => `"${b}"`).join(', ');

      return `name: Continuous Integration

on:
  push:
    branches: [ ${branchesStr} ]
  pull_request:
    branches: [ ${branchesStr} ]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  test-and-build:
    name: Node \${{ matrix.node-version }} (${packageManager})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [ ${matrixStr} ]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: '${packageManager === 'bun' ? 'npm' : packageManager}'

      - name: Install dependencies
        run: ${installCmd}

      - name: Run linter & type checks
        run: ${runCmd} lint

      - name: Build production bundle
        run: ${runCmd} build
`;
    }
  },
  {
    id: 'github-pages',
    title: 'Deploy to GitHub Pages',
    category: 'Deployment',
    recommendedFilename: '.github/workflows/deploy-pages.yml',
    description: 'Builds static SPA assets and deploys them automatically to GitHub Pages on pushes to the main branch.',
    generateYaml: ({ packageManager, branches }) => {
      const mainBranch = branches[0] || 'main';
      const installCmd = packageManager === 'npm' ? 'npm ci' : `${packageManager} install`;
      const buildCmd = packageManager === 'npm' ? 'npm run build' : `${packageManager} build`;

      return `name: Deploy to GitHub Pages

on:
  push:
    branches: [ "${mainBranch}" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: '${packageManager === 'bun' ? 'npm' : packageManager}'

      - name: Install dependencies
        run: ${installCmd}

      - name: Build site
        run: ${buildCmd}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
    }
  },
  {
    id: 'release-drafter',
    title: 'Automated Release Drafter',
    category: 'Releases & Changelog',
    recommendedFilename: '.github/workflows/release-drafter.yml',
    description: 'Automatically drafts GitHub releases based on merged pull requests with categorized changelogs.',
    generateYaml: () => `name: Release Drafter

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, reopened, synchronize]

permissions:
  contents: write
  pull-requests: read

jobs:
  update_release_draft:
    runs-on: ubuntu-latest
    steps:
      - name: Draft Release
        uses: release-drafter/release-drafter@v6
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
  },
  {
    id: 'security-codeql',
    title: 'CodeQL Security Analysis',
    category: 'Security',
    recommendedFilename: '.github/workflows/codeql-analysis.yml',
    description: 'Scans JavaScript and TypeScript code for common vulnerabilities, injection flaws, and security hotspots.',
    generateYaml: ({ branches }) => {
      const branchesStr = branches.map(b => `"${b}"`).join(', ');
      return `name: "CodeQL Analysis"

on:
  push:
    branches: [ ${branchesStr} ]
  pull_request:
    branches: [ ${branchesStr} ]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
`;
    }
  }
];
