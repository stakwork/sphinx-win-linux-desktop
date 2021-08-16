// import { RSAKeychain, RSA } from 'react-native-rsa-native'
global.Buffer = global.Buffer || require("buffer").Buffer;
// import SecureStorage from 'react-native-secure-storage'

const KEY_SIZE = 2048;
const KEY_TAG = "sphinx";

const BLOCK_SIZE = 256;
const MAX_CHUNK_SIZE = BLOCK_SIZE - 11; // 11 is the PCKS1 padding

export async function generateKeyPair() {
  try {
    // const keys = await RSA.generateKeys(KEY_SIZE)
    // const priv = privuncert(keys.private)
    // const pub = pubuncert(keys.public)
    // await SecureStorage.setItem('private', priv, {service: 'sphinx_encryption_key'})
    // return {private:priv, public:pub}
  } catch (e) {}
}

export async function getPrivateKey() {
  try {
    // const config = {service: 'sphinx_encryption_key'}
    // const got = await SecureStorage.getItem('private', config)
    // return got
  } catch (e) {
    console.log(e);
  }
}

export async function setPrivateKey(priv) {
  try {
    // const config = {service: 'sphinx_encryption_key'}
    // const got = await SecureStorage.setItem('private', priv, config)
    // return got
  } catch (e) {
    console.log(e);
  }
}

export async function decrypt(data): Promise<string> {
  try {
    // const config = {service: 'sphinx_encryption_key'}
    // const priv = await SecureStorage.getItem('private', config)
    // const key = privcert(priv)
    // const buf = Buffer.from(data, 'base64')
    // let dataArray = []
    // let finalDec = ''
    // const n = Math.ceil(buf.length/BLOCK_SIZE)
    // const arr = Array(n).fill(0)
    // arr.forEach((_,i)=>{
    //   dataArray.push(buf.subarray(i*BLOCK_SIZE,i*BLOCK_SIZE+BLOCK_SIZE).toString('base64'))
    // })
    // await asyncForEach(dataArray, async d=>{
    //   const dec = await RSA.decrypt(d, key)
    //   finalDec += dec
    // })
    // return finalDec
    return "";
  } catch (e) {}
  return "";
}

export async function keyGen() {
  try {
    // const keys = await RSAKeychain.generateKeys(KEY_TAG, KEY_SIZE)
    // return pubuncert(keys.public)
  } catch (e) {}
  return "";
}

export async function getPublicKey() {
  console.log("=> get publickey");
  try {
    // const pub = await RSAKeychain.getPublicKey(KEY_TAG)
    // console.log('======> pub ',pub)
  } catch (e) {
    console.log(e);
  }
}

// ENCRYPT UTF8
export async function encrypt(data, pubkey) {
  const key = pubcert(pubkey);
  try {
    // const buf = Buffer.from(data)
    // let dataArray = []
    // let finalBuf = Buffer.from([])
    // const n = Math.ceil(buf.length/MAX_CHUNK_SIZE)
    // const arr = Array(n).fill(0)
    // arr.forEach((_,i)=>{
    //   const sub = buf.subarray(i*MAX_CHUNK_SIZE,i*MAX_CHUNK_SIZE+MAX_CHUNK_SIZE).toString('utf8')
    //   dataArray.push(sub)
    // })
    // await asyncForEach(dataArray, async d=>{
    //   const enc = await RSA.encrypt(d, key)
    //   const encBuf = Buffer.from(enc.replace(/[\r\n]+/gm, ''), 'base64')
    //   finalBuf = Buffer.concat([finalBuf,encBuf])
    // })
    // return finalBuf.toString('base64')
    return "";
  } catch (e) {}
  return "";
}

// DECRYPT BASE64
export async function decryptOld(data) {
  try {
    // const buf = Buffer.from(data, 'base64')
    // let dataArray = []
    // let finalDec = ''
    // const n = Math.ceil(buf.length/BLOCK_SIZE)
    // const arr = Array(n).fill(0)
    // arr.forEach((_,i)=>{
    //   dataArray.push(buf.subarray(i*BLOCK_SIZE,i*BLOCK_SIZE+BLOCK_SIZE).toString('base64'))
    // })
    // await asyncForEach(dataArray, async d=>{
    //   const dec = await RSAKeychain.decrypt(d, KEY_TAG)
    //   finalDec += dec
    // })
    // return finalDec
    return "";
  } catch (e) {}
  return "";
}

export async function testRSA() {
  const msg = "my secret message";
  try {
    // const keys = await keyGen()
    // console.log(keys)
    // const enc = await encrypt(msg, keys.public)
    // const dec = await decrypt(enc)
    // console.log("MESSAGE:",dec)
  } catch (e) {
    console.log(e);
  }
}

function pubuncert(key) {
  let s = key;
  s = s.replace("-----BEGIN RSA PUBLIC KEY-----", "");
  s = s.replace("-----END RSA PUBLIC KEY-----", "");
  return s.replace(/[\r\n]+/gm, "");
}
function pubcert(key) {
  return (
    "-----BEGIN RSA PUBLIC KEY-----\n" +
    key +
    "\n" +
    "-----END RSA PUBLIC KEY-----"
  );
}
function privcert(key) {
  return (
    "-----BEGIN RSA PRIVATE KEY-----\n" +
    key +
    "\n" +
    "-----END RSA PRIVATE KEY-----"
  );
}
function privuncert(key) {
  let s = key;
  s = s.replace("-----BEGIN RSA PRIVATE KEY-----", "");
  s = s.replace("-----END RSA PRIVATE KEY-----", "");
  return s.replace(/[\r\n]+/gm, "");
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
