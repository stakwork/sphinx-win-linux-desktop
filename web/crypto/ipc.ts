const electron = window.require ? window.require("electron") : {}

const timeoutSeconds = 10
export function send(k: string, args:object){
  const ipc = electron.ipcRenderer
  if(!ipc) return
  const rid = `${k}_${Math.random().toString(36).substring(7)}`
  const v = args||{}
  ipc.send(k, {...v, rid})
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve('')
    }, 1000*timeoutSeconds)
  })
  const response = new Promise(resolve => {
    ipc.once(rid, (event, response) => resolve(response));
  })
  return Promise.race([response, timeout])
}

export function sendSync(k:string, v:object){
  const ipc = electron.ipcRenderer
  if(ipc) {
    return ipc.sendSync(k,JSON.stringify(v))
  }
}
