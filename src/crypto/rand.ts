import { randString as ipcRandString } from "../../web/crypto/rand";

function randString(l): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const r = await ipcRandString(l || 20);
    resolve(r ? String(r) : insecureRand()); // should not ever run "insecureRand"
  });
}

async function randAscii() {
  const rnd = await randString(20);
  const one = replaceAll(rnd, "=", "");
  const two = replaceAll(one, "+", "");
  const three = replaceAll(two, "/", "");
  return three;
}

function replaceAll(str0, str1, str2) {
  const ignore = false;
  return str0.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
}

export { randString, randAscii };

function insecureRand() {
  return Math.random().toString(36).substring(7);
}
