var vscode = {
    window: {
        showErrorMessage: jest.fn().mockResolvedValue(undefined),
        showInformationMessage: jest.fn().mockResolvedValue(undefined),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn(),
        }),
    },
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
        }),
    },
    ExtensionContext: jest.fn().mockImplementation(function () { return ({
        subscriptions: [],
        workspaceState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
        },
    }); }),
    commands: {
        registerCommand: jest.fn(),
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2,
    },
};
module.exports = vscode;
