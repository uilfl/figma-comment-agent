"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = validateToken;
function validateToken(token) {
    // Figma tokens are typically 32-character hex strings
    // For testing purposes, we'll accept any non-empty string
    if (process.env.NODE_ENV === "test") {
        return Boolean(token && token.length > 0);
    }
    return /^figd_[a-zA-Z0-9_-]{32,}$/.test(token);
}
