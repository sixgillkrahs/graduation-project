import { encrypt, decrypt } from "./utils/encryption";

console.log("Testing encryption functions...");

const original = "Hello World";
const encrypted = encrypt(original);
console.log("Encrypted:", encrypted);

if (encrypted === original) {
    console.error("FAILURE: Text was not encrypted.");
    process.exit(1);
}

const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted);

if (original === decrypted) {
    console.log("SUCCESS: Encryption/Decryption works.");
} else {
    console.error("FAILURE: Decrypted text does not match.");
    process.exit(1);
}

// Test backward compatibility
const plain = "Hello:World";
const decryptedPlain = decrypt(plain);
console.log("Plain decrypted:", decryptedPlain);
if (plain === decryptedPlain) {
    console.log("SUCCESS: Backward compatibility works.");
} else {
    console.error("FAILURE: Backward compatibility failed.");
    process.exit(1);
}
