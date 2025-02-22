# Figma Agent VSCode Extension

A VSCode extension that helps developers process Figma comments and generate development tasks automatically.

## Features

- 🔄 Fetch comments from Figma files
- 🤖 Generate actionable development prompts from comments using AI
- 📝 Export prompts in multiple formats (JSON, CSV, TXT)
- 🎯 Track comment status and priorities
- ⚡ Integrated sidebar for easy access

## Installation

1. Install the extension from VSCode Marketplace
2. Configure your Figma API token in VSCode settings
3. Restart VSCode

## Configuration

### Required Settings

- `figmaAgent.apiToken`: Your Figma API access token
  - Get it from Figma > Help and Account > Account Settings > Access Tokens

### Optional Settings

- `figmaAgent.exportFormat`: Preferred export format
  - Options: `json` (default), `csv`, `txt`

## Usage

### Via Command Palette (Ctrl/Cmd + Shift + P)

- `Figma Agent: Fetch Comments` - Fetch comments from a Figma file
- `Figma Agent: Generate Prompts` - Convert comments to development prompts
- `Figma Agent: Export File` - Export prompts to a file

### Via Sidebar

1. Click the Figma Agent icon in the activity bar
2. Use the sidebar buttons to:
   - View fetched comments
   - Generate prompts
   - Export results

## Error Handling

The extension provides:

- Detailed error messages with suggested actions
- Automatic retry for transient failures
- Error logs accessible via "Show Error Log" option
- Fallback options when operations fail

## Troubleshooting

Common issues and solutions:

1. **Invalid API Token**

   - Verify your token in VSCode settings
   - Ensure token has necessary permissions

2. **Network Issues**

   - Check your internet connection
   - Verify firewall settings

3. **Export Failures**
   - Ensure write permissions for target directory
   - Check available disk space

## Development

### Setup

```bash
git clone https://github.com/yourusername/figma-agent.git
cd figma-agent
npm install
```

### Build

```bash
npm run compile
```

### Test

```bash
npm run test
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and feature requests, please use the GitHub Issues page.

### Donate me for more people to join this project ! 


**Support me on Buy Me a Coffee**
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](buymeacoffee.com/ricchen)
