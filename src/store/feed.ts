import { action } from 'mobx'
import { chatStore } from './chats'
import { relay } from '../api'

export const NUM_SECONDS = 60

type DestinationType = 'wallet' | 'node'
export interface Destination {
  address: string
  split: number
  type: DestinationType
}

export interface StreamPayment {
  feedID: number
  itemID: number
  ts: number
  speed?: string,
  title?: string
  text?: string
  url?: string
  pubkey?: string
  type?: string
  uuid?: string
  amount?: number
}

export class FeedStore {

  @action async sendPayments(destinations: Destination[], text: string, amount: number, chat_id: number, update_meta: boolean) {
    await relay.post('stream', {
      destinations,
      text,
      amount,
      chat_id,
      update_meta
    })
    if(chat_id && update_meta && text) {
      let meta
      try {
        meta = JSON.parse(text)
      } catch(e) {}
      if(meta) {
        console.log("UPDATE CHAT META",meta)
        chatStore.updateChatMeta(chat_id, meta)
      }
    }
    // asyncForEach(dests, async (d: Destination) => {
    //   const amt = Math.max(Math.round((d.split / 100) * price), 1)
    //   if (d.type === 'node') {
    //     if (!d.address) return
    //     if (d.address === userStore.publicKey) return
    //     if (d.address.length !== 66) return
    //     await msgStore.sendAnonPayment({
    //       dest: d.address, amt, memo,
    //     })
    //   }
    //   if (d.type === 'wallet') {
    //     await msgStore.payInvoice({
    //       payment_request: d.address,
    //       amount: amt
    //     })
    //   }
    // })
  }

  @action
  async loadFeedById(id: string) {
    if (!id) return
    try {
      const r = await fetch(`https://tribes.sphinx.chat/podcast?id=${id}`)
      const j = await r.json()
      return j
    } catch (e) {
      console.log(e)
    }
  }

}

export const feedStore = new FeedStore()

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
