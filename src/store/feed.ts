import { action } from 'mobx'
import {msgStore} from './msg'
import {userStore} from './user'

type DestinationType = 'wallet' | 'node'
interface Destination {
  address: string
  split: number
  type: DestinationType
}

export class FeedStore {

  @action sendPayments(dests:Destination[], memo:string) {
    asyncForEach(dests, async (d:Destination)=>{
      if(d.type==='node') {
        if(d.address===userStore.publicKey) return
        await msgStore.sendAnonPayment({
          dest: d.address,
          amt: 3,
          memo,
        })
      }
      if(d.type==='wallet'){
        await msgStore.payInvoice({
          payment_request: d.address,
          amount: 3
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
