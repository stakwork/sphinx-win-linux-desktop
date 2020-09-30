import { observable, action } from 'mobx'
import * as api from '../api'
import {randString} from '../crypto/rand'
import { persist } from 'mobx-persist'
import {uiStore} from './ui'

class UserStore {

  @observable code: string = ''

  @observable invite: {[k:string]:string} = {}

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

  @action
  setAlias(alias){
    this.alias = alias
  }

  @action
  setPublicKey(pubkey){
    this.publicKey = pubkey
  }

  @action
  setCurrentIP(ip){
    this.currentIP = ip
  }

  @action
  setAuthToken(t){
    this.authToken = t
  }

  @action
  async restore(restoreString): Promise<boolean> {
    const arr = restoreString.split('::')
    if(arr.length!==4) return false
    const priv = arr[0]
    // const pub = arr[1]
    const ip = arr[2]
    const token = arr[3]
    this.setCurrentIP(ip)
    this.setAuthToken(token)
    console.log("RESTORE NOW!")
    api.instantiateRelay(ip, token, 
      ()=>uiStore.setConnected(true),
      ()=>uiStore.setConnected(false),
    )
    await sleep(650)
    return priv
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
      this.invite=supportContact
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
      console.log("OK GEN TOKEN!",this.currentIP,pwd)
      await api.relay.post(`contacts/tokens?pwd=${pwd}`,{
        token
      })
      this.authToken = token
      api.instantiateRelay(this.currentIP, token,
        ()=>uiStore.setConnected(true),
        ()=>uiStore.setConnected(false),  
      )
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

}

export const userStore = new UserStore()

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

const supportContact={
  inviterNickname: 'Sphinx Support',
  inviterPubkey: '023d70f2f76d283c6c4e58109ee3a2816eb9d8feb40b23d62469060a2b2867b77f',
  welcomeMessage: 'Welcome to Sphinx!'
}