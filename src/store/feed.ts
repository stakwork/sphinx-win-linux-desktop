import { action } from 'mobx'
import {msgStore} from './msg'
import {userStore} from './user'

type DestinationType = 'wallet' | 'node'
export interface Destination {
  address: string
  split: number
  type: DestinationType
}

export class FeedStore {

  @action sendPayments(dests:Destination[], memo:string, price:number) {
    asyncForEach(dests, async (d:Destination)=>{
      const amt = Math.max(Math.round((d.split/100)*price), 1)
      if(d.type==='node') {
        if(!d.address) return
        if(d.address===userStore.publicKey) return
        if(d.address.length!==66) return
        await msgStore.sendAnonPayment({
          dest: d.address, amt, memo,
        })
      }
      if(d.type==='wallet'){
        await msgStore.payInvoice({
          payment_request: d.address,
          amount: amt
        })
      }
    })
  }

}

export const feedStore = new FeedStore()

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
