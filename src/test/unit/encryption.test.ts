import { expect } from "chai";
import { encrypt, decrypt } from "../../utils/encryption";
import { FigmaAgentError } from "../../types/error";

describe("Encryption Utils", () => {
  const testData = "sensitive-test-data";

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = "test-encryption-key-32-bytes-long!!";
  });

  afterAll(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it("should encrypt and decrypt data successfully", () => {
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    expect(decrypted).to.equal(testData);
  });

  it("should generate different encrypted values for same input", () => {
    const encrypted1 = encrypt(testData);
    const encrypted2 = encrypt(testData);
    expect(encrypted1).to.not.equal(encrypted2);
  });

  it("should throw FigmaAgentError for invalid encrypted format", () => {
    expect(() => decrypt("invalid-format")).to.throw(FigmaAgentError);
  });
});
