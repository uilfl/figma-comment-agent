"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentProcessor = void 0;
var logger_1 = require("../utils/logger");
var CommentProcessor = /** @class */ (function () {
    function CommentProcessor() {
        this.logger = new logger_1.Logger("CommentProcessor");
    }
    CommentProcessor.prototype.processComments = function (rawComments, options) {
        var _a;
        if (options === void 0) { options = {}; }
        try {
            var comments = this.validateAndParseComments(rawComments);
            if (options.excludeResolved) {
                comments = comments.filter(function (comment) { return !comment.isResolved; });
            }
            if ((_a = options.filterKeywords) === null || _a === void 0 ? void 0 : _a.length) {
                comments = comments.filter(function (comment) {
                    return options.filterKeywords.some(function (keyword) {
                        return comment.message.toLowerCase().includes(keyword.toLowerCase());
                    });
                });
            }
            if (comments.length === 0) {
                this.logger.warn("No comments match the filtering criteria");
            }
            return comments;
        }
        catch (error) {
            this.logger.error("Error processing comments:", error);
            throw new Error("Failed to process comments");
        }
    };
    CommentProcessor.prototype.validateAndParseComments = function (rawComments) {
        var _this = this;
        return rawComments.map(function (comment) {
            if (!_this.isValidComment(comment)) {
                _this.logger.warn("Invalid comment structure: ".concat(JSON.stringify(comment)));
                throw new Error("Invalid comment structure");
            }
            return _this.parseComment(comment);
        });
    };
    CommentProcessor.prototype.isValidComment = function (comment) {
        return (comment &&
            typeof comment.id === "string" &&
            comment.user &&
            typeof comment.message === "string" &&
            typeof comment.created_at === "string");
    };
    CommentProcessor.prototype.parseComment = function (comment) {
        return {
            id: comment.id,
            author: comment.user.name || comment.user.handle,
            message: comment.message,
            timestamp: new Date(comment.created_at),
            isResolved: !!comment.resolved_at,
            location: comment.client_meta
                ? {
                    x: comment.client_meta.x,
                    y: comment.client_meta.y,
                    nodeId: comment.client_meta.node_id,
                }
                : undefined,
        };
    };
    return CommentProcessor;
}());
exports.CommentProcessor = CommentProcessor;
