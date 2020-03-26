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

  @action
  setAlias(alias){
    this.alias = alias
  }

  @action
  setPublicKey(pubkey){
    this.publicKey = pubkey
  }

  @action
  async signupWithCode(code:string) {
    try {
      this.code = code
      const r = await api.invite.post('signup',{
        invite_string:code
      })
      if(!r.invite) return console.log('no invite data')
      this.currentIP = r.ip
      this.invite={
        inviterNickname: r.invite.nickname,
        inviterPubkey: r.invite.pubkey,
        welcomeMessage: r.invite.message
      }
      api.instantiateRelay(r.ip) // just token
      return r.ip
    } catch(e) {
      console.log("Error:",e)
    }
  }

  @action
  async generateToken() {
    try {
      const token = await randString(20)
      await api.relay.post(`contacts/tokens`,{
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
}

export const userStore = new UserStore()

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}