import { RSAKeychain, RSA } from 'react-native-rsa-native'

const KEY_SIZE = 2048
const KEY_TAG = 'sphinx'

export async function keyGen() {
  try {
    const keys = await RSAKeychain.generateKeys(KEY_TAG, KEY_SIZE)
    return pubuncert(keys.public)
  } catch(e){}
  return ''
}

export async function encrypt(data, pubkey) {
  const key = pubcert(pubkey)
  try{
    const enc = await RSA.encrypt(data, key)
    return enc.replace(/[\r\n]+/gm, '')
  } catch(e){}
  return ''
}

export async function decrypt(data) {
  try{
    const dec = await RSAKeychain.decrypt(data, KEY_TAG)
    return dec
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


