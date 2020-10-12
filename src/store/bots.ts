import { observable, action } from 'mobx'
import {relay} from '../api'

export interface Bot {
  id: string
  chat_id: number,
  name: string
  secret: string
  created_at: string
  updated_at: string
}

class BotStore {
  @observable
  bots: Bot[] = []

  @action async getBots() {
    const r = await relay.get('bots')
    if(r&&r.bots) {
      this.bots = r.bots
    }
  }

  @action async getBotsForTribe(chat_id:number) {
    const r = await relay.get(`bots/${chat_id}`)
    if(r&&r.bots) {
      this.bots = r.bots
    }
  }

  @action async createBot(name: string, webhook:string){
    const r = await relay.post('bot', {
      name, webhook
    })
    if(r){
      console.log(r)
      this.bots.push(r)
    }
  }

  @action async deleteBot(id: string){
    const r = await relay.del(`bot/${id}`)
    if(r){
      this.bots = this.bots.filter(b=> b.id!==id)
    }
  }

  @action reset(){
    this.bots = []
  }

}

export const botStore = new BotStore()