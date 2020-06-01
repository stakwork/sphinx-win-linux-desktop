import { RSAKeychain, RSA } from 'react-native-rsa-native'
global.Buffer = global.Buffer || require('buffer').Buffer

const KEY_SIZE = 2048
const KEY_TAG = 'sphinx'

const BLOCK_SIZE=256
const MAX_CHUNK_SIZE=BLOCK_SIZE-11 // 11 is the PCKS1 padding

export async function keyGen() {
  try {
    const keys = await RSAKeychain.generateKeys(KEY_TAG, KEY_SIZE)
    return pubuncert(keys.public)
  } catch(e){}
  return ''
}

// ENCRYPT UTF8
export async function encrypt(data, pubkey) {
  const key = pubcert(pubkey)
  try{
    const buf = Buffer.from(data)
    let dataArray = []
    let finalEnc = ''
    const n = Math.ceil(buf.length/MAX_CHUNK_SIZE)
    const arr = Array(n).fill(0)
    arr.forEach((_,i)=>{
      dataArray.push(buf.subarray(i*MAX_CHUNK_SIZE,i*MAX_CHUNK_SIZE+MAX_CHUNK_SIZE).toString('utf8'))
    })
    await asyncForEach(dataArray, async d=>{
      const enc = await RSA.encrypt(d, key)
      finalEnc += enc
    })
    return finalEnc.replace(/[\r\n]+/gm, '')
  } catch(e){}
  return ''
}

// DECRYPT BASE64
export async function decrypt(data) {
  try{
    const buf = Buffer.from(data, 'base64')
    let dataArray = []
    let finalDec = ''
    const n = Math.ceil(buf.length/BLOCK_SIZE)
    const arr = Array(n).fill(0)
    arr.forEach((_,i)=>{
      dataArray.push(buf.subarray(i*BLOCK_SIZE,i*BLOCK_SIZE+BLOCK_SIZE).toString('base64'))
    })
    await asyncForEach(dataArray, async d=>{
      const dec = await RSAKeychain.decrypt(d, KEY_TAG)
      finalDec += dec
    })
    return finalDec
  } catch(e){}
  return ''
}

export async function testRSA(){
  const msg = "my secret message"
  try {
    const keys = await keyGen()
    console.log(keys)
    const enc = await encrypt(msg, keys.public)
    const dec = await decrypt(enc)
    console.log("MESSAGE:",dec)
  } catch(e) {
    console.log(e)
  }
}

function pubuncert(key){
  let s = key
  s = s.replace('-----BEGIN RSA PUBLIC KEY-----','')
  s = s.replace('-----END RSA PUBLIC KEY-----','')
  return s.replace(/[\r\n]+/gm, '')
}
function pubcert(key){
  return '-----BEGIN RSA PUBLIC KEY-----\n' +
    key + '\n' +
  '-----END RSA PUBLIC KEY-----'
}
function privcert(key){
  return '-----BEGIN RSA PRIVATE KEY-----\n' +
    key + '\n' +
  '-----END RSA PRIVATE KEY-----'
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}