const electron = window.require("electron")

export function decrypt(){
  const ret = electron.ipcRenderer.sendSync('decrypt', 'ping')
  console.log("ret",ret)
}