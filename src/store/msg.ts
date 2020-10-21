import { observable, action } from 'mobx'
import {relay} from '../api'
import {chatStore,Chat} from './chats'
import {detailsStore} from './details'
import {constants} from '../constants'
import {persist} from 'mobx-persist'
import moment from 'moment'
import {encryptText, makeRemoteTextMap, decodeSingle, decodeMessages, orgMsgsFromExisting, orgMsgs, putIn, putInReverse} from './msgHelpers'

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
  reply_message_sender: number

  temp_uid: string // tempory unique id to mark the sent msg, so once returned it we can fill will all values
}

export const MAX_MSGS_PER_CHAT = 100

class MsgStore {
  @persist('object')
  @observable // chat id: message array
  messages: {[k:number]:Msg[]} = {}

  @persist('object') @observable
  lastSeen: {[k:number]:number} = {} // {chat_id: new Date().getTime()}

  @persist @observable
  lastFetched: number

  @persist @observable
  lastUpdated: number

  @action clearAllMessages(){
    this.messages = {}
  }

  @action reset(){
    this.messages = {}
    this.lastSeen = {}
    this.lastFetched = 0
    this.lastUpdated = 0
  }

  @action
  async getAllMessages() {
    try {
      const r = await relay.get('messages')
      if(!r) return
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
      const dateq = moment.utc(this.lastFetched-1000*mult).format('YYYY-MM-DD%20HH:mm:ss')
      route += `?date=${dateq}`
    } else { // else just get last week
      const days = 7
      const start = moment().subtract(days, 'days').format('YYYY-MM-DD%20HH:mm:ss')
      route += `?date=${start}`
    }
    try {
      const r = await relay.get(route)
      if(!r) return
      console.log("=> NEW MSGS LENGTH", r.new_messages.length)
      if(r.new_messages && r.new_messages.length) {
        await this.batchDecodeMessages(r.new_messages)
      } else {
        this.sortAllMsgs(null)
      }
    } catch(e) {
      console.log(e)
    }
  }

  async batchDecodeMessages(msgs: Msg[]){
    this.lastFetched = new Date().getTime()
    const first10 = msgs.slice(msgs.length-10)
    const rest = msgs.slice(0,msgs.length-10)
    const decodedMsgs = await decodeMessages(first10)
    this.messages = orgMsgsFromExisting(this.messages, decodedMsgs)
    console.log("OK! FIRST 10!")

    this.reverseDecodeMessages(rest.reverse())
  }

  // push it in reverse, to show latest at first, then put in older ones
  async reverseDecodeMessages(msgs: Msg[]){
    const decoded = await decodeMessages(msgs)
    const allms: {[k:number]:Msg[]} = JSON.parse(JSON.stringify(this.messages))
    putInReverse(allms, decoded)
    this.sortAllMsgs(allms)
    console.log("NOW ALL ARE DONE!")
  }

  sortAllMsgs(allms:{[k:number]:Msg[]}){
    const final = {}
    let toSort:{[k:number]:Msg[]} = allms || JSON.parse(JSON.stringify(this.messages))
    Object.entries(toSort).forEach((entries)=>{
      const k = entries[0]
      const v: Msg[] = entries[1]
      v.sort((a,b)=> moment(b.date).unix() - moment(a.date).unix())
      final[k] = v
    })
    this.messages = final
  }

  async messagePosted(m) {
    let newMsg = await decodeSingle(m)
    if(newMsg.chat_id){
      const idx = this.messages[newMsg.chat_id].findIndex(m=>m.id===-1)
      if(idx>-1){
        this.messages[newMsg.chat_id][idx] = {
          ...m,
          status: this.messages[newMsg.chat_id][idx].status
        }
      }
    }
  }

  @action
  async invoicePaid(m) {
    if(m.chat_id){
      const msgs = this.messages[m.chat_id]
      if(msgs) {
        const invoice = msgs.find(c=>c.payment_hash===m.payment_hash)
        if(invoice){
          invoice.status = constants.statuses.confirmed
          this.lastUpdated = new Date().getTime()
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
        if(!r) return
        this.gotNewMessage(r)
      } else {
        putIn(this.messages, {...v,id:-1,sender:1,date:moment().toISOString(),type:0,message_content:text}, chat_id)
        const r = await relay.post('messages', v)
        if(!r) return
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
      if(!r) return
      this.gotNewMessage(r)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async setMessageAsReceived(m) {
    if(!(m.chat_id)) return
    const msgsForChat = this.messages[m.chat_id]
    const ogMessage = msgsForChat && msgsForChat.find(msg=> msg.id===m.id || msg.id===-1)
    if(ogMessage) {
      ogMessage.status = constants.statuses.received
    } else { // add anyway (for on another app)
      this.gotNewMessage(m)
    }
  }

  @action
  async sendPayment({contact_id, amt, chat_id, destination_key, memo}) {
    try {
      const myenc = await encryptText({contact_id:1, text:memo})
      const encMemo = await encryptText({contact_id, text:memo})
      const v = {
        contact_id: contact_id||null,
        chat_id: chat_id||null,
        amount: amt,
        destination_key,
        text: myenc,
        remote_text: encMemo
      }
      const r = await relay.post('payment', v)
      if(!r) return
      if(contact_id||chat_id) this.gotNewMessage(r)
      if(r.amount) detailsStore.addToBalance(r.amount*-1)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async sendAnonPayment({amt, dest, memo}) {
    try {
      const v = {
        amount: amt,
        destination_key: dest,
        text: memo,
      }
      const r = await relay.post('payment', v)
      if(!r) return
      if(r.amount) detailsStore.addToBalance(r.amount*-1)
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
      if(!r) return
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
  filterMessagesByContent(chatID,filterString) {
    const list = this.messages[chatID]
    if(!list) return []
    return list.filter(m=> m.message_content.includes(filterString))
  }

  @action
  async payInvoice({payment_request,amount}) {
    try {
      const v = {payment_request}
      const r = await relay.put('invoices', v)
      if(!r) return
      this.invoicePaid({...r,amount})
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async deleteMessage(id) {
    if(!id) return console.log("NO ID!")
    const r = await relay.del(`message/${id}`)
    if(!r) return
    if(r.chat_id) {
      putIn(this.messages, r, r.chat_id)
    }
  }

  @action
  seeChat(id) {
    if(!id) return
    this.lastSeen[id] = new Date().getTime()
    relay.post(`messages/${id}/read`)
  }

  @action
  countUnseenMessages():number {
    const now = new Date().getTime()
    let unseenCount = 0
    const lastSeenObj = this.lastSeen
    Object.entries(this.messages).forEach(function([id,msgs]){
      const lastSeen = lastSeenObj[id||'_'] || now
      msgs.forEach(m=>{
        if(m.sender!==1){
          const unseen = moment(new Date(lastSeen)).isBefore(moment(m.date))
          if(unseen) unseenCount+=1
        }
      })
    })
    return unseenCount
  }

  @action
  initLastSeen() {
    const obj = this.lastSeen?JSON.parse(JSON.stringify(this.lastSeen)):{}
    chatStore.chats.forEach(c=>{
      if(!obj[c.id]) obj[c.id] = new Date().getTime()
    })
    this.lastSeen = obj
  }

  @action 
  async approveOrRejectMember(contactID, status, msgId){
    const r = await relay.put(`member/${contactID}/${status}/${msgId}`)
    if(r&&r.chat&&r.chat.id) {
      const msgs = this.messages[r.chat.id]
      const msg = msgs.find(m=>m.id===msgId)
      if(msg) msg.type = r.message.type
      // update chat
      chatStore.gotChat(r.chat)
    }
  }

  @action // only if it contains a "chat"
  async gotNewMessage(m) {
    let newMsg = await decodeSingle(m)
    const chatID = newMsg.chat_id
    if(chatID){
      putIn(this.messages, newMsg, chatID)
      if(newMsg.chat) chatStore.gotChat(newMsg.chat)
    }
  }

  @action // only if it contains a "chat"
  async gotNewMessageFromWS(m) {
    let newMsg = await decodeSingle(m)
    const chatID = newMsg.chat_id
    if(chatID || chatID===0){
      msgsBuffer.push(newMsg)
      if(msgsBuffer.length===1) {
        this.pushFirstFromBuffer()
      }
      debounce(() => {
        this.concatNewMsgs()
      }, 1000)
      // if(newMsg.chat) chatStore.gotChat(newMsg.chat) // IS THIS NEEDED????
    }
  }

  @action concatNewMsgs() {
    const msgs = JSON.parse(JSON.stringify(msgsBuffer))
    msgs.sort((a,b)=> moment(a.date).unix() - moment(b.date).unix())
    this.messages = orgMsgsFromExisting(this.messages, msgs)
    msgsBuffer = []
  }

  @action pushFirstFromBuffer() {
    const msg = msgsBuffer[0]
    const msgs = [msg]
    const orged = orgMsgsFromExisting(this.messages, msgs)
    this.messages = orged
  }

}


export const msgStore = new MsgStore()

function rando(){
  return Math.random().toString(12).substring(0)
}

let inDebounce
function debounce(func, delay) {
  const context = this
  const args = arguments
  clearTimeout(inDebounce)
  inDebounce = setTimeout(() => func.apply(context, args), delay)
}

let msgsBuffer = []

