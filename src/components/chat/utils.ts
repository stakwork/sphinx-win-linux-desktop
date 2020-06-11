import {Chat} from '../../store/chats'
import {Contact} from '../../store/contacts'
import { constants } from '../../constants'

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