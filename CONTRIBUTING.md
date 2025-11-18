# Contributing to Figma Agent

Thank you for your interest in contributing to Figma Agent! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- VSCode (for testing the extension)
- Git

### Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/uilfl/figma-comment-agent.git
cd figma-comment-agent
```

2. Install dependencies:
```bash
npm install --ignore-scripts
```

3. Copy the example environment file and configure it:
```bash
cp .env.example .env
```

4. Build the project:
```bash
npm run compile
```

5. Run tests:
```bash
npm test
```

## Development Workflow

### Project Structure

```
figma-comment-agent/
├── src/
│   ├── api/           # Figma API client
│   ├── extension/     # VSCode extension code
│   ├── services/      # Business logic services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── test/          # Test files
├── resources/         # Extension resources (icons, etc.)
└── dist/             # Compiled output (generated)
```

### Coding Standards

- **TypeScript**: All code must be written in TypeScript
- **Linting**: Run `npm run lint` before committing
- **Testing**: Write tests for new features
- **Formatting**: Use consistent formatting (2 spaces for indentation)

### Logger Usage

- Use `FigmaAgentLogger` (from `extension/logger.ts`) for VSCode extension code
- Use `Logger` (from `utils/logger.ts`) for pure TypeScript services

### Making Changes

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and ensure:
   - Code compiles: `npm run compile`
   - Tests pass: `npm test`
   - Linting passes: `npm run lint`

3. Commit your changes:
```bash
git add .
git commit -m "Description of your changes"
```

4. Push to your fork:
```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request

### Testing Your Changes

To test the extension in VSCode:

1. Open the project in VSCode
2. Press F5 to launch Extension Development Host
3. Test your changes in the new VSCode window

## Pull Request Guidelines

- **Description**: Provide a clear description of the changes
- **Tests**: Include tests for new features
- **Documentation**: Update documentation if needed
- **Changelog**: Add an entry to CHANGELOG.md under [Unreleased]
- **Single Purpose**: Keep PRs focused on a single feature or fix

## Reporting Issues

When reporting issues, please include:

- VSCode version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Describe the feature and its use case
3. Explain why it would be valuable

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
