import * as web from './web'
import * as localForage from 'localforage'

export const webStorage = web

export const DEBOUNCE_TIME = 280

export function persistMsgLocalForage(msgStore) {
  debounce(() => {
    const obj = {
      messages: msgStore.messages,
      lastSeen: msgStore.lastSeen,
      lastFetched: msgStore.lastFetched
    }
    localForage.setItem('_msg', JSON.stringify(obj))
  }, DEBOUNCE_TIME)
}

let inDebounce
function debounce(func, delay) {
  const context = this
  const args = arguments
  clearTimeout(inDebounce)
  inDebounce = setTimeout(() => func.apply(context, args), delay)
}