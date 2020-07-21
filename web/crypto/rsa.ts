import * as ipc from './ipc'

export function setPrivateKey(priv) {
  localStorage.setItem('private', priv)
}

export async function decrypt(data:string){
  const priv = localStorage.getItem('private')
  const obj={data,private:priv}
  const ret = await ipc.send('decrypt-rsa', obj)
  return ret
}

export async function encrypt(data:string, pubkey:string){
  const obj={data,pubkey}
  const ret = await ipc.send('encrypt-rsa', obj)
  return ret
}