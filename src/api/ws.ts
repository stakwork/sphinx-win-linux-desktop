// import ReconnectingWebSocket from 'reconnecting-websocket';
import socketio from 'socket.io-client';

type WSMessage = {[k: string]: any}

type DataHandler = (data: any) => void

let handlers: {[k: string]: DataHandler} = {}

export function registerWsHandlers(hs: {[k: string]: DataHandler}) {
  handlers = hs
}

let io: any = null

export function connectWebSocket(ip: string, authToken:string, connectedCallback?:Function, disconnectCallback?:Function) {
  if(io) {
    return // dont reconnect if already exists
  }
  
  io = socketio.connect(ip, {
    reconnection:true,
    transportOptions: {
      polling: {
        extraHeaders: {
          'x-user-token': authToken
        }
      }
    }
  })

  io.on('connect', socket => {
    console.log("=> socketio connected!")
    if(connectedCallback) connectedCallback()
  })

  io.on('disconnect', socket => {
    if(disconnectCallback) disconnectCallback()
  })

  io.on('message', (data) => {
    try {
      let msg: WSMessage = JSON.parse(data)
      let typ = msg.type
      if(typ==='delete') typ='deleteMessage'
      let handler = handlers[typ]
      if (handler) {
        handler(msg)
      }
    } catch(e) {}
  });

  io.on('error',function(e){
    console.log('socketio error',e)
  })
}
