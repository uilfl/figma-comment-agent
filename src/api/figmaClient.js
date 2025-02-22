"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaClient = void 0;
var axios_1 = __importDefault(require("axios"));
var validation_1 = require("../utils/validation");
var figma_1 = require("../types/figma");
var FigmaClient = /** @class */ (function () {
    function FigmaClient(apiToken) {
        this.maxRetries = 3;
        if (!(0, validation_1.validateToken)(apiToken)) {
            throw new figma_1.FigmaApiError("Invalid Figma API token format", 401);
        }
        this.client = axios_1.default.create({
            baseURL: "https://api.figma.com/v1",
            headers: {
                "X-Figma-Token": apiToken,
            },
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use(function (response) { return response; }, function (error) {
            if (error.response) {
                throw new figma_1.FigmaApiError(error.response.data.error || "API request failed", error.response.status);
            }
            throw error;
        });
    }
    FigmaClient.prototype.retryRequest = function (request_1) {
        return __awaiter(this, arguments, void 0, function (request, retryCount) {
            var error_1, delay_1;
            if (retryCount === void 0) { retryCount = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, request()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        if (retryCount >= this.maxRetries) {
                            throw this.handleApiError(error_1);
                        }
                        if (!this.isRetryableError(error_1)) return [3 /*break*/, 4];
                        delay_1 = Math.pow(2, retryCount) * 1000;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.retryRequest(request, retryCount + 1)];
                    case 4: throw this.handleApiError(error_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    FigmaClient.prototype.isRetryableError = function (error) {
        var _a, _b;
        return (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 429 ||
            ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 500 ||
            error.code === "ECONNRESET");
    };
    FigmaClient.prototype.handleApiError = function (error) {
        if (error instanceof figma_1.FigmaApiError) {
            return error;
        }
        if (error.response) {
            var _a = error.response, status_1 = _a.status, data = _a.data;
            return new figma_1.FigmaApiError(data.error || this.getErrorMessageForStatus(status_1), status_1);
        }
        if (error.request) {
            // Network error occurred
            return new figma_1.FigmaApiError("Network request failed", 503);
        }
        return new figma_1.FigmaApiError(error.message || "Unknown error", 500);
    };
    FigmaClient.prototype.getErrorMessageForStatus = function (status) {
        switch (status) {
            case 401:
                return "Invalid API token";
            case 403:
                return "Access forbidden";
            case 404:
                return "File not found";
            case 429:
                return "Too many requests";
            case 500:
                return "Figma server error";
            default:
                return "Unknown API error";
        }
    };
    FigmaClient.prototype.getFileComments = function (fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.retryRequest(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.client.get("/files/".concat(fileId, "/comments"))];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.comments];
                    case 2:
                        error_2 = _a.sent();
                        throw this.handleApiError(error_2);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FigmaClient;
}());
exports.FigmaClient = FigmaClient;
