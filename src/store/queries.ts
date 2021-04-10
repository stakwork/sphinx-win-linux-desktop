import { action } from 'mobx'
import { relayAPIClient } from '../api'
import * as api from '../api'

export class QueryStore {

  @action async onchainAddress(app:string) {
    const r = await relayAPIClient.get(`query/onchain_address/${app}`)
    return r
  }

  @action async satsPerDollar(){
    return 5133
  }

}

export const queryStore = new QueryStore()

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
