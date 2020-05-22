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

  group_key: string
  host: string
  price_to_join: number
  price_per_message: number
  owner_pubkey: string

  invite: Invite

  photo_uri: string
}

export class ChatStore {
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
  async createTribe({name, description, tags, img, price_per_message, price_to_join}){
    const r = await relay.post('group', {
      name, description, tags:tags||[],
      is_tribe: true, is_listed:true,
      price_per_message: price_per_message||0,
      price_to_join: price_to_join||0,
      img: img||'',
    })
    this.gotChat(r)
    return r
  }

  @action 
  async joinTribe({name, uuid, group_key, host, amount, img, owner_alias, owner_pubkey}){
    console.log("JOIN TRIBE PARAMS",{
      name, uuid, group_key, host, amount, img, owner_alias, owner_pubkey
    })
    const r = await relay.post('tribe', {
      name, uuid, group_key, amount, host, img, owner_alias, owner_pubkey
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

  @action
  updateChatPhotoURI(id,photo_uri){
    const cs = [...this.chats]
    this.chats = cs.map(c=>{
      if(c.id===id){
        return {...c, photo_uri}
      }
      return c
    })
  }

  @action 
  async getTribeDetails(host:string,uuid:string){
    if(!host || !uuid) return
    console.log(host,uuid)
    const theHost = host.includes('localhost')?'tribes.sphinx.chat':host
    try{
      console.log(`GO NOW => https://${theHost}/tribes/${uuid}`)
      const r = await fetch(`https://${theHost}/tribes/${uuid}`)
      const j = await r.json()
      console.log(j)
      return j
    } catch(e){
      console.log(e)
    }
  }

}

export const chatStore = new ChatStore()
