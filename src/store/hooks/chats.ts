import {useStores} from '../index'
import {Chat} from '../chats'
import {Contact} from '../contacts'
import { constants } from '../../constants'
import moment from 'moment'

export function useChats(){
    const {chats,msg,contacts,ui} = useStores()
    const theChats = allChats(chats.chats, contacts.contacts)
    const chatsToShow = filterChats(theChats, ui.searchTerm)
    sortChats(chatsToShow, msg.messages)
    return chatsToShow
}

export function useChatRow(id){
  const {msg} = useStores()
  const msgs = msg.messages[id||'_']
  const lastMsg = msgs&&msgs[0]
  const lastMsgText = lastMessageText(lastMsg)
  const hasLastMsg = lastMsgText?true:false

  const now = new Date().getTime()
  const lastSeen = msg.lastSeen[id||'_'] || now
  const unseenCount = countUnseen(msgs, lastSeen)
  const hasUnseen = unseenCount>0?true:false

  return {lastMsgText,hasLastMsg,unseenCount,hasUnseen} 
}

function lastMessageText(msg){
  if(!msg) return ''
  if(msg.type===constants.message_types.bot_res) {
    return msg.sender_alias ? `${msg.sender_alias} says...` : 'Bot Response'
  }
  if(msg.amount) {
    const kind = msg.type===constants.message_types.invoice?'Invoice':'Payment'
    if(msg.sender===1) return `${kind} Sent: ${msg.amount} sat`
    return `${kind} Received: ${msg.amount} sat`
  }
  if(msg.message_content) {
    if(msg.message_content.startsWith('giphy::')) return 'GIF received'
    return msg.message_content
  }
  if(msg.media_token) {
    if(msg.sender===1) return 'Picture Sent'
    return 'Picture Received'
  }
  return ''
}

function countUnseen(msgs, lastSeen:number):number{
  if(!msgs) return 0
  let unseenCount = 0
  msgs.forEach(m=>{
    if(m.sender!==1){
      const unseen = moment(new Date(lastSeen)).isBefore(moment(m.date))
      if(unseen) unseenCount+=1
    }
  })
  return Math.min(unseenCount,99)
}

const conversation = constants.chat_types.conversation
const group = constants.chat_types.conversation
const expiredInvite = constants.invite_statuses.expired

export function allChats(chats: Chat[], contacts:Contact[]): Chat[] {
  const groupChats = chats.filter(c=> c.type!==conversation).map(c=> ({...c}))
  const conversations = []
  contacts.forEach(contact=>{
    if(contact.id!==1 && !contact.from_group) {
      const chatForContact = chats.find(c=>{
        return c.type===conversation && c.contact_ids.includes(contact.id)
      })
      if(chatForContact){ // add in name = contact.name
        conversations.push({...chatForContact, name:contact.alias})
      } else {
        conversations.push({ // "fake" chat (first)
          name: contact.alias,
          photo_url: contact.photo_url,
          updated_at: new Date().toJSON(),
          contact_ids: [1, contact.id],
          invite: contact.invite,
          type: conversation,
        })
      }
    }
  })
  const convs = conversations.filter(c=> !(c.invite&&c.invite.status===expiredInvite))
  const all = groupChats.concat(convs)
  return all
}

export function contactForConversation(chat: Chat, contacts: Contact[]){
  if(chat && chat.type===conversation){
    const cid = chat.contact_ids.find(id=>id!==1)
    return contacts.find(c=> c.id===cid)
  }
  return null
}

export function sortChats(chatsToShow, messages){
  chatsToShow.sort((a,b)=>{
    const amsgs = messages[a.id]
    const alastMsg = amsgs&&amsgs[0]
    const then = moment(new Date()).add(-30, 'days')
    const adate = alastMsg&&alastMsg.date?moment(alastMsg.date):then
    const bmsgs = messages[b.id]
    const blastMsg = bmsgs&&bmsgs[0]
    const bdate = blastMsg&&blastMsg.date?moment(blastMsg.date):then
    return adate.isBefore(bdate) ? 0 : -1
  })
  chatsToShow.sort(a=>{
    if(a.invite && a.invite.status!==4) return -1
    return 0
  })
}

export function filterChats(theChats, searchTerm){
  return theChats.filter(c=> {
    if (!searchTerm) return true
    return (c.invite?true:false) || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  })
}

