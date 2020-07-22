import { observable, action } from 'mobx'
import {relay, composeAPI} from '../api'
import { persist } from 'mobx-persist'
import {userStore} from './user'
import moment from 'moment'

export interface Server {
  host: string
  token: string
}

const DEFAULT_MEME_SERVER = 'memes.sphinx.chat'

class MemeStore {
  @persist('list') @observable
  servers: Server[] = [
    {host:DEFAULT_MEME_SERVER,token:''}
  ]

  @action getDefaultServer(): Server {
    const server = this.servers.find(s=> s.host===DEFAULT_MEME_SERVER)
    return server
  }

  @action
  async authenticateAll() {
    this.servers.forEach(s=>{
      this.authenticate(s)
    })
  }

  @action 
  async authenticate(server) {
    const pubkey = userStore.publicKey
    if(!pubkey) return

    const meme = composeAPI(server.host)
    const r = await meme.get('ask')
    if(!(r&&r.challenge)) return

    const r2 = await relay.get(`signer/${r.challenge}`)
    if(!(r2&&r2.sig)) return

    const r3 = await meme.post('verify', {
      id: r.id, sig: r2.sig, pubkey
    }, 'application/x-www-form-urlencoded')
    if(!(r3&&r3.token)) return
    server.token = r3.token
  }

  @observable cacheEnabled: boolean = false
  @action checkCacheEnabled() {
    this.cacheEnabled = window&&window.indexedDB?true:false
  }

  @persist('object') @observable cache: {[k:string]:string} = {}
  @persist('object') @observable cacheTS: {[k:string]:number} = {}
  @action addToCache(muid:string,data:string){
    this.cache[muid] = data
    this.cacheTS[muid] = moment().unix()
  }

}

export const memeStore = new MemeStore()