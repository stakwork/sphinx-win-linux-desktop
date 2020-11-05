import { observable, action } from 'mobx'
import { relay, composeAPI } from '../api'
import { persist } from 'mobx-persist'
import { userStore } from './user'
import moment from 'moment'

export interface Server {
  host: string
  token: string
}

const DEFAULT_MEME_SERVER = 'memes.sphinx.chat'

class MemeStore {
  @persist('list') @observable
  servers: Server[] = [
    { host: DEFAULT_MEME_SERVER, token: '' }
  ]

  @persist @observable
  lastAuthenticated: number

  @action getDefaultServer(): Server {
    const server = this.servers.find(s => s.host === DEFAULT_MEME_SERVER)
    return server
  }

  @action
  async authenticateAll() {
    const lastAuth = this.lastAuthenticated || 0
    const days = 7  // one week
    const isOld = moment(new Date(lastAuth)).isBefore(moment().subtract((days * 24 - 1), 'hours'))
    if (isOld) {
      await asyncForEach(this.servers, async (s) => {
        await this.authenticate(s)
      })
      this.lastAuthenticated = new Date().getTime()
    }
  }

  @action
  async authenticate(server) {
    const pubkey = userStore.publicKey
    if (!pubkey) return

    const meme = composeAPI(server.host)
    const r = await meme.get('ask')
    if (!(r && r.challenge)) return

    const r2 = await relay.get(`signer/${r.challenge}`)
    if (!(r2 && r2.sig)) return

    const r3 = await meme.post('verify', {
      id: r.id, sig: r2.sig, pubkey
    }, 'application/x-www-form-urlencoded')
    if (!(r3 && r3.token)) return
    server.token = r3.token
  }

  @observable cacheEnabled: boolean = false
  @action checkCacheEnabled() {
    this.cacheEnabled = window && window.indexedDB ? true : false
  }

  @persist('object') @observable cache: { [k: string]: string } = {}
  @persist('object') @observable cacheTS: { [k: string]: number } = {}
  @persist('object') @observable cacheFileName: { [k: string]: string } = {}
  @action addToCache(muid: string, data: string, filename?: string) {
    this.cache[muid] = data
    this.cacheTS[muid] = moment().unix()
    if (filename) this.cacheFileName[muid] = filename
  }

  @persist('object') @observable filenameCache: { [k: number]: string } = {}
  @action addToFilenameCache(id: number, name: string) {
    this.filenameCache[id] = name
  }

  @action reset() {
    this.lastAuthenticated = 0
    this.cache = {}
    this.cacheTS = {}
    this.cacheFileName = {}
    this.filenameCache = {}
  }

}

export const memeStore = new MemeStore()

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}