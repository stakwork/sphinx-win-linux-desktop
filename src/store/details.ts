import { observable, action } from 'mobx'
import { relay } from '../api'
import { persist } from 'mobx-persist'

class DetailsStore {
  @persist @observable
  balance: number = 0

  @action
  async getBalance() {
    try {
      const r = await relay.get('balance')
      // console.log("===========>",r)
      if (!r) return
      const b = r.balance && parseInt(r.balance)
      this.balance = b || 0
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async addToBalance(x: number) {
    this.balance = this.balance + x
  }

  @action
  async getPayments() {
    try {
      const r = await relay.get('payments')
      return r
    } catch (e) {
      console.log(e)
    }
  }

  @observable logs: string = ''
  @action
  async getLogs() {
    try {
      const r = await relay.get('logs')
      if (r) this.logs = r
    } catch (e) {
      console.log(e)
    }
  }
  @action
  async clearLogs() {
    this.logs = ''
  }

  @action
  async getVersions() {
    try {
      const r = await relay.get('app_versions')
      if (r) return r
    } catch (e) {
      console.log(e)
    }
  }

  @action reset() {
    this.balance = 0
    this.logs = ''
  }

}

export const detailsStore = new DetailsStore()