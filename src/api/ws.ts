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

  let theIP = ip
  if(ip.startsWith('https://')) {
    theIP=ip.replace('https://','')
  }
  if(ip.startsWith('http://')) {
    theIP=ip.replace('http://','')
  }

  const uri = 'ws://' + theIP + '/socket' 

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
