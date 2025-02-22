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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
var fs = __importStar(require("fs/promises"));
var path = __importStar(require("path"));
var export_1 = require("../types/export");
var logger_1 = require("../utils/logger");
var errorService_1 = require("../services/errorService");
var error_1 = require("../types/error");
var ExportService = /** @class */ (function () {
    function ExportService() {
        this.logger = new logger_1.Logger("ExportService");
        this.errorService = errorService_1.ErrorService.getInstance();
    }
    ExportService.prototype.exportPrompts = function (prompts, options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.errorService.retryOperation(function () { return __awaiter(_this, void 0, void 0, function () {
                                var outputPath, content;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.validateOptions(options);
                                            outputPath = this.resolveOutputPath(options);
                                            content = this.formatContent(prompts, options.format);
                                            return [4 /*yield*/, this.writeFile(outputPath, content)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, { success: true, filePath: outputPath }];
                                    }
                                });
                            }); }, 3, "exportPrompts")];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.errorService.handleError(error_2, "exportPrompts");
                        return [2 /*return*/, {
                                success: false,
                                filePath: options.outputPath,
                                error: error_2.message,
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ExportService.prototype.validateOptions = function (options) {
        if (!Object.values(export_1.ExportFormat).includes(options.format)) {
            throw new error_1.FigmaAgentError({
                category: error_1.ErrorCategory.VALIDATION,
                severity: error_1.ErrorSeverity.MEDIUM,
                message: "Invalid format: ".concat(options.format),
                suggestedAction: "Please select a valid export format (JSON, CSV, or TXT)",
                retryable: false,
            });
        }
        var dir = path.dirname(options.outputPath);
        if (!fs.access(dir).catch(function () { return false; })) {
            throw new Error("Directory does not exist: ".concat(dir));
        }
    };
    ExportService.prototype.resolveOutputPath = function (options) {
        var outputPath = options.outputPath;
        if (!path.extname(outputPath)) {
            outputPath += ".".concat(options.format);
        }
        return outputPath;
    };
    ExportService.prototype.formatContent = function (prompts, format) {
        switch (format) {
            case export_1.ExportFormat.CSV:
                return this.formatAsCSV(prompts);
            case export_1.ExportFormat.JSON:
                return this.formatAsJSON(prompts);
            case export_1.ExportFormat.TXT:
                return this.formatAsTXT(prompts);
            default:
                throw new error_1.FigmaAgentError({
                    category: error_1.ErrorCategory.VALIDATION,
                    severity: error_1.ErrorSeverity.MEDIUM,
                    message: "Unsupported format: ".concat(format),
                    retryable: false,
                });
        }
    };
    ExportService.prototype.formatAsCSV = function (prompts) {
        var _this = this;
        var headers = [
            "ID",
            "Title",
            "Description",
            "Priority",
            "Status",
            "Steps",
        ];
        var rows = __spreadArray([
            headers.join(",")
        ], prompts.map(function (prompt) {
            return [
                prompt.id,
                "\"".concat(_this.escapeCSV(prompt.title), "\""),
                "\"".concat(_this.escapeCSV(prompt.description), "\""),
                prompt.priority,
                prompt.status,
                "\"".concat(_this.escapeCSV(prompt.steps.join("; ")), "\""),
            ].join(",");
        }), true);
        return rows.join("\n");
    };
    ExportService.prototype.formatAsJSON = function (prompts) {
        var data = {
            exportDate: new Date().toISOString(),
            totalPrompts: prompts.length,
            prompts: prompts,
        };
        return JSON.stringify(data, null, 2);
    };
    ExportService.prototype.formatAsTXT = function (prompts) {
        return prompts
            .map(function (prompt) {
            return __spreadArray(__spreadArray([
                "Task ID: ".concat(prompt.id),
                "Title: ".concat(prompt.title),
                "Priority: ".concat(prompt.priority),
                "Status: ".concat(prompt.status),
                "Description:",
                prompt.description,
                "Steps:"
            ], prompt.steps.map(function (step, index) { return "".concat(index + 1, ". ").concat(step); }), true), [
                "---",
            ], false).join("\n");
        })
            .join("\n\n");
    };
    ExportService.prototype.writeFile = function (filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.writeFile(filePath, content, "utf8")];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3.code === "ENOSPC") {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.FILE,
                                severity: error_1.ErrorSeverity.CRITICAL,
                                message: "Disk space is insufficient",
                                retryable: false,
                                error: error_3,
                            });
                        }
                        else if (error_3.code === "EPERM") {
                            throw new error_1.FigmaAgentError({
                                category: error_1.ErrorCategory.FILE,
                                severity: error_1.ErrorSeverity.CRITICAL,
                                message: "Permission denied when writing file",
                                retryable: false,
                                error: error_3,
                            });
                        }
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ExportService.prototype.escapeCSV = function (text) {
        return text.replace(/"/g, '""');
    };
    return ExportService;
}());
exports.ExportService = ExportService;
