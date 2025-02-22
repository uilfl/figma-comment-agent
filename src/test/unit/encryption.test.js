"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var encryption_1 = require("../../utils/encryption");
var error_1 = require("../../types/error");
describe("Encryption Utils", function () {
    var testData = "sensitive-test-data";
    beforeAll(function () {
        process.env.ENCRYPTION_KEY = "test-encryption-key-32-bytes-long!!";
    });
    afterAll(function () {
        delete process.env.ENCRYPTION_KEY;
    });
    it("should encrypt and decrypt data successfully", function () {
        var encrypted = (0, encryption_1.encrypt)(testData);
        var decrypted = (0, encryption_1.decrypt)(encrypted);
        (0, chai_1.expect)(decrypted).to.equal(testData);
    });
    it("should generate different encrypted values for same input", function () {
        var encrypted1 = (0, encryption_1.encrypt)(testData);
        var encrypted2 = (0, encryption_1.encrypt)(testData);
        (0, chai_1.expect)(encrypted1).to.not.equal(encrypted2);
    });
    it("should throw FigmaAgentError for invalid encrypted format", function () {
        (0, chai_1.expect)(function () { return (0, encryption_1.decrypt)("invalid-format"); }).to.throw(error_1.FigmaAgentError);
    });
});
