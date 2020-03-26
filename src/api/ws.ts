type WSMessage = {[k: string]: any}

type DataHandler = (data: any) => void

let handlers: {[k: string]: DataHandler} = {}

export function registerWsHandlers(hs: {[k: string]: DataHandler}) {
  handlers = hs
}

let ws: WebSocket | null = null

export function connectWebSocket(ip: string) {
  if(ws) ws.close() // restart

  const uri = 'ws://' + ip + '/socket' 

  ws = new WebSocket(uri)

  // ws.onopen = onOpen
  // ws.onclose = onClose
  // ws.onerror = onError

  ws.onmessage = (e) => {
    let msg: WSMessage = JSON.parse(e.data)
    let handler = handlers[msg.type]
    if (handler) {
      handler(msg)
    }
  }
}
