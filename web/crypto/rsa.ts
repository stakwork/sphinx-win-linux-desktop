import * as ipc from './ipc'

export async function setPrivateKey(priv) {
  await ipc.send('set-private-key', {key:priv})
}

export async function genKeys() {
  const publicKey = await ipc.send('gen-keys', {})
  return publicKey
}

export async function decrypt(data:string){
  const obj={data}
  const ret = await ipc.send('decrypt-rsa', obj)
  return ret
}

export async function encrypt(data:string, pubkey:string){
  const obj={data,pubkey}
  const ret = await ipc.send('encrypt-rsa', obj)
  return ret
}