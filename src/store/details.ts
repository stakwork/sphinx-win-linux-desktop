import { observable, action } from 'mobx'
import {relay} from '../api'
import { persist } from 'mobx-persist'

class DetailsStore {
  @persist @observable
  balance: number = 0

  @action
  async getBalance() {
    try {
      const r = await relay.get('balance')
      const b = r.balance && parseInt(r.balance)
      this.balance = b||0
    } catch(e) {
      console.log(e)
    }
  }
}

export const detailsStore = new DetailsStore()