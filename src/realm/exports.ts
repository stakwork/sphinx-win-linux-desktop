import { hasData, get, update, initialLoad } from './api'
import { Platform } from 'react-native'
import {Msg} from '../store/msg'
import {orgMsgsFromRealm} from '../store/msgHelpers'

export {hasData, initialLoad}
/*** 
 * Update Msg schema in realm
***/
interface Data {
  messages: {[k: number]: Msg[]},
  lastSeen: {[k: number]: number},
  lastFetched: number,
}

export function getRealmMessages() {
  const ret:Data = {
    messages: {},
    lastSeen: {},
    lastFetched: new Date().getTime()
  }
  const hasRealmData = hasData()
  if (hasRealmData.msg) {
    const [realmMsg] = get({ schema: 'Msg' });
    const parsedData = JSON.parse(JSON.stringify(realmMsg))
    if (parsedData.messages) {
      const organizedMsgs = orgMsgsFromRealm(parsedData.messages)
      if (parsedData.lastSeen.length) {
        const obj = {}
        parsedData.lastSeen.forEach((ls: any) => {
          obj[ls.key] = ls.seen
        })
        ret.lastSeen = obj
      }
      ret.messages = organizedMsgs
    }
  }
  return ret
}

export function updateRealmMsg(data:Data) {
  if(Platform.OS==='web') return

  console.log("UPDATE DATA IN REALM NOW!")

  const hasRealmData = hasData();
  if (hasRealmData.msg) {
    const allMessages: any = [];
    Object.values(data.messages).forEach((c: any) => {
      c.forEach((msg: any) => {
        allMessages.push({
          ...msg,
          amount: parseInt(msg.amount) || 0,
        })
      })
    });

    const lastSeen = Object.keys(data.lastSeen).map((key) => ({
      key: parseInt(key),
      seen: data.lastSeen[key],
    }));

    const msgStructure = {
      messages: allMessages,
      lastSeen,
      lastFetched: data.lastFetched || null,
    }

    update({
      schema: 'Msg',
      body: { ...msgStructure },
    });
  }
}