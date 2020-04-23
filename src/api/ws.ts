import ReconnectingWebSocket from 'reconnecting-websocket';

type WSMessage = {[k: string]: any}

type DataHandler = (data: any) => void

let handlers: {[k: string]: DataHandler} = {}

export function registerWsHandlers(hs: {[k: string]: DataHandler}) {
  handlers = hs
}

let ws: any = null

export function connectWebSocket(ip: string) {
  if(ws) return // dont reconnect if already exists

  const uri = 'ws://' + ip + '/socket' 

  const rws = new ReconnectingWebSocket(uri);

  rws.onopen = function(){
    ws = rws
  }
  rws.onclose = function(){
    ws = null
  }
  rws.onerror = function(){
    ws = null
  }

  rws.onmessage = (e) => {
    let msg: WSMessage = JSON.parse(e.data)
    let handler = handlers[msg.type]
    if (handler) {
      handler(msg)
    }
  }
}
