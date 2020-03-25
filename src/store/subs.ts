import { observable, action } from 'mobx'
import {relay} from '../api'

interface Sub {
  id: number
  chat_id: number
  contact_id: number
  cron: string
  amount: number
  total_paid: number
  end_number: number
  end_date: string
  count: number
  ended: boolean
  paused: boolean
  created_at: string
  updated_at: string
  interval: string
  next: string
}

class SubStore {
  @observable
  subs: Sub[] = []

  @action
  async getSubs() {
    try {
      const r = await relay.get('subscriptions')
      this.subs = r
    } catch(e) {
      console.log(e)
    }
  }

  @action
  setSubs(subs) {
    this.subs = subs
  }
}

export const subStore = new SubStore()