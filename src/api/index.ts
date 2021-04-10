import API from './api'
import {connectWebSocket, registerWsHandlers} from './ws'
import * as wsHandlers from '../store/websocketHandlers'
import TorConnectionStore from '../store/torConnection'

const invite = new API({
  baseURLPath: 'https://hub.sphinx.chat/api/v1/',
})


let relayAPIClient = null


type RelayAPIOptions = {
  ip: string;
  authToken?: string;
  connectedCallback?: Function;
  disconnectCallback?: Function;
  resetIPCallback?: Function;
  torConnectionStore?: TorConnectionStore;
}

export function instantiateRelayAPI({
  ip,
  authToken,
  connectedCallback = () => { },
  disconnectCallback = () => { },
  resetIPCallback = () => { },
  torConnectionStore,
}: RelayAPIOptions) {
  console.log("instantiateRelayAPI");

  if(!ip) return console.log("cant instantiate Relay, no IP")

  let protocol = 'http://'
  if(ip.endsWith('nodl.it')) {
    protocol='https://'
  }
  if(ip.endsWith('nodes.sphinx.chat')) {
    protocol='https://'
  }

  if(ip.startsWith('https://') || ip.startsWith('http://')) {
    protocol=''
  }

  if (authToken) {
    relayAPIClient = new API({
      baseURLPath: `${protocol}${ip}/`,
      authTokenKey: 'x-user-token',
      authToken,
      resetIPCallback,
      torConnectionStore,
    })
  } else {
    relayAPIClient = new API({
      baseURLPath: `${protocol}${ip}/`,
      torConnectionStore,
    })
  }

  console.log('=> instantiated relay!', `${protocol}${ip}/`, 'authToken?', Boolean(authToken))

  if(authToken) { // only connect here (to avoid double) if auth token means for real
    connectWebSocket(`${protocol}${ip}`, authToken, connectedCallback, disconnectCallback)
    registerWsHandlers(wsHandlers)
  }

  // registerHandler each msg type here?
  // or just one?
}

export function composeAPI(host:string, authTokenValue?:string) {
  const baseURLPath = `https://${host}/`

  if (authTokenValue) {
    return new API({
      baseURLPath,
      authTokenKey: 'Authorization',
      authToken: `Bearer ${authTokenValue}`
    })
  } else {
    return new API({
      baseURLPath,
    })
  }
}

export {
  invite,
  relayAPIClient,
}
