import { Chat } from '../../store/chats'
import { Contact } from '../../store/contacts'
import { constants } from '../../constants'
import moment from 'moment'

const conversation = constants.chat_types.conversation
const group = constants.chat_types.conversation
const expiredInvite = constants.invite_statuses.expired

export function allChats(chats: Chat[], contacts: Contact[], myid: number): Chat[] {
  const groupChats = chats.filter(c => c.type !== conversation).map(c => ({ ...c }))
  const conversations = []
  contacts.forEach(contact => {
    if (contact.id !== myid && !contact.from_group) {
      const chatForContact = chats.find(c => {
        return c.type === conversation && c.contact_ids.includes(contact.id)
      })
      if (chatForContact) { // add in name = contact.name
        conversations.push({ ...chatForContact, name: contact.alias })
      } else {
        conversations.push({ // "fake" chat (first)
          name: contact.alias,
          photo_url: contact.photo_url,
          updated_at: new Date().toJSON(),
          contact_ids: [myid, contact.id],
          invite: contact.invite,
          type: conversation,
        })
      }
    }
  })
  const convs = conversations.filter(c => !(c.invite && c.invite.status === expiredInvite))
  const all = groupChats.concat(convs)
  return all
}

export function contactForConversation(chat: Chat, contacts: Contact[], myid: number) {
  if (chat && chat.type === conversation) {
    const cid = chat.contact_ids.find(id => id !== myid)
    return contacts.find(c => c.id === cid)
  }
  return null
}

export function sortChats(chatsToShow, messages) {
  chatsToShow.sort((a, b) => {
    const amsgs = messages[a.id]
    const alastMsg = amsgs && amsgs[0]
    const then = moment(new Date()).add(-30, 'days')
    const adate = alastMsg && alastMsg.date ? moment(alastMsg.date) : then
    const bmsgs = messages[b.id]
    const blastMsg = bmsgs && bmsgs[0]
    const bdate = blastMsg && blastMsg.date ? moment(blastMsg.date) : then
    return adate.isBefore(bdate) ? 0 : -1
  })
  chatsToShow.sort(a => {
    if (a.invite && a.invite.status !== 4) return -1
    return 0
  })
}

export function filterChats(theChats, searchTerm) {
  return theChats.filter(c => {
    if (!searchTerm) return true
    return (c.invite ? true : false) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  })
}

