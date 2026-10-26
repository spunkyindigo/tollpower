# Contributing Guidelines

Thank you for your interest in contributing to this project! We welcome community contributions, bug reports, and enhancements.

## Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

- Start the dev server:
  ```bash
  npm run dev
  ```
- Verify types and linting:
  ```bash
  npm run lint
  ```
- Test production build:
  ```bash
  npm run build
  ```

## Conventional Commits

We encourage conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `style:` for code formatting changes
- `refactor:` for refactoring code
- `chore:` for tooling and maintenance

## Submitting a Pull Request

1. Ensure all tests and linting pass (`npm run lint && npm run build`).
2. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
3. Open a Pull Request with a clear description of the change.
