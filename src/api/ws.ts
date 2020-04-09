type WSMessage = {[k: string]: any}

type DataHandler = (data: any) => void

let handlers: {[k: string]: DataHandler} = {}

export function registerWsHandlers(hs: {[k: string]: DataHandler}) {
  handlers = hs
}

let ws: WebSocket | null = null

export function connectWebSocket(ip: string) {
  if(ws) return // dont reconnect if already exists

  const uri = 'ws://' + ip + '/socket' 

  const thews = new WebSocket(uri)

  thews.onopen = function(){
    ws = thews
  }
  thews.onclose = function(){
    ws = null
  }
  thews.onerror = function(){
    ws = null
  }

  thews.onmessage = (e) => {
    let msg: WSMessage = JSON.parse(e.data)
    let handler = handlers[msg.type]
    if (handler) {
      handler(msg)
    }
  }
}
