import { observable, action } from 'mobx'
import {relay, composeMeme} from '../api'
import { persist } from 'mobx-persist'
import {userStore} from './user'

export interface Server {
  host: string
  token: string
}

class MemeStore {
  @persist('list') @observable
  servers: Server[] = [
    {host:'memes.sphinx.chat',token:''}
  ]

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

    const meme = composeMeme(server.host)
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

}

export const memeStore = new MemeStore()