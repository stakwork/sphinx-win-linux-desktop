import {Chat} from '../../store/chats'
import {Contact} from '../../store/contacts'
import { constants } from '../../constants'

const conversation = constants.chat_types.conversation
const group = constants.chat_types.group
const expiredInvite = constants.invite_statuses.expired

export function allChats(chats: Chat[], contacts:Contact[]): Chat[] {
  const groupChats = chats.filter(c=> c.type===group)
  const conversations = []
  contacts.forEach(contact=>{
    if(contact.id!==1) {
      const chatForContact = chats.find(c=>{
        return c.type===conversation && c.contact_ids.includes(contact.id)
      })
      if(chatForContact){ // add in name = contact.name
        conversations.push({...chatForContact, name:contact.alias})
      } else {
        conversations.push({ // "fake" chat (first)
          // id: `contact_${contact.id}`,
          name: contact.alias,
          photo_url: contact.photo_url,
          updated_at: new Date().toJSON(),
          contact_ids: [1, contact.id],
          invite: contact.invite,
        })
      }
    }
  })
  const convs = conversations.filter(c=> !(c.invite&&c.invite.status===expiredInvite))
  const all = groupChats.concat(convs)
  all.sort((a,b)=> Date.parse(a.updated_at||'') - Date.parse(b.updated_at||''))
  return all
}

export function contactForConversation(chat: Chat, contacts: Contact[]){
  if(chat.type===conversation){
    const cid = chat.contact_ids.find(id=>id!==1)
    return contacts.find(c=> c.id===cid)
  }
  return null
}