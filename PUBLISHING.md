# Publishing Figma Agent to the VS Code Marketplace

This document provides step-by-step instructions for publishing the Figma Agent extension to the Visual Studio Code Marketplace.

## Prerequisites

1. **Microsoft Account**: You need a Microsoft account to access the Visual Studio Marketplace
2. **Azure DevOps Organization**: Required for publishing extensions
3. **Personal Access Token (PAT)**: For authentication with the marketplace

## Setup Steps

### 1. Create a Publisher Account

1. Go to the [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Click "Create publisher"
4. Fill in the required information:
   - **Publisher ID**: This will be your publisher name (e.g., "figma-agent")
   - **Display Name**: Public display name
   - **Description**: Brief description of your publisher profile
5. Click "Create"

### 2. Generate a Personal Access Token

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account
3. Click on your profile icon (top right) → User settings → Personal access tokens
4. Click "New Token"
5. Configure the token:
   - **Name**: "VSCode Marketplace"
   - **Organization**: All accessible organizations
   - **Expiration**: Choose appropriate duration (90 days, 1 year, custom)
   - **Scopes**: Select "Custom defined" and check:
     - **Marketplace**: Acquire, Manage, Publish
6. Click "Create" and **copy the token immediately** (you won't be able to see it again)

### 3. Update package.json

Ensure your `package.json` has the correct publisher name:

```json
{
  "publisher": "your-publisher-id",
  ...
}
```

Replace `"figma-agent"` with your actual publisher ID from step 1.

### 4. Login to vsce

```bash
npx vsce login your-publisher-id
```

When prompted, paste your Personal Access Token.

## Publishing the Extension

### First-Time Publishing

1. Ensure all code is committed and pushed to GitHub
2. Build and test the extension:
   ```bash
   npm install --ignore-scripts
   npm run compile
   npm test
   npm run lint
   ```

3. Package the extension (verify it works):
   ```bash
   npx vsce package
   ```

4. Publish to the marketplace:
   ```bash
   npx vsce publish
   ```

### Publishing Updates

1. Update the version in `package.json` (follow [Semantic Versioning](https://semver.org/)):
   - **Patch** (1.0.x): Bug fixes
   - **Minor** (1.x.0): New features (backwards compatible)
   - **Major** (x.0.0): Breaking changes

2. Update `CHANGELOG.md` with changes

3. Commit and push changes:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to x.x.x"
   git push
   ```

4. Publish the update:
   ```bash
   npx vsce publish patch  # or minor, or major
   ```

   Or manually:
   ```bash
   npx vsce publish
   ```

## Alternative: Manual Upload

If you prefer to upload manually:

1. Package the extension:
   ```bash
   npx vsce package
   ```

2. Go to [Publisher Management](https://marketplace.visualstudio.com/manage)
3. Click on your publisher
4. Click "New extension" → "Visual Studio Code"
5. Drag and drop the `.vsix` file
6. Click "Upload"

## Post-Publishing Checklist

- [ ] Verify the extension appears on the marketplace
- [ ] Test installation from the marketplace
- [ ] Check that the README displays correctly
- [ ] Verify all images and icons load
- [ ] Test the extension functionality in a clean VSCode instance
- [ ] Monitor reviews and feedback
- [ ] Respond to issues on GitHub

## Troubleshooting

### "Publisher not found" error
- Ensure your publisher ID matches exactly
- Verify you're logged in: `npx vsce logout` then `npx vsce login your-publisher-id`

### "Not allowed to publish" error
- Check that your PAT has the correct scopes (Marketplace: Manage, Publish)
- Ensure the PAT hasn't expired

### Extension not appearing in search
- Wait up to 10 minutes for indexing
- Check that your extension metadata is complete
- Ensure the extension name isn't too similar to existing extensions

## Important Notes

- **Repository**: Your extension's repository URL in `package.json` should match your GitHub repo
- **Icon**: Consider adding a PNG icon (128x128px) for better visibility
- **README**: Ensure your README.md is comprehensive with screenshots and usage examples
- **License**: Include a LICENSE file (currently MIT)
- **Pricing**: The extension is free by default

## Marketplace Guidelines

Follow the [Visual Studio Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines):

- Provide clear, accurate descriptions
- Include screenshots and GIFs demonstrating functionality
- Respect user privacy and data
- Follow naming conventions
- Respond to user feedback promptly

## Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Marketplace Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)

## Contact

For issues or questions about publishing, open an issue on the [GitHub repository](https://github.com/uilfl/figma-comment-agent/issues).
