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
exports.PromptGenerator = void 0;
var openai_1 = __importDefault(require("openai"));
var logger_1 = require("../utils/logger");
var PromptGenerator = /** @class */ (function () {
    function PromptGenerator(apiKey) {
        this.openai = new openai_1.default({ apiKey: apiKey });
        this.logger = new logger_1.Logger("PromptGenerator");
    }
    PromptGenerator.prototype.generatePrompts = function (comments_1) {
        return __awaiter(this, arguments, void 0, function (comments, options) {
            var prompts, _i, comments_2, comment, prompt_1, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompts = [];
                        _i = 0, comments_2 = comments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < comments_2.length)) return [3 /*break*/, 6];
                        comment = comments_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.generateSinglePrompt(comment, options)];
                    case 3:
                        prompt_1 = _a.sent();
                        prompts.push(prompt_1);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.logger.error("Failed to generate prompt for comment ".concat(comment.id, ":"), error_1);
                        prompts.push(this.createFailedPrompt(comment, error_1));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, prompts];
                }
            });
        });
    };
    PromptGenerator.prototype.regeneratePrompt = function (comment_1) {
        return __awaiter(this, arguments, void 0, function (comment, options) {
            var error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.generateSinglePrompt(comment, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Failed to regenerate prompt for comment ".concat(comment.id, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PromptGenerator.prototype.generateSinglePrompt = function (comment, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, maxRetries, _b, timeoutMs, _c, model, lastError, attempt, response, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = options.maxRetries, maxRetries = _a === void 0 ? 3 : _a, _b = options.timeoutMs, timeoutMs = _b === void 0 ? 10000 : _b, _c = options.model, model = _c === void 0 ? "gpt-4" : _c;
                        lastError = null;
                        attempt = 1;
                        _d.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 8];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, Promise.race([
                                this.callAIService(comment, model),
                                this.createTimeout(timeoutMs),
                            ])];
                    case 3:
                        response = _d.sent();
                        return [2 /*return*/, this.validateAndFormatPrompt(response !== null && response !== void 0 ? response : undefined, comment)];
                    case 4:
                        error_3 = _d.sent();
                        lastError = error_3;
                        this.logger.warn("Attempt ".concat(attempt, " failed:"), error_3);
                        if (!(attempt < maxRetries)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.delay(1000 * attempt)];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [3 /*break*/, 7];
                    case 7:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 8: throw lastError || new Error("Failed to generate prompt after all retries");
                }
            });
        });
    };
    PromptGenerator.prototype.callAIService = function (comment, model) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.openai.chat.completions.create({
                            model: model,
                            messages: [
                                {
                                    role: "system",
                                    content: "Transform Figma comments into clear, actionable development tasks.",
                                },
                                {
                                    role: "user",
                                    content: "Convert this Figma comment into a development prompt: \"".concat(comment.message, "\""),
                                },
                            ],
                            temperature: 0.7,
                        })];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content];
                }
            });
        });
    };
    PromptGenerator.prototype.validateAndFormatPrompt = function (aiResponse, comment) {
        if (!aiResponse) {
            throw new Error("Empty response from AI service");
        }
        var lines = aiResponse.split("\n").filter(function (line) { return line.trim(); });
        return {
            id: "prompt-".concat(comment.id),
            originalCommentId: comment.id,
            title: lines[0] || "Untitled Task",
            description: lines[1] || "No description provided",
            steps: lines.slice(2).map(function (step) { return step.replace(/^\d+\.\s*/, ""); }),
            priority: this.determinePriority(comment.message),
            status: "generated",
        };
    };
    PromptGenerator.prototype.createFailedPrompt = function (comment, error) {
        return {
            id: "prompt-".concat(comment.id),
            originalCommentId: comment.id,
            title: "Failed to Generate Prompt",
            description: comment.message,
            steps: [],
            priority: "medium",
            status: "failed",
            errorDetails: error.message,
        };
    };
    PromptGenerator.prototype.determinePriority = function (message) {
        var urgentKeywords = ["urgent", "asap", "critical", "emergency"];
        var lowKeywords = ["minor", "whenever", "low priority"];
        message = message.toLowerCase();
        if (urgentKeywords.some(function (keyword) { return message.includes(keyword); }))
            return "high";
        if (lowKeywords.some(function (keyword) { return message.includes(keyword); }))
            return "low";
        return "medium";
    };
    PromptGenerator.prototype.createTimeout = function (ms) {
        return new Promise(function (_, reject) {
            return setTimeout(function () { return reject(new Error("Operation timed out after ".concat(ms, "ms"))); }, ms);
        });
    };
    PromptGenerator.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return PromptGenerator;
}());
exports.PromptGenerator = PromptGenerator;
