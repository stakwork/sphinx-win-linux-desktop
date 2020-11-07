import { contactStore } from './contacts'
import * as e2e from '../crypto/e2e'
import { chatStore } from './chats'
import { constants } from '../constants'
import { Msg, MAX_MSGS_PER_CHAT } from './msg'

export async function encryptText({ contact_id, text }) {
  if (!text) return ''
  const contact = contactStore.contacts.find(c => c.id === contact_id)
  if (!contact) return ''
  const encText = await e2e.encryptPublic(text, contact.contact_key)
  return encText
}

export async function makeRemoteTextMap({ contact_id, text, chat_id }, includeSelf?) {
  const idToKeyMap = {}
  const remoteTextMap = {}
  const chat = chat_id && chatStore.chats.find(c => c.id === chat_id)
  if (chat) {
    // TRIBE
    if (chat.type === constants.chat_types.tribe && chat.group_key) {
      idToKeyMap['chat'] = chat.group_key // "chat" is the key for tribes
      if (includeSelf) {
        const me = contactStore.contacts.find(c => c.id === 1) // add in my own self (for media_key_map)
        if (me) idToKeyMap[1] = me.contact_key
      }
    } else { // NON TRIBE
      const contactsInChat = contactStore.contacts.filter(c => {
        if (includeSelf) {
          return chat.contact_ids.includes(c.id)
        } else {
          return chat.contact_ids.includes(c.id) && c.id !== 1
        }
      })
      contactsInChat.forEach(c => idToKeyMap[c.id] = c.contact_key)
    }
  } else {
    // console.log(contactStore.contacts, contact_id)
    const contact = contactStore.contacts.find(c => c.id === contact_id)
    if (contact) idToKeyMap[contact_id] = contact.contact_key
  }
  for (let [id, key] of Object.entries(idToKeyMap)) {
    const encText = await e2e.encryptPublic(text, String(key))
    remoteTextMap[id] = encText
  }
  return remoteTextMap
}

export async function decodeSingle(m: Msg) {
  if (m.type === constants.message_types.keysend) {
    return m // "keysend" type is not e2e
  }
  const msg = m
  if (m.message_content) {
    const dcontent = await e2e.decryptPrivate(m.message_content)
    msg.message_content = dcontent
  }
  if (m.media_key) {
    const dmediakey = await e2e.decryptPrivate(m.media_key)
    msg.media_key = dmediakey
  }
  return msg
}

export async function decodeMessages(messages: Msg[]) {
  const msgs = []
  for (const m of messages) {
    const msg = await decodeSingle(m)
    msgs.push(msg)
  }
  return msgs
}

export function orgMsgs(messages: Msg[]) {
  const orged: { [k: number]: Msg[] } = {}
  messages.forEach(msg => {
    if (msg.chat_id) {
      putIn(orged, msg, msg.chat_id)
    }
  })
  return orged
}

export function orgMsgsFromExisting(allMsgs: { [k: number]: Msg[] }, messages: Msg[]) {
  const allms: { [k: number]: Msg[] } = JSON.parse(JSON.stringify(allMsgs))
  messages.forEach(msg => {
    if (msg.chat_id || msg.chat_id === 0) {
      putIn(allms, msg, msg.chat_id) // THIS IS TOO HEAVY in a for each
    }
  })
  // limit to 50 each?
  return allms
}

export function putInReverse(allms, decoded) {
  decoded.forEach(msg => {
    if (msg.chat_id || msg.chat_id === 0) {
      const chatID = msg.chat_id
      if (allms[chatID]) {
        if (!Array.isArray(allms[chatID])) return
        const idx = allms[chatID].findIndex(m => m.id === msg.id)
        if (idx === -1 && allms[chatID].length < MAX_MSGS_PER_CHAT) {
          allms[chatID].push(skinny(msg))
        } else {
          allms[chatID][idx] = skinny(msg)
        }
      } else {
        allms[chatID] = [skinny(msg)]
      }
    }
  })
  return allms
}

export function putIn(orged, msg, chatID) {
  if (!(chatID || chatID === 0)) return
  if (orged[chatID]) {
    if (!Array.isArray(orged[chatID])) return
    const idx = orged[chatID].findIndex(m => m.id === msg.id)
    if (idx === -1) {
      orged[chatID].unshift(skinny(msg))
      if (orged[chatID].length > MAX_MSGS_PER_CHAT) {
        orged[chatID].pop() // remove the oldest msg if too many
      }
    } else {
      orged[chatID][idx] = skinny(msg)
    }
  } else {
    orged[chatID] = [skinny(msg)]
  }
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
function chunkArray(arr, len) {
  var chunks = [],
    i = 0,
    n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
}

export function skinny(m: Msg): Msg {
  return { ...m, chat: null, remote_message_content:null }
}
