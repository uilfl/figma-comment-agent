# Changelog

All notable changes to the "Figma Agent" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-18

### Added
- Initial release of Figma Agent VSCode extension
- Fetch comments from Figma files via Figma API
- Process and filter Figma comments (exclude resolved comments)
- Generate development prompts from comments using OpenAI (GPT-4, GPT-3.5-turbo, GPT-4-turbo)
- Export prompts to multiple formats (JSON, CSV, TXT)
- Configurable OpenAI model selection
- Comprehensive error handling with retry logic
- VSCode sidebar integration
- Secure API token storage
- AES-256 encryption for sensitive data

### Configuration
- `figmaAgent.apiToken` - Figma API Token
- `figmaAgent.openaiApiKey` - OpenAI API Key
- `figmaAgent.openaiModel` - OpenAI model to use (default: gpt-4)
- `figmaAgent.exportFormat` - Default export format (json, csv, txt)

### Commands
- `Fetch Figma Comments` - Fetch comments from a Figma file
- `Generate Development Prompts` - Generate AI-powered development tasks from comments
- `Export Prompts` - Export generated prompts to a file

## [Unreleased]

### Planned
- Enhanced comment filtering options
- Custom prompt templates
- Integration with issue tracking systems
- Real-time comment synchronization
- Comment status tracking
