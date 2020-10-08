import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'
import {Invite} from './contacts'
import {relay} from '../api'

/*
disconneted - socket?
03eab50cef61b9360bc24f0fd8a8cb3ebd7cec226d9f6fd39150594e0da8bd58a7

android crash when open tribe

only send confirmation if u are trbie owner/??
*/

const DEFAULT_TRIBE_SERVER = 'tribes.sphinx.chat'

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
  escrow_amount: number
  escrow_millis: number
  owner_pubkey: string
  unlisted: boolean
  private: boolean

  pending_contact_ids: number[]

  invite: Invite

  photo_uri: string
}

export interface TribeServer {
  host: string
}

export class ChatStore {
  @persist('list') @observable
  chats: Chat[] = []

  @action
  setChats(chats: Chat[]) {
    this.chats = chats
  }

  @persist('list') @observable
  servers: TribeServer[] = [
    {host:DEFAULT_TRIBE_SERVER}
  ]

  @action getDefaultTribeServer(): TribeServer {
    const server = this.servers.find(s=> s.host===DEFAULT_TRIBE_SERVER)
    return server
  }

  @action
  async muteChat(chatID:number, muted: boolean) {
    relay.post(`chats/${chatID}/${muted?'mute':'unmute'}`)
    const chats = this.chats.map(c=>{
      if(c.id===chatID) {
        return {...c, is_muted:muted}
      }
      return c
    })
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
    if(!r) return
    this.gotChat(r)
    return r
  }

  @action 
  async createTribe({name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private}){
    const r = await relay.post('group', {
      name, description, tags:tags||[],
      is_tribe: true, is_listed:true,
      price_per_message: price_per_message||0,
      price_to_join: price_to_join||0,
      escrow_amount: escrow_amount||0,
      escrow_millis: escrow_time?escrow_time*60*60*1000:0,
      img: img||'',
      unlisted: unlisted||false,
      private: is_private||false,
    })
    if(!r) return
    this.gotChat(r)
    return r
  }

  @action 
  async editTribe({id, name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private}){
    const r = await relay.put(`group/${id}`, {
      name, description, tags:tags||[],
      is_listed:true,
      price_per_message: price_per_message||0,
      price_to_join: price_to_join||0,
      escrow_amount: escrow_amount||0,
      escrow_millis: escrow_time?escrow_time*60*60*1000:0,
      img: img||'',
      unlisted: unlisted||false,
      private: is_private||false,
    })
    if(!r) return
    this.gotChat(r)
    return r
  }

  @action 
  async joinTribe({name, uuid, group_key, host, amount, img, owner_alias, owner_pubkey, is_private}){
    const r = await relay.post('tribe', {
      name, uuid, group_key, amount, host, img, owner_alias, owner_pubkey, private:is_private,
    })
    if(!r) return
    this.gotChat(r)
    return r
  }

  @action
  async joinDefaultTribe() {
    const params = await this.getTribeDetails(
      'tribes.sphinx.chat',
      'X3IWAiAW5vNrtOX5TLEJzqNWWr3rrUaXUwaqsfUXRMGNF7IWOHroTGbD4Gn2_rFuRZcsER0tZkrLw3sMnzj4RFAk_sx0'
    )
    await this.joinTribe({
      name: params.name,
      group_key: params.group_key,
      owner_alias: params.owner_alias,
      owner_pubkey: params.owner_pubkey,
      host: params.host || 'tribes.sphinx.chat',
      uuid: params.uuid,
      img: params.img,
      amount:params.price_to_join||0,
      is_private:params.private
    })
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
  async kick(chatID, contactID){
    const r = await relay.put(`kick/${chatID}/${contactID}`)
    if(r===true){ // success
      const chat = this.chats.find(c=>c.id===chatID)
      if(chat) chat.contact_ids = chat.contact_ids.filter(cid=>cid!==contactID)
    }
  }

  @action
  async updateTribeAsNonAdmin(tribeID:number, name:string, img:string) {
    const r = await relay.put(`group/${tribeID}`, {name,img})
    if(r) {
      const cs = [...this.chats]
      this.chats = cs.map(c=>{
        if(c.id===tribeID){
          return {...c, name, photo_url:img}
        }
        return c
      })
    }
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
    const theHost = host.includes('localhost')?'tribes.sphinx.chat':host
    try{
      const r = await fetch(`https://${theHost}/tribes/${uuid}`)
      const j = await r.json()
      if(j.bots) {
        try {
          const bots = JSON.parse(j.bots)
          j.bots = bots
        } catch(e) {
          j.bots = []
        }
      }
      return j
    } catch(e){
      console.log(e)
    }
  }

  @action 
  async loadFeed(host:string,uuid:string,url:string){
    if(!host || !url) return
    const theHost = host.includes('localhost')?'tribes.sphinx.chat':host
    try{
      const r = await fetch(`https://${theHost}/podcast?url=${url}`)
      return r.json()
    } catch(e){
      console.log(e)
    }
  }

}

export const chatStore = new ChatStore()
