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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
var crypto = __importStar(require("crypto"));
var error_1 = require("../types/error");
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key";
var ALGORITHM = "aes-256-cbc";
if (process.env.NODE_ENV === "production" &&
    ENCRYPTION_KEY === "default-encryption-key") {
    throw new error_1.FigmaAgentError({
        category: error_1.ErrorCategory.CONFIG,
        severity: error_1.ErrorSeverity.CRITICAL,
        message: "Missing encryption key in production",
        suggestedAction: "Please set ENCRYPTION_KEY environment variable",
        retryable: false,
    });
}
// Ensure key is proper length for AES-256
function getKey() {
    var key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    return key;
}
function encrypt(text) {
    try {
        var key = getKey();
        var iv = crypto.randomBytes(16);
        var cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        var encrypted = Buffer.concat([
            cipher.update(text, "utf8"),
            cipher.final(),
        ]);
        return "".concat(iv.toString("hex"), ":").concat(encrypted.toString("hex"));
    }
    catch (error) {
        throw new error_1.FigmaAgentError({
            category: error_1.ErrorCategory.CONFIG,
            severity: error_1.ErrorSeverity.HIGH,
            message: "Encryption failed",
            technicalDetails: error instanceof Error ? error.message : "Unknown error",
            retryable: false,
        });
    }
}
function decrypt(text) {
    try {
        var key = getKey();
        var _a = text.split(":"), ivHex = _a[0], encryptedHex = _a[1];
        if (!ivHex || !encryptedHex) {
            throw new Error("Invalid encrypted text format");
        }
        var iv = Buffer.from(ivHex, "hex");
        var encrypted = Buffer.from(encryptedHex, "hex");
        var decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        var decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
    catch (error) {
        throw new error_1.FigmaAgentError({
            category: error_1.ErrorCategory.CONFIG,
            severity: error_1.ErrorSeverity.HIGH,
            message: "Decryption failed",
            technicalDetails: error instanceof Error ? error.message : "Unknown error",
            retryable: false,
        });
    }
}
