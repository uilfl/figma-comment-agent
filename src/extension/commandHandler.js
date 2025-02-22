"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
var vscode = __importStar(require("vscode"));
var errorService_1 = require("../services/errorService");
var error_1 = require("../types/error");
var CommandHandler = /** @class */ (function () {
    function CommandHandler(commentProcessor, promptGenerator, exportService, config, logger) {
        this.commentProcessor = commentProcessor;
        this.promptGenerator = promptGenerator;
        this.exportService = exportService;
        this.config = config;
        this.logger = logger;
        this.comments = [];
        this.prompts = [];
        this.errorService = errorService_1.ErrorService.getInstance();
    }
    CommandHandler.prototype.fetchComments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileId, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: "Enter Figma File ID",
                            validateInput: function (value) {
                                return value && value.trim() ? null : "File ID is required";
                            },
                        })];
                    case 1:
                        fileId = _a.sent();
                        if (!fileId) {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.VALIDATION,
                                severity: error_1.ErrorSeverity.MEDIUM,
                                message: "File ID is required",
                                suggestedAction: "Please provide a valid Figma file ID",
                                retryable: true,
                            });
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.errorService.retryOperation(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Fetch comments implementation here
                                    this.logger.info("Fetching comments for file: ".concat(fileId));
                                    return [2 /*return*/];
                                });
                            }); }, 3, "fetchComments")];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage("Fetched ".concat(this.comments.length, " comments"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.errorService.handleError(error_2, "fetchComments");
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandHandler.prototype.generatePrompts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.comments.length) {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.VALIDATION,
                                severity: error_1.ErrorSeverity.MEDIUM,
                                message: "No comments available. Fetch comments first.",
                                suggestedAction: "Please fetch comments before generating prompts",
                                retryable: false,
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.errorService.retryOperation(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Generate prompts implementation here
                                    this.logger.info("Generating prompts...");
                                    return [2 /*return*/];
                                });
                            }); }, 3, "generatePrompts")];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage("Generated ".concat(this.prompts.length, " prompts"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.errorService.handleError(error_3, "generatePrompts");
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CommandHandler.prototype.exportPrompts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var format, uri, result, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.prompts.length) {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.VALIDATION,
                                severity: error_1.ErrorSeverity.MEDIUM,
                                message: "No prompts available. Generate prompts first.",
                                suggestedAction: "Please generate prompts before exporting",
                                retryable: false,
                            });
                        }
                        format = this.config.getExportFormat();
                        return [4 /*yield*/, vscode.window.showSaveDialog({
                                filters: {
                                    "All Files": ["*"],
                                },
                                defaultUri: vscode.Uri.file("figma-prompts.".concat(format)),
                            })];
                    case 1:
                        uri = _a.sent();
                        if (!uri) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.errorService.retryOperation(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.exportService.exportPrompts(this.prompts, {
                                                format: format,
                                                outputPath: uri.fsPath,
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }, 3, "exportPrompts")];
                    case 3:
                        result = _a.sent();
                        if (result.success) {
                            vscode.window.showInformationMessage("Prompts exported to ".concat(result.filePath));
                        }
                        else {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.FILE,
                                severity: error_1.ErrorSeverity.HIGH,
                                message: "Failed to export prompts",
                                technicalDetails: result.error,
                                retryable: true,
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        this.errorService.handleError(error_4, "exportPrompts");
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return CommandHandler;
}());
exports.CommandHandler = CommandHandler;
