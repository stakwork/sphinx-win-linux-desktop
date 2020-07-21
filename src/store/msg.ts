import { observable, action } from 'mobx'
import {relay} from '../api'
import {contactStore} from './contacts'
import {chatStore,Chat} from './chats'
import {detailsStore} from './details'
import * as e2e from '../crypto/e2e'
import {constants} from '../constants'
import {persist} from 'mobx-persist'
import moment from 'moment'

export interface Msg {
  id: number
  chat_id: number
  type: number
  uuid: string
  sender: number
  receiver: number
  amount: number
  amount_msat: number
  payment_hash: string
  payment_request: string
  date: string
  expiration_data: string
  message_content: string
  remote_message_content: string
  status: number
  status_map: {[k:number]:number}
  parent_id: number
  subscription_id: number
  media_type: string
  media_token: string
  media_key: string
  seen: boolean
  created_at: string
  updated_at: string,
  sender_alias: string,

  original_muid: string,
  reply_uuid: string,

  text: string,

  chat: Chat

  sold: boolean // this is a marker to tell if a media has been sold
  showInfoBar: boolean // marks whether to show the date and name

  reply_message_content: string
  reply_message_sender_alias: string

  temp_uid: string // tempory unique id to mark the sent msg, so once returned it we can fill will all values
}

class MsgStore {
  @persist('object')
  @observable // chat id: message array
  messages: {[k:number]:Msg[]} = {}

  @persist('object') @observable
  lastSeen: {[k:number]:number} = {} // {chat_id: new Date().getTime()}

  @persist @observable
  lastFetched: number

  @action clearAllMessages(){
    this.messages = {}
  }

  @action
  async getAllMessages() {
    try {
      const r = await relay.get('messages')
      const msgs = await decodeMessages(r.new_messages)
      this.messages = orgMsgs(msgs)
      this.lastFetched = new Date().getTime()
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async getMessages() {
    let route = 'messages'
    if(this.lastFetched) {
      const mult = 1
      const dateq = moment.utc(this.lastFetched-1000000*mult).format('YYYY-MM-DD%20HH:mm:ss')
      route += `?date=${dateq}`
    } else {
      const start = moment().subtract(28, 'days').format('YYYY-MM-DD%20HH:mm:ss')
      route += `?date=${start}`
    }
    try {
      const r = await relay.get(route)
      const msgs = await decodeMessages(r.new_messages) // this takes a longass time
      msgs.sort((a,b)=> moment(a.date).unix() - moment(b.date).unix())
      this.messages = orgMsgsFromExisting(this.messages, msgs)
      this.lastFetched = new Date().getTime()
    } catch(e) {
      console.log(e)
    }
  }

  @action // only if it contains a "chat"
  async gotNewMessage(m) {
    let newMsg = await decodeSingle(m)
    const chatID = (newMsg.chat && newMsg.chat.id) || newMsg.chat_id
    if(chatID){
      putIn(this.messages, newMsg, chatID)
      if(newMsg.chat) chatStore.gotChat(newMsg.chat)
    }
  }

  async messagePosted(m) {
    let newMsg = await decodeSingle(m)
    if(newMsg.chat && newMsg.chat.id){
      const idx = this.messages[newMsg.chat.id].findIndex(m=>m.id===-1)
      if(idx>-1){
        this.messages[newMsg.chat.id][idx] = {
          ...m,
          status: this.messages[newMsg.chat.id][idx].status
        }
      }
    }
  }

  @action
  async invoicePaid(m) {
    if(m.chat && m.chat.id){
      const msgs = this.messages[m.chat.id]
      if(msgs) {
        const invoice = msgs.find(c=>c.payment_hash===m.payment_hash)
        if(invoice){
          invoice.status = constants.statuses.confirmed
        }
      }
    }
    if(m.amount) detailsStore.addToBalance(m.amount*-1)
  }

  @action
  async sendMessage({contact_id, text, chat_id, amount, reply_uuid}) {
    try {
      const encryptedText = await encryptText({contact_id:1, text})
      const remote_text_map = await makeRemoteTextMap({contact_id, text, chat_id})
      const v = {
        contact_id,
        chat_id: chat_id||null,
        text: encryptedText,
        remote_text_map,
        amount:amount||0,
        reply_uuid
      }
      // const r = await relay.post('messages', v)
      // this.gotNewMessage(r)
      if(!chat_id) {
        const r = await relay.post('messages', v)
        // console.log("GOT IT BABY@",r)
        this.gotNewMessage(r)
      } else {
        putIn(this.messages, {...v,id:-1,sender:1,date:moment().toISOString(),type:0,message_content:text}, chat_id)
        const r = await relay.post('messages', v)
        // console.log("RESULT")
        this.messagePosted(r)
      }
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async sendAttachment({contact_id, text, chat_id, muid, media_type, media_key, price, amount}) {
    try {
      const media_key_map = await makeRemoteTextMap({contact_id, text:media_key, chat_id}, true)
      const v:{[k:string]:any} = {
        contact_id,
        chat_id: chat_id||null,
        muid,
        media_type,
        media_key_map,
        amount:amount||0
      }
      if(price) v.price=price
      if(text){
        const encryptedText = await encryptText({contact_id:1, text})
        const remote_text_map = await makeRemoteTextMap({contact_id, text, chat_id})
        v.text = encryptedText
        v.remote_text_map = remote_text_map
      }
      // return
      const r = await relay.post('attachment', v)
      this.gotNewMessage(r)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async setMessageAsReceived(m) {
    if(!(m.chat)) return
    const msgsForChat = this.messages[m.chat.id]
    const ogMessage = msgsForChat.find(msg=> msg.id===m.id || msg.id===-1)
    if(ogMessage) {
      ogMessage.status = constants.statuses.received
    }
  }

  @action
  async sendPayment({contact_id, amt, chat_id, destination_key}) {
    try {
      const v = {
        contact_id: contact_id||null,
        chat_id: chat_id||null,
        amount: amt,
        destination_key
      }
      const r = await relay.post('payment', v)
      if(contact_id||chat_id) this.gotNewMessage(r)
      if(r.amount) detailsStore.addToBalance(r.amount)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async purchaseMedia({contact_id, amount, chat_id, media_token}) {
    try {
      const v = {
        contact_id: contact_id||null,
        chat_id: chat_id||null,
        amount: amount,
        media_token: media_token
      }
      const r = await relay.post('purchase', v)
      console.log(r)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async sendInvoice({contact_id, amt, chat_id, memo}) {
    try {
      const myenc = await encryptText({contact_id:1, text:memo})
      const encMemo = await encryptText({contact_id, text:memo})
      const v = {
        contact_id,
        chat_id: chat_id||null,
        amount: amt,
        memo: myenc,
        remote_memo: encMemo,
      }
      const r = await relay.post('invoices', v) // raw invoice: 
      this.gotNewMessage(r)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async createRawInvoice({amt,memo}) {
    try {
      const v = {amount: amt, memo}
      const r = await relay.post('invoices', v)
      return r
      // r = {invoice: payment_request}
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async payInvoice({payment_request,amount}) {
    try {
      const v = {payment_request}
      const r = await relay.put('invoices', v)
      this.invoicePaid({...r,amount})
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async deleteMessage(id) {
    if(!id) return console.log("NO ID!")
    const r = await relay.del(`message/${id}`)
    if(r.chat && r.chat.id) {
      putIn(this.messages, r, r.chat.id)
    }
  }

  @action
  seeChat(id) {
    if(!id) return
    this.lastSeen[id] = new Date().getTime()
  }

  @action
  initLastSeen() {
    const obj = this.lastSeen?{...this.lastSeen}:{}
    chatStore.chats.forEach(c=>{
      if(!obj[c.id]) obj[c.id] = new Date().getTime()
    })
    this.lastSeen = obj
  }

}

async function encryptText({contact_id, text}) {
  if(!text) return ''
  const contact = contactStore.contacts.find(c=> c.id===contact_id)
  if(!contact) return ''
  const encText = await e2e.encryptPublic(text, contact.contact_key)
  return encText
}

async function makeRemoteTextMap({contact_id, text, chat_id}, includeSelf?){
  const idToKeyMap = {}
  const remoteTextMap = {}
  const chat = chat_id && chatStore.chats.find(c=> c.id===chat_id)
  if(chat){
    // TRIBE
    if(chat.type===constants.chat_types.tribe && chat.group_key) {
      idToKeyMap['chat'] = chat.group_key // "chat" is the key for tribes
      if(includeSelf) {
        const me = contactStore.contacts.find(c=> c.id===1) // add in my own self (for media_key_map)
        if(me) idToKeyMap[1] = me.contact_key
      }
    } else { // NON TRIBE
      const contactsInChat = contactStore.contacts.filter(c=>{
        if(includeSelf){
          return chat.contact_ids.includes(c.id)
        } else {
          return chat.contact_ids.includes(c.id) && c.id!==1
        }
      })
      contactsInChat.forEach(c=> idToKeyMap[c.id]=c.contact_key)
    }
  } else {
    console.log(contactStore.contacts, contact_id)
    const contact = contactStore.contacts.find(c=> c.id===contact_id)
    if(contact) idToKeyMap[contact_id] = contact.contact_key
  }
  for (let [id, key] of Object.entries(idToKeyMap)) {
    const encText = await e2e.encryptPublic(text, String(key))
    remoteTextMap[id] = encText
  }
  return remoteTextMap
}

async function decodeSingle(m: Msg){
  const msg = m
  if(m.message_content) {
    const dcontent = await e2e.decryptPrivate(m.message_content)
    msg.message_content = dcontent
  }
  if(m.media_key){
    const dmediakey = await e2e.decryptPrivate(m.media_key)
    msg.media_key = dmediakey
  }
  return msg
}

async function decodeMessages(messages: Msg[]){
  const msgs = []
  for (const m of messages) {
    const msg = await decodeSingle(m)
    msgs.push(msg)
  }
  return msgs
}

function orgMsgs(messages: Msg[]) {
  const orged: {[k:number]:Msg[]} = {}
  messages.forEach(msg=>{
    if(msg.chat && msg.chat.id){
      putIn(orged, msg, msg.chat.id)
    }
  })
  return orged
}

function orgMsgsFromExisting(allMsgs: {[k:number]:Msg[]}, messages: Msg[]) {
  const allms: {[k:number]:Msg[]} = JSON.parse(JSON.stringify(allMsgs))
  messages.forEach(msg=>{
    if(msg.chat && msg.chat.id){
      putIn(allms, msg, msg.chat.id) // THIS IS TOO HEAVY in a for each
    }
  })
  // limit to 50 each?
  return allms
}

function putIn(orged, msg, chatID){
  if(!chatID) return
  if(orged[chatID]){
    if(!Array.isArray(orged[chatID])) return
    const idx = orged[chatID].findIndex(m=>m.id===msg.id)
    if(idx===-1) {
      orged[chatID].unshift(msg)
    } else {
      orged[chatID][idx] = msg
    }
  } else {
    orged[chatID] = [msg]
  }
}

export const msgStore = new MsgStore()

function rando(){
  return Math.random().toString(12).substring(0)
}