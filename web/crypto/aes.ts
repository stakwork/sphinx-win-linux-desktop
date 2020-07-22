import * as ipc from './ipc'

export async function decrypt(data:string,password:string){
  const obj={data,password}
  const ret = await ipc.send('decrypt', obj)
  return ret
}

export async function decrypt64(data:string,password:string){
  const obj={data,password}
  const ret = await ipc.send('decrypt-64', obj)
  return ret
}

export function decryptSync(data:string,password:string){
  const obj={data,password}
  const ret = ipc.sendSync('decryptSync', obj)
  return ret
}
