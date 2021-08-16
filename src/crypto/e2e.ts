import * as rsaMobile from "./rsa";
import * as aesMobile from "./aes";
import * as rsaWeb from "../../web/crypto/rsa";
import * as aesWeb from "../../web/crypto/aes";

const rsaConfig = {
  ios: rsaMobile,
  android: rsaMobile,
  web: rsaWeb,
};
const aesConfig = {
  ios: aesMobile,
  android: aesMobile,
  web: aesWeb,
};

const rsa = rsaConfig["web"];
const aes = aesConfig["web"];

/*
File attachments are encrypted with a password,
The password is encrypted with recipient's public key

Private keys stored in android/ios keychain
*/

// encrypt text with a public key
export async function encryptPublic(text: string, key: string) {
  return await rsa.encrypt(text, key);
}

// decrypt with your own PRIVATE key (from keychain)
export async function decryptPrivate(base64: string) {
  return await rsa.decrypt(base64);
}

// encrypt with a symmetric password (using RN-Cryptor)
export async function encrypt(text: string, pwd: string) {
  return await aes.encryptSymmetric(text, pwd);
}

// decrypt with a symmetric password (using RN-Cryptor)
export async function decrypt(text: string, pwd: string) {
  return await aes.decrypt(text, pwd);
}

// // encrypt file with symmetric password
// export async function encryptFile(filepath: string, pwd: string) {
//   return await aes.encryptFile(filepath, pwd);
// }

// // encrypt file with symmetric password from base64
// export async function encryptFileFromBase64(b64: string, pwd: string) {
//   return await aes.encryptFromBase64(b64, pwd);
// }
