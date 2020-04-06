import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'
import {Invite} from './contacts'
import {relay} from '../api'

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

  photo_uri: string
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
    const existingIndex = this.chats.findIndex(ch=>ch.id===chat.id)
    if(existingIndex>-1){
      this.chats[existingIndex] = chat
    } else {
      this.chats.unshift(chat)
    }
  }

  @action 
  async createGroup(contact_ids: number[], name: string){
    const r = await relay.post('group', {
      name, contact_ids
    })
    this.gotChat(r)
    return r
  }

  @action
  async addGroupMembers(chatID: number, contact_ids: number[]) {
    await relay.put(`chat/${chatID}`, {
      contact_ids
    })
  }

  @action
  async exitGroup(chatID: number){
    await relay.del(`chat/${chatID}`)
    const chats = [...this.chats]
    this.chats = chats.filter(c=> c.id!==chatID)
  }
}

export const chatStore = new ChatStore()
