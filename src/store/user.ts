import { observable, action } from 'mobx'
import * as api from '../api'
import {randString} from '../crypto/rand'
import { persist } from 'mobx-persist'

class UserStore {

  @observable code: string = ''

  @observable invite: {[k:string]:string} = {}

  @persist @observable 
  alias: string = ''

  @persist @observable 
  publicKey: string = ''

  @persist @observable
  currentIP: string = ''//'3.93.12.68'

  @persist @observable
  authToken: string = ''//'Th/PW7RMUsxBbHozqsLMctf2ak4='

  @persist @observable
  deviceId: string = ''

  @action
  setAlias(alias){
    this.alias = alias
  }

  @action
  setPublicKey(pubkey){
    this.publicKey = pubkey
  }

  @action
  async registerMyDeviceId(device_id) {
    try {
      const r = await api.relay.put(`contacts/1`, {device_id})
      if(r.device_id) {
        this.deviceId = r.device_id
      }
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async signupWithCode(code:string): Promise<{[k:string]:string}> {
    try {
      this.code = code
      const r = await api.invite.post('signup',{
        invite_string:code
      })
      console.log("signup r",r)
      if(!r.invite) {
        console.log('no invite data')
        return 
      }
      this.currentIP = r.ip
      this.invite={
        inviterNickname: r.invite.nickname,
        inviterPubkey: r.invite.pubkey,
        welcomeMessage: r.invite.message
      }
      api.instantiateRelay(r.ip) // no token
      return {ip: r.ip, password: r.password}
    } catch(e) {
      console.log("Error:",e)
    }
  }

  @action
  async signupWithIP(ip:string) {
    try {
      this.currentIP = ip
      this.invite={
        inviterNickname: 'Sphinx Support',
        inviterPubkey: '0292052c3ab594f7b5e997099f66e8ed51b4342126dcb5c3caa76b38adb725dcdb',
        welcomeMessage: 'Welcome to Sphinx!'
      }
      api.instantiateRelay(ip) // no token
      return ip
    } catch(e) {
      console.log("Error:",e)
    }
  }

  @action
  async generateToken(pwd:string) {
    try {
      const token = await randString(20)
      await api.relay.post(`contacts/tokens?pwd=${pwd}`,{
        token
      })
      this.authToken = token
      api.instantiateRelay(this.currentIP, token)
      return token
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async finishInvite(){
    try{
      await api.relay.post('invites/finish',{
        invite_string: this.code
      })
    } catch(e) {
      console.log('could not finish invite', e)
    }
  }

  @action
  async reconnectWebsocket(){
    api.reconnectWebsocket(this.currentIP)
  }
}

export const userStore = new UserStore()

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}