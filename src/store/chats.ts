import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'
import {Invite} from './contacts'

export interface Chat {
  id: number
  uuid: string
  name: string
  photo_url: string
  type: number
  status: number
  contact_ids: number[]
  is_muted: boolean
  created_at: string
  updated_at: string
  deleted: boolean

  invite: Invite
}

class ChatStore {
  @persist('list') @observable
  chats: Chat[] = []

  @action
  setChats(chats: Chat[]) {
    this.chats = chats
  }

  @action
  gotChat(chat: Chat) {
    const existing = this.chats.find(ch=>ch.id===chat.id)
    if(!existing){
      this.chats.push(chat)
    }
  }
}

export const chatStore = new ChatStore()
