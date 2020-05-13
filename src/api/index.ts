
import API from './api'
import {connectWebSocket, registerWsHandlers} from './ws'
import * as wsHandlers from '../store/websocketHandlers'

const invite = new API('http://hub.sphinx.chat/api/v1/','','')

let relay = null

function instantiateRelay(ip:string, authToken?:string){
  if(!ip) return console.log("cant instantiate Relay, no IP")

  let protocol = 'http'
  if(ip.endsWith('nodl.it')) {
    protocol='https'
  }
  if(ip.endsWith('nodes.sphinx.chat')) {
    protocol='https'
  }
  
  if(authToken){
    relay = new API(`${protocol}://${ip}/`, 'x-user-token', authToken)
  } else {
    relay = new API(`${protocol}://${ip}/`)
  }
  console.log('=> instantiated relay!', `${protocol}://${ip}/`)
  
  if(authToken) { // only connect here (to avoid double) if auth token means for real
    connectWebSocket(ip)
    registerWsHandlers(wsHandlers)
  }

  // registerHandler each msg type here?
  // or just one?
}

function reconnectWebsocket(ip:string){
  connectWebSocket(ip)
  registerWsHandlers(wsHandlers)
}

function composeMeme(host:string, authToken?:string) {
  let meme = null
  if(authToken) {
    meme = new API(`https://${host}/`, 'Authorization', `Bearer ${authToken}`)
  } else {
    meme = new API(`https://${host}/`)
  }
  return meme
}

export {
  invite,
  relay,
  instantiateRelay,
  composeMeme,
  reconnectWebsocket,
}
