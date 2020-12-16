import { chatStore } from "../../src/store/chats"
import { uiStore } from "../../src/store/ui"

const electron = window.require ? window.require("electron") : {}
const base64Fields=['imgurl']

export default function setupDeeplink() {
    if(electron.ipcRenderer) {
        electron.ipcRenderer.on('deeplink', (event, message) => {
            runAction(message)
        })
    }
}

async function runAction (url) {
    const j = jsonFromUrl(url)
    switch (j.action) {
        case "tribe":
        const tribe = await chatStore.getTribeDetails(j.host, j.uuid)
        uiStore.setViewTribe(tribe)
    }
}

export function jsonFromUrl(url): {[k:string]:any} {
    const qIndex = url.indexOf('?')
    var query = url.substr(qIndex+1)
    var result = {}
    query.split("&").forEach(function(s) {
      const idx = s.indexOf('=')
      const k = s.substr(0,idx)
      const v = s.substr(idx+1)
      if(base64Fields.includes(k)){
        result[k]=atob(v)
      } else {
        result[k]=v
      }
    })
    return result
  }