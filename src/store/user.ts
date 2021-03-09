import { observable, action } from 'mobx'
import * as api from '../api'
import { randString } from '../crypto/rand'
import { persist } from 'mobx-persist'
import { uiStore } from './ui'

interface Invite {
  inviterNickname: string,
  inviterPubkey: string,
  welcomeMessage: string,
  inviterRouteHint: string,
  action: string,
}

class UserStore {

  @observable code: string = ''

  @observable invite: Invite = {
    inviterNickname: '',
    inviterPubkey: '',
    welcomeMessage: '',
    inviterRouteHint: '',
    action: '',
  }

  @persist @observable
  onboardStep: number = 0

  @persist @observable
  myid: number = 0

  @persist @observable
  alias: string = ''

  @persist @observable
  publicKey: string = ''

  @persist @observable
  currentIP: string = ''

  @persist @observable
  authToken: string = ''

  @persist @observable
  deviceId: string = ''

  @persist @observable
  tipAmount: number = 100

  @action reset() {
    this.code = ''
    this.alias = ''
    this.myid = 0
    this.publicKey = ''
    this.currentIP = ''
    this.authToken = ''
    this.deviceId = ''
    this.onboardStep = 0
    this.invite = {
      inviterNickname: '',
      inviterPubkey: '',
      welcomeMessage: '',
      inviterRouteHint: '',
      action: '',
    }
  }

  @action
  setOnboardStep(s) {
    this.onboardStep = s
  }

  @action
  setAlias(alias) {
    this.alias = alias
  }

  @action
  setMyID(id) {
    this.myid = id
  }

  @action
  setPublicKey(pubkey) {
    this.publicKey = pubkey
  }

  @action
  setCurrentIP(ip) {
    this.currentIP = ip
  }

  @action
  setAuthToken(t) {
    this.authToken = t
  }

  @action
  setTipAmount(s:number) {
    this.tipAmount = s
  }

  @action
  finishOnboard() {
    this.onboardStep = 0
    this.invite = {
      inviterNickname: '',
      inviterPubkey: '',
      welcomeMessage: '',
      inviterRouteHint: '',
      action: '',
    }
  }

  @action
  async restore(restoreString): Promise<boolean> {
    const arr = restoreString.split('::')
    if (arr.length !== 4) return false
    const priv = arr[0]
    // const pub = arr[1]
    const ip = arr[2]
    const token = arr[3]
    this.setCurrentIP(ip)
    this.setAuthToken(token)
    console.log("RESTORE NOW!")
    api.instantiateRelay(ip, token,
      () => uiStore.setConnected(true),
      () => uiStore.setConnected(false),
      this.resetIP
    )
    await sleep(650)
    return priv
  }

  @action
  async registerMyDeviceId(device_id) {
    try {
      const r = await api.relay.put(`contacts/1`, { device_id })
      if (!r) return
      if (r.device_id) {
        this.deviceId = r.device_id
      }
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async signupWithCode(code: string): Promise<{ [k: string]: string }> {
    try {
      this.code = code
      console.log("THE CODDE", code)
      const r = await api.invite.post('signup', {
        invite_string: code
      })
      if (!r) {
        console.log("no invite response")
        return
      }
      if (!r.invite) {
        console.log('no invite data')
        return
      }
      this.currentIP = r.ip
      this.invite = {
        inviterNickname: r.invite.nickname,
        inviterPubkey: r.invite.pubkey,
        inviterRouteHint: r.invite.route_hint,
        welcomeMessage: r.invite.message,
        action: r.invite.action || '',
      }
      this.setPublicKey(r.pubkey)
      api.instantiateRelay(r.ip) // no token
      return { ip: r.ip, password: r.password }
    } catch (e) {
      console.log("Error:", e)
    }
  }

  @action
  async signupWithIP(ip: string) {
    try {
      this.currentIP = ip
      this.invite = supportContact
      api.instantiateRelay(ip) // no token
      return ip
    } catch (e) {
      console.log("Error:", e)
    }
  }

  @action
  async generateToken(pwd: string) {
    if(api.relay===null && this.currentIP) {
      api.instantiateRelay(this.currentIP)
      await sleep(1)
    }
    try {
      const pubkey = this.publicKey
      const token = await randString(20)
      console.log("OK GEN TOKEN!", this.currentIP, pwd)
      const r = await api.relay.post(`contacts/tokens?pwd=${pwd}`, {
        token, pubkey,
      })
      if(!r) return console.log("=> FAILED TO REACH RELAY")
      this.authToken = token
      api.instantiateRelay(this.currentIP, token,
        () => uiStore.setConnected(true),
        () => uiStore.setConnected(false),
      )
      return token
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async finishInvite() {
    try {
      await api.relay.post('invites/finish', {
        invite_string: this.code
      })
    } catch (e) {
      console.log('could not finish invite', e)
    }
  }

  @action
  async resetIP() {
    console.log("user.RESET_IP")
    const pubkey = this.publicKey
    if (!(pubkey && pubkey.length === 66)) return
    try {
      const r = await api.invite.get(`nodes/${pubkey}`)
      if (!(r && r.node_ip)) return
      console.log("NEW IP", r.node_ip)
      this.currentIP = r.node_ip
      return r.node_ip
    } catch (e) {
      console.log("Error:", e)
    }
  }

  @action
  async testinit() {
  }

}

export const userStore = new UserStore()

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const supportContact = {
  inviterNickname: 'Sphinx Support',
  inviterPubkey: '023d70f2f76d283c6c4e58109ee3a2816eb9d8feb40b23d62469060a2b2867b77f',
  welcomeMessage: 'Welcome to Sphinx!',
  action: '',
  inviterRouteHint: '',
  pubkey: '',
}