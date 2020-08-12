const { ipcRenderer } = require('electron')
var EventEmitter = require('eventemitter3')
window.EE = new EventEmitter()

window.sendToElectron=function(channel,data) {
  ipcRenderer.sendToHost(channel,data)
}

ipcRenderer.on('sphinx-bridge',function(event,data){
  window.EE.emit('sphinx-bridge',{data})
})
