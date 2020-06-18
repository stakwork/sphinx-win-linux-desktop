import { observable, action } from 'mobx'
import {relay, composeAPI} from '../api'
import { persist } from 'mobx-persist'
import {userStore} from './user'
import {Linking} from 'react-native'

export interface Server {
  host: string
}

const DEFAULT_AUTH_SERVER = 'auth.sphinx.chat'

class AuthStore {
  @persist('list') @observable
  servers: Server[] = [
    {host:DEFAULT_AUTH_SERVER}
  ]

  @action getDefaultServer(): Server {
    const server = this.servers.find(s=> s.host===DEFAULT_AUTH_SERVER)
    return server
  }

  @action 
  async verify(id,challenge) {
    const pubkey = userStore.publicKey
    if(!pubkey) return

    const authServer = this.getDefaultServer()

    const r = await relay.get(`signer/${challenge}`)
    if(!(r&&r.sig)) return

    var q = new URLSearchParams({
      id,
      sig:r.sig,
      pubkey:pubkey,
    }).toString();
    const url = 'https://'+authServer.host+'/oauth_verify?'+q

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        console.log("Don't know how to open URI: " + url)
      }
    })
  }

}

export const authStore = new AuthStore()