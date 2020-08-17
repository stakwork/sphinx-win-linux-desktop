import * as ipc from '../crypto/ipc'

export async function uploadFile(file:File,type:string,host:string,token:string){
  const obj={file,type,host,token}
  const ret = await ipc.send('upload-file', obj)
  return ret
}
