# Contributing to Expo React Native CI/CD Builder

Thanks for your interest in contributing! This project helps React Native developers save money on CI/CD — every contribution makes a difference.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/expo-react-native-cicd.git`
3. Install dependencies: `cd webapp && yarn install --frozen-lockfile`
4. Create a branch: `git checkout -b feat/your-feature`

## Development

```bash
cd webapp
yarn dev          # Start dev server on localhost:3000
yarn test         # Run tests
yarn lint         # Lint code
yarn type-check   # TypeScript checks
yarn prettier:check  # Check formatting
```

## What to Contribute

- **Bug fixes** — Check [open issues](https://github.com/TanayK07/expo-react-native-cicd/issues)
- **New storage providers** — Add support for more cloud storage options
- **Package manager support** — Improve yarn/npm/pnpm workflows
- **Documentation** — Fix typos, improve guides, add examples
- **Tests** — Increase coverage, add edge cases

## Pull Request Process

1. Ensure your code passes all checks: `yarn lint && yarn type-check && yarn test`
2. Format your code: `yarn prettier --write .`
3. Write a clear PR description explaining **what** and **why**
4. Link any related issues using `Fixes #123` or `Closes #123`
5. Keep PRs focused — one feature or fix per PR

## Code Style

- TypeScript for all webapp code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Add tests for new functionality

## Reporting Bugs

Use the [bug report template](https://github.com/TanayK07/expo-react-native-cicd/issues/new?template=bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, package manager)
- Generated workflow file (if applicable)

## Questions?

Open a [Discussion](https://github.com/TanayK07/expo-react-native-cicd/discussions) for questions, ideas, or general chat.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
