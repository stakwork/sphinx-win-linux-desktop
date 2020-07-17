const electron = window.require ? window.require("electron") : {}

export function decryptSync(data:string,password:string){
  const obj={data,password}
  const ret = sendSync('decryptSync', obj)
  return ret
}

function sendSync(k:string, v:object){
  const ipc = electron.ipcRenderer
  if(ipc) {
    return ipc.sendSync(k,JSON.stringify(v))
  }
}