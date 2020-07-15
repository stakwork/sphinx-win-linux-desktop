// import ReconnectingWebSocket from 'reconnecting-websocket';
import socketio from 'socket.io-client';

type WSMessage = {[k: string]: any}

type DataHandler = (data: any) => void

let handlers: {[k: string]: DataHandler} = {}

export function registerWsHandlers(hs: {[k: string]: DataHandler}) {
  handlers = hs
}

let io: any = null

export function connectWebSocket(ip: string) {
  if(io) return // dont reconnect if already exists

  let theIP = ip
  if(ip.startsWith('https://')) {
    theIP=ip.replace('https://','')
  }
  if(ip.startsWith('http://')) {
    theIP=ip.replace('http://','')
  }

  const uri = 'ws://' + theIP
  // const rws = new ReconnectingWebSocket(uri);
  io = socketio.connect(uri, {
    reconnection:true,
  })

  io.on('connect', socket => {
    console.log("=> socketio connected!")
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
