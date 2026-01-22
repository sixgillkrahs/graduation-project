import crypto from "crypto";
import { ENV } from "@/config/env";

const algorithm = "aes-256-cbc";
const key = ENV.MESSAGE_ENCRYPTION_KEY;
const ivLength = 16;

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
}

export function decrypt(text: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(":");
    if (textParts.length !== 2) return text;
    
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    // Return original text if decryption fails (e.g. old unencrypted messages)
    return text;
  }
}
