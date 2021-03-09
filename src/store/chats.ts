import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'
import { Invite, contactStore } from './contacts'
import { relay } from '../api'
import { constants } from '../constants'
import { detailsStore } from './details'

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

  feed_url: string
  app_url: string

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

  pricePerMinute: number // for setting in group modal

  meta: {[k:string]:any}
  my_alias: string
  my_photo_url: string
}

export interface TribeServer {
  host: string
}

export class ChatStore {
  @persist('list') @observable
  chats: Chat[] = []

  @persist('object') @observable
  pricesPerMinute: {[k:number]:number} = {}

  @action
  setChats(chats: Chat[]) {
    this.chats = chats.map(c=>this.parseChat(c))
  }

  @action
  setPricePerMinute(chatID: number, ppm: number) {
    if(!chatID) return
    this.pricesPerMinute[chatID] = ppm
  }

  @persist('list') @observable
  servers: TribeServer[] = [
    { host: DEFAULT_TRIBE_SERVER }
  ]

  @action getDefaultTribeServer(): TribeServer {
    const server = this.servers.find(s => s.host === DEFAULT_TRIBE_SERVER)
    return server
  }

  @action
  async muteChat(chatID: number, muted: boolean) {
    relay.post(`chats/${chatID}/${muted ? 'mute' : 'unmute'}`)
    const chats = this.chats.map(c => {
      if (c.id === chatID) {
        return { ...c, is_muted: muted }
      }
      return c
    })
    this.chats = chats
  }

  @action parseChat(c):Chat {
    if(c.meta && typeof c.meta==='string') {
      let meta
      try {
        meta = JSON.parse(String(c.meta))
      } catch(e){}
      return {...c, meta}
    }
    return c
  }

  @action
  async getChats() {
    const chats = await relay.get('chats')
    if(!(chats && chats.length)) return
    this.chats = this.chats.map(c=> this.parseChat(c))
  }

  @action
  gotChat(chat: Chat) {
    // console.log("====> GOT CHAT", chat)
    const existingIndex = this.chats.findIndex(ch => ch.id === chat.id)
    if (existingIndex > -1) {
      this.chats[existingIndex] = this.parseChat(chat)
    } else {
      this.chats.unshift(this.parseChat(chat))
    }
  }

  @action
  async createGroup(contact_ids: number[], name: string) {
    const r = await relay.post('group', {
      name, contact_ids
    })
    if (!r) return
    this.gotChat(r)
    return r
  }

  @action
  async createTribe({ name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private, app_url, feed_url }) {
    console.log('======>',{ name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private, app_url, feed_url })
    await sleep(1);
    const r = await relay.post('group', {
      name, description, tags: tags || [],
      is_tribe: true, is_listed: true,
      price_per_message: price_per_message || 0,
      price_to_join: price_to_join || 0,
      escrow_amount: escrow_amount || 0,
      escrow_millis: escrow_time ? escrow_time * 60 * 60 * 1000 : 0,
      img: img || '',
      unlisted: unlisted || false,
      private: is_private || false,
      app_url: app_url || '',
      feed_url: feed_url || ''
    })
    if (!r) return
    this.gotChat(r)
    return r
  }

  @action
  async editTribe({ id, name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private, app_url, feed_url }) {
    const r = await relay.put(`group/${id}`, {
      name, description, tags: tags || [],
      is_listed: true,
      price_per_message: price_per_message || 0,
      price_to_join: price_to_join || 0,
      escrow_amount: escrow_amount || 0,
      escrow_millis: escrow_time ? escrow_time * 60 * 60 * 1000 : 0,
      img: img || '',
      unlisted: unlisted || false,
      private: is_private || false,
      app_url: app_url || '',
      feed_url: feed_url || ''
    })
    if (!r) return
    this.gotChat(r)
    return r
  }

  @action
  async joinTribe({ 
    name, uuid, group_key, host, amount, img, owner_alias, owner_pubkey, is_private, my_alias, my_photo_url,
  } : {
    name:string, uuid:string, group_key:string, host:string, amount:number, img:string, owner_alias:string, owner_pubkey:string, is_private:boolean, my_alias?:string, my_photo_url?:string,
  }) {
    const r = await relay.post('tribe', {
      name, uuid, group_key, amount, host, img, owner_alias, owner_pubkey, private: is_private, my_alias:my_alias||'', my_photo_url:my_photo_url||''
    })
    if (!r) return
    this.gotChat(r)
    if (amount) detailsStore.addToBalance(amount * -1)
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
      amount: params.price_to_join || 0,
      is_private: params.private,
    })
  }

  @action
  async addGroupMembers(chatID: number, contact_ids: number[]) {
    await relay.put(`chat/${chatID}`, {
      contact_ids
    })
  }

  @action
  async exitGroup(chatID: number) {
    await relay.del(`chat/${chatID}`)
    const chats = [...this.chats]
    this.chats = chats.filter(c => c.id !== chatID)
  }

  @action
  async kick(chatID, contactID) {
    const r = await relay.put(`kick/${chatID}/${contactID}`)
    if (r === true) { // success
      const chat = this.chats.find(c => c.id === chatID)
      if (chat) chat.contact_ids = chat.contact_ids.filter(cid => cid !== contactID)
    }
  }

  @action
  async updateMyInfoInChat(tribeID: number, my_alias: string, my_photo_url: string) {
    const r = await relay.put(`chats/${tribeID}`, { my_alias, my_photo_url })
    if (r) {
      const cs = [...this.chats]
      this.chats = cs.map(c => {
        if (c.id === tribeID) {
          return { ...c, my_alias, my_photo_url }
        }
        return c
      })
    }
  }

  @action
  async updateTribeAsNonAdmin(tribeID: number, name: string, img: string) {
    const r = await relay.put(`group/${tribeID}`, { name, img })
    if (r) {
      const cs = [...this.chats]
      this.chats = cs.map(c => {
        if (c.id === tribeID) {
          return { ...c, name, photo_url: img }
        }
        return c
      })
    }
  }

  @action
  updateChatPhotoURI(id, photo_uri) {
    const cs = [...this.chats]
    this.chats = cs.map(c => {
      if (c.id === id) {
        return { ...c, photo_uri }
      }
      return c
    })
  }

  @action
  updateChatMeta(chat_id, meta) {
    const idx = this.chats.findIndex(c=>c.id===chat_id)
    if(idx>-1) {
      this.chats[idx].meta = meta
    }
  }

  @action
  async getTribeDetails(host: string, uuid: string) {
    if (!host || !uuid) return
    const theHost = host.includes('localhost') ? 'tribes.sphinx.chat' : host
    try {
      const r = await fetch(`https://${theHost}/tribes/${uuid}`)
      const j = await r.json()
      if (j.bots) {
        try {
          const bots = JSON.parse(j.bots)
          j.bots = bots
        } catch (e) {
          j.bots = []
        }
      }
      return j
    } catch (e) {
      console.log(e)
    }
  }

  @action
  async checkRoute(cid, myid:number) {
    const chat = this.chats.find(ch => ch.id === cid)
    if (!chat) return
    let pubkey
    if (chat.type === constants.chat_types.tribe) {
      pubkey = chat.owner_pubkey
    } else if (chat.type === constants.chat_types.conversation) {
      const contactid = chat.contact_ids.find(contid => contid !== myid)
      const contact = contactStore.contacts.find(con => con.id === contactid)
      if (contact) {
        pubkey = contact.public_key
      }
    }
    if (!pubkey) return
    const r = await relay.get(`route?pubkey=${pubkey}`)
    if (r) return r
  }

  @action
  async loadFeed(host: string, uuid: string, url: string) {
    if (!host || !url) return
    const theHost = host.includes('localhost') ? 'tribes.sphinx.chat' : host
    try {
      const r = await fetch(`https://${theHost}/podcast?url=${url}`)
      const j = await r.json()
      return j
    } catch (e) {
      console.log(e)
      return null
    }
  }

  @action reset() {
    this.chats = []
  }

}

export const chatStore = new ChatStore()


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}