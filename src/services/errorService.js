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
exports.ErrorService = void 0;
var vscode = __importStar(require("vscode"));
var error_1 = require("../types/error");
var logger_1 = require("../extension/logger");
var ErrorService = /** @class */ (function () {
    function ErrorService() {
        this.errorHistory = [];
        this.logger = new logger_1.FigmaAgentLogger();
    }
    ErrorService.getInstance = function () {
        if (!ErrorService.instance) {
            ErrorService.instance = new ErrorService();
        }
        return ErrorService.instance;
    };
    ErrorService.prototype.handleError = function (error, context) {
        var figmaError = this.normalizeTofigmaError(error, context);
        this.errorHistory.push(figmaError);
        this.logError(figmaError);
        this.notifyUser(figmaError);
    };
    ErrorService.prototype.retryOperation = function (operation_1) {
        return __awaiter(this, arguments, void 0, function (operation, maxRetries, context) {
            var lastError, _loop_1, this_1, attempt, state_1;
            if (maxRetries === void 0) { maxRetries = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastError = null;
                        _loop_1 = function (attempt) {
                            var _b, error_2;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 5]);
                                        _b = {};
                                        return [4 /*yield*/, operation()];
                                    case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                    case 2:
                                        error_2 = _c.sent();
                                        lastError = error_2;
                                        this_1.logger.warn("Attempt ".concat(attempt, "/").concat(maxRetries, " failed:"), error_2);
                                        if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * attempt); })];
                                    case 3:
                                        _c.sent();
                                        _c.label = 4;
                                    case 4: return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw this.normalizeTofigmaError(lastError, context);
                }
            });
        });
    };
    ErrorService.prototype.normalizeTofigmaError = function (error, context) {
        if (error instanceof error_1.FigmaAgentError)
            return error;
        var details = this.categorizeError(error, context);
        return new error_1.FigmaAgentError(details);
    };
    ErrorService.prototype.categorizeError = function (error, context) {
        // Network errors
        if (error.message.includes("ENOTFOUND") ||
            error.message.includes("ETIMEDOUT")) {
            return {
                category: error_1.ErrorCategory.NETWORK,
                severity: error_1.ErrorSeverity.HIGH,
                message: "Network connection failed",
                technicalDetails: error.message,
                suggestedAction: "Please check your internet connection and try again",
                retryable: true,
                error: error,
            };
        }
        // API errors
        if (error.message.includes("401") || error.message.includes("API token")) {
            return {
                category: error_1.ErrorCategory.API,
                severity: error_1.ErrorSeverity.CRITICAL,
                message: "Invalid API token",
                technicalDetails: error.message,
                suggestedAction: "Please check your Figma API token in settings",
                retryable: false,
                error: error,
            };
        }
        // File system errors
        if (error.message.includes("ENOSPC") || error.message.includes("EPERM")) {
            return {
                category: error_1.ErrorCategory.FILE,
                severity: error_1.ErrorSeverity.HIGH,
                message: "File system error",
                technicalDetails: error.message,
                suggestedAction: "Please check disk space and permissions",
                retryable: true,
                error: error,
            };
        }
        // Default case
        return {
            category: error_1.ErrorCategory.UNKNOWN,
            severity: error_1.ErrorSeverity.MEDIUM,
            message: error.message,
            technicalDetails: error.stack,
            suggestedAction: "Please try again or check the error log for details",
            retryable: true,
            error: error,
        };
    };
    ErrorService.prototype.logError = function (error) {
        var _a = error.details, category = _a.category, severity = _a.severity, message = _a.message, technicalDetails = _a.technicalDetails;
        this.logger.error("[".concat(category, "][").concat(severity, "] ").concat(message), technicalDetails || "");
    };
    ErrorService.prototype.notifyUser = function (error) {
        var _a;
        var _this = this;
        var _b = error.details, message = _b.message, suggestedAction = _b.suggestedAction, retryable = _b.retryable;
        var actions = [];
        if (retryable) {
            actions.push("Retry");
        }
        actions.push("Show Error Log");
        (_a = vscode.window)
            .showErrorMessage.apply(_a, __spreadArray(["".concat(message).concat(suggestedAction ? " - ".concat(suggestedAction) : "")], actions, false)).then(function (selection) {
            if (selection === "Show Error Log") {
                _this.logger.show();
            }
        });
    };
    ErrorService.prototype.getErrorHistory = function () {
        return __spreadArray([], this.errorHistory, true);
    };
    ErrorService.prototype.clearErrorHistory = function () {
        this.errorHistory = [];
    };
    return ErrorService;
}());
exports.ErrorService = ErrorService;
