import * as crypto from "crypto";
import { ErrorCategory, ErrorSeverity, FigmaAgentError } from "../types/error";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key";
const ALGORITHM = "aes-256-cbc";

if (
  process.env.NODE_ENV === "production" &&
  ENCRYPTION_KEY === "default-encryption-key"
) {
  throw new FigmaAgentError({
    category: ErrorCategory.CONFIG,
    severity: ErrorSeverity.CRITICAL,
    message: "Missing encryption key in production",
    suggestedAction: "Please set ENCRYPTION_KEY environment variable",
    retryable: false,
  });
}

// Ensure key is proper length for AES-256
function getKey(): Buffer {
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  return key;
}

export function encrypt(text: string): string {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    throw new FigmaAgentError({
      category: ErrorCategory.CONFIG,
      severity: ErrorSeverity.HIGH,
      message: "Encryption failed",
      technicalDetails:
        error instanceof Error ? error.message : "Unknown error",
      retryable: false,
    });
  }
}

export function decrypt(text: string): string {
  try {
    const key = getKey();
    const [ivHex, encryptedHex] = text.split(":");
    if (!ivHex || !encryptedHex) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    throw new FigmaAgentError({
      category: ErrorCategory.CONFIG,
      severity: ErrorSeverity.HIGH,
      message: "Decryption failed",
      technicalDetails:
        error instanceof Error ? error.message : "Unknown error",
      retryable: false,
    });
  }
}
