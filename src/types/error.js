"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaAgentError = exports.ErrorSeverity = exports.ErrorCategory = void 0;
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["API"] = "API";
    ErrorCategory["CONFIG"] = "Configuration";
    ErrorCategory["FILE"] = "File System";
    ErrorCategory["VALIDATION"] = "Validation";
    ErrorCategory["NETWORK"] = "Network";
    ErrorCategory["UNKNOWN"] = "Unknown";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var FigmaAgentError = /** @class */ (function (_super) {
    __extends(FigmaAgentError, _super);
    function FigmaAgentError(details) {
        var _this = _super.call(this, details.message) || this;
        _this.details = details;
        _this.name = "FigmaAgentError";
        return _this;
    }
    return FigmaAgentError;
}(Error));
exports.FigmaAgentError = FigmaAgentError;
