import { observable, action } from 'mobx'
import { persist } from 'mobx-persist'
import {Invite, contactStore} from './contacts'
import {relay} from '../api'
// Realm
import { hasData, get, update, create, delet, getById } from '../realm/api'
import { constants } from '../constants'

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
  seen: boolean
  pending_contact_ids: number[]

  invite: Invite

  photo_uri: string
}

export interface TribeServer {
  host: string
}

/**
 * Interface for net info
 */
interface NetInfo {
  type: string;
  isConnected: boolean;
}

/**
 * Pending mutate chats
 */
interface PendingMutateChats {
  chatID: number;
  muted: boolean;
}

/**
 * Pending create group
 */
interface PendingCreateGroup {
  contact_ids: number[];
  name: string;
}

/**
 * Pending add group members
 */
interface PendingAddGroupMembers {
  chatID: number;
  contact_ids: number[]
}

/**
 * Pending add group members
 */
interface PendingKick{
  chatID: number;
  contactID: number;
}
/**
 * Pending update tribe as non admin
 */
interface PendingUpdateTribeAsNonAdmin {
  tribeID:number;
  name:string;
  img:string
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

  @persist('object') @observable
  netInfo: NetInfo

  @persist('list') @observable
  pendingMutateChats: PendingMutateChats[] = []

  @persist('list') @observable
  pendingCreateGroup: PendingCreateGroup[] = []

  @persist('list') @observable
  pendingAddGroupMembers: PendingAddGroupMembers[] = []

  @persist('list') @observable
  pendingExistGroup: number[] = []

  @persist('list') @observable
  pendingKick: PendingKick[] = []

  @persist('list') @observable
  pendingUpdateTribeAsNonAdmin: PendingUpdateTribeAsNonAdmin[] = []

  @action updateNetInfo(payload: NetInfo){
    this.netInfo = {...payload}
  }

  @action restoreNetInfo(){
    this.netInfo = {
      type: 'unknown',
      isConnected: false,
    }
  }

  @action getDefaultTribeServer(): TribeServer {
    const server = this.servers.find(s=> s.host===DEFAULT_TRIBE_SERVER)
    return server
  }

  /**
   * Resolve all the pending mute chats added when app is offline
   */
  @action resolvePendingMutateChats() {
    const hasRealmData = hasData();
    this.pendingMutateChats.forEach((p: PendingMutateChats) => {
      /**
      * Update chat in realm by his id
      */
     if (hasRealmData.chats) {
       const realmChats = get({ schema: 'Chats' });
       const realmChat = realmChats.find((c) => c.id === p.chatID)
       update({ schema: 'Chats', id: p.chatID, body: {...realmChat, is_muted: p.muted ? 1 : 0} });
     }
     relay.post(`chats/${p.chatID}/${p.muted?'mute':'unmute'}`)
   })
   this.pendingMutateChats = []
  }

  @action
  async muteChat(chatID:number, muted: boolean) {
    const { isConnected } = this.netInfo;
    const hasRealmData = hasData();

    if (!isConnected) {
      this.addPendingData('muteChat', {chatID,muted});
    }
    if (isConnected) {
      if (this.pendingMutateChats.length) {
        this.addPendingData('muteChat', {chatID,muted});
        this.resolvePendingMutateChats()
      }
      if (!this.pendingMutateChats.length) relay.post(`chats/${chatID}/${muted?'mute':'unmute'}`)
    }
    
    /**
     * Check if exist data of chats in realm
     * if exist use, transform and replace that data in the store
     */
    if (hasRealmData.chats && !isConnected) {
      this.getRealmChats(chatID, {is_muted: muted});
    }
    
    if (isConnected) {
      const chats = this.chats.map(c=>{
        if(c.id===chatID) {
          return {...c, is_muted:muted}
        }
        return c
      })
      this.chats = chats;
    }

    /**
     * Update chat in realm by his id
     */
    
    if (hasRealmData.chats && !this.pendingMutateChats.length) {
      const realmChats = get({ schema: 'Chats' });
      const realmChat = realmChats.find((c) => c.id === chatID)
      update({ schema: 'Chats', id: chatID, body: {...realmChat, is_muted: muted ? 1 : 0} });
    }
  }

  /**
   * getRealmChats
   * action that updated this.chats array with the realm records updated or not
   * @param {number} chatID - Id of the record to be updated
   * @param {object} payload - Object with the properties that will be updated
   */
  @action getRealmChats(chatID: number, payload: any) {
    const chatIds = this.chats.map((chat: any) => (chat.id));
        const myRealmChats = chatIds.map((ci: any) => {
          const chat = getById({ schema: 'Chats', id: ci });
          let isUpdated = false;
          let obj = {
            app_url: chat.app_url,
            created_at: chat.created_at,
            deleted: chat.deleted,
            escrow_amount: chat.escrow_amount,
            escrow_millis: chat.escrow_millis,
            feed_url: chat.feed_url,
            group_key: chat.group_key,
            host: chat.host,
            id: chat.id,
            name: chat.name,
            owner_pubkey: chat.owner_pubkey,
            photo_url: chat.photo_url,
            price_per_message: chat.price_per_message,
            price_to_join: chat.price_to_join,
            status: chat.status,
            type: chat.type,
            updated_at: chat.updated_at,
            uuid: chat.uuid,
            seen: chat.seen == 1 ? true : false,
            unlisted: chat.unlisted === 1 ? true: false,
            private: chat.private === 1 ? true : false,
            contact_ids: chat.contact_ids ? chat.contact_ids.map(ci => ci) : [],
            pending_contact_ids: chat.pending_contact_ids ? chat.pending_contact_ids.map(pci => pci) : [],
          };
          if (chat.id === chatID) isUpdated = true;
          

          return !isUpdated ? obj : {...obj, ...payload};
        });
        this.chats = myRealmChats;
  }

  @action
  gotChat(chat: Chat) {
    const hasRealmData = hasData();
    const { isConnected } = this.netInfo;

    const existingIndex = this.chats.findIndex(ch=>ch.id===chat.id)
    if(existingIndex>-1){
      this.chats[existingIndex] = chat
      /**
       * If chat existe update chats in realm
       */
      const updated =  {
        ...chat,
        seen: chat.seen ? 1 : 0,
        unlisted: chat.unlisted ? 1 : 0,
        private: chat.private ? 1 : 0,
        is_muted: chat.is_muted ? 1 : 0,
      }
      update({ schema: 'Chats', id: chat.id, body: updated });
    } else {
      this.chats.unshift(chat)
      /**
       * If chat does not exist create the chat in realm
       */
      create({ schema: 'Chats', body: {...chat, seen: chat.seen ? 1 : 0, unlisted: chat.unlisted ? 1 : 0} });
    }

    // If its offline use realm chats
    if (hasRealmData.chats && !isConnected) this.getRealmChats(0, {})
  }

  @action 
  async createGroup(contact_ids: number[], name: string){
    const { isConnected } = this.netInfo;
    if (isConnected) {
      if (this.pendingCreateGroup.length) {
        this.addPendingData('createGroup', {contact_ids,name})
        this.pendingCreateGroup.forEach(async (pc: PendingCreateGroup) => {
          const r = await relay.post('group', {
            name: pc.name,
            contact_ids: pc.contact_ids,
          })
          if(!r) return
          this.gotChat(r)
          return r
        })
        this.pendingCreateGroup = [];
      }
      const r = await relay.post('group', {
        name, contact_ids
      })
      if(!r) return
      this.gotChat(r)
      return r
    }

    if (!isConnected) {
      this.addPendingData('createGroup', {contact_ids, name})
    }
  }

  @action addPendingData(type: string, data: object | any) {
    switch (type) {
      case 'createGroup':
        this.pendingCreateGroup.push(data)
        break;
      case 'muteChat':
        this.pendingMutateChats.push(data)
        break;
      case 'addGroupMembers':
        this.pendingMutateChats.push(data)
        break;
      case 'exitGroup':
        this.pendingExistGroup.push(data)
        break;
      case 'kick':
        this.pendingKick.push(data)
        break;
      case 'updateTribeAsNonAdmin':
        this.pendingUpdateTribeAsNonAdmin.push(data)
        break;
      default:
        break;
    }
  }

  @action 
  async createTribe({name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private, app_url, feed_url}){
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
      app_url: app_url||'',
      feed_url: feed_url||''
    })
    if(!r) return
    this.gotChat(r)
    return r
  }

  @action 
  async editTribe({id, name, description, tags, img, price_per_message, price_to_join, escrow_amount, escrow_time, unlisted, is_private, app_url, feed_url}){
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
      app_url: app_url||'',
      feed_url: feed_url||''
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
    const { isConnected } = this.netInfo;
    if (isConnected) {
      if (this.pendingAddGroupMembers) {
        this.addPendingData('addGroupMembers', {chatID, contact_ids})
        this.pendingAddGroupMembers.forEach(async (agm: PendingAddGroupMembers) => {
          await relay.put(`chat/${agm.chatID}`, {contact_ids: agm.contact_ids})
        })
        this.pendingAddGroupMembers = []
      }
      await relay.put(`chat/${chatID}`, {
        contact_ids
      })
    }
    
    if (!isConnected) {
      this.addPendingData('addGroupMembers', {chatID, contact_ids})
    }
  }

  @action
  async exitGroup(chatID: number){
    const { isConnected } = this.netInfo;
    const hasRealmData = hasData();
    if (isConnected) {
      if (this.pendingExistGroup.length) {
        this.addPendingData('exitGroup', chatID);
        this.pendingExistGroup.forEach(async (egId: number) => {
          await relay.del(`chat/${egId}`)
        })
        this.pendingExistGroup = []
      }
      await relay.del(`chat/${chatID}`)
    }

    if (!isConnected) {
      this.addPendingData('exitGroup', chatID);
    }

    /**
     * Check if exist data of chats in realm
     * if exist use, transform and replace that data in the store
     */
    if (hasRealmData.chats && !isConnected) this.getRealmChats(0, {})

    const chats = [...this.chats]
    this.chats = chats.filter(c=> c.id!==chatID)
    delet({ schema: 'Chats', id: chatID, type: 'single' });
  }

  @action
  async kick(chatID, contactID){
    const { isConnected } = this.netInfo;
    const hasRealmData = hasData();
    let r = null;

    /**
     * Check if exist data of chats in realm
     * if exist use, transform and replace that data in the store
     */
    if (hasRealmData.chats && !isConnected) {
      this.getRealmChats(0, {})
    }

    if (isConnected) {
      if (this.pendingKick.length) {
        this.addPendingData('kick', {chatID, contactID});
        this.pendingKick.forEach(async (k: PendingKick) => {
          r = await relay.put(`kick/${k.chatID}/${k.contactID}`)
          if(r===true){ // success
            const chat = this.chats.find(c=>c.id===chatID)
            if(chat) {
              chat.contact_ids = chat.contact_ids.filter(cid=>cid!==contactID)
              update({ schema: 'Chats', id: chatID, body: {...chat} });
            }
          }
        })
        this.pendingKick = []
      }
      r = await relay.put(`kick/${chatID}/${contactID}`)
      if(r===true){ // success
        const chat = this.chats.find(c=>c.id===chatID)
        if(chat) {
          chat.contact_ids = chat.contact_ids.filter(cid=>cid!==contactID)
          update({ schema: 'Chats', id: chatID, body: {...chat} });
        }
      }
    }

    if (!isConnected) {
      this.addPendingData('kick', {chatID, contactID});
    }
  }

  @action
  async updateTribeAsNonAdmin(tribeID:number, name:string, img:string) {
    const { isConnected } = this.netInfo;
    const hasRealmData = hasData();
    
    if (isConnected) {
      if (this.pendingUpdateTribeAsNonAdmin.length) {
        this.addPendingData('updateTribeAsNonAdmin', {tribeID, name, img})
        this.pendingUpdateTribeAsNonAdmin.forEach(async (tribe: PendingUpdateTribeAsNonAdmin) => {
          const r = await relay.put(`group/${tribe.tribeID}`, {name: tribe.name, img: tribe.img})
          if(r) {
            const cs = [...this.chats]
            this.chats = cs.map(c=>{
              if(c.id===tribe.tribeID){
                return {...c, name: tribe.name, photo_url: tribe.img}
              }
              return c
            })
            /**
             * Update chat record in realm
             */
            const chat = cs.find((c) => c.id === tribe.tribeID);
            const updated = {
              ...chat,
              name: tribe.name,
              photo_url: tribe.img,
            }
      
            update({ schema: 'Chats', id: tribe.tribeID, body: updated });
          }
        })
        this.pendingUpdateTribeAsNonAdmin = []
      }
      const r = await relay.put(`group/${tribeID}`, {name, img})
          if(r) {
            const cs = [...this.chats]
            this.chats = cs.map(c=>{
              if(c.id===tribeID){
                return {...c, name, photo_url: img}
              }
              return c
            })
            /**
             * Update chat record in realm
             */
            const chat = cs.find((c) => c.id === tribeID);
            const updated = {
              ...chat,
              name: name,
              photo_url: img,
            }
      
            update({ schema: 'Chats', id: tribeID, body: updated });
          }
    }

    /**
     * Check if exist data of chats in realm
     * if exist use, transform and replace that data in the store
     */
    if (hasRealmData.chats && !isConnected) this.getRealmChats(0, {});
  }

  @action
  updateChatPhotoURI(id,photo_uri){
    const { isConnected } = this.netInfo;
    const hasRealmData = hasData();
    /**
     * Check if exist data of chats in realm
     * if exist use, transform and replace that data in the store
     */
    if (hasRealmData.chats && isConnected) this.getRealmChats(0, {});

    const cs = [...this.chats];
    this.chats = cs.map(c=>{
      if(c.id===id){
        return {...c, photo_uri}
      }
      return c
    })
    /**
     * Update chat from realm
     */
    const chat = cs.find((c) => c.id === id);
    update({ schema: 'Chats', id, body: {
      ...chat,
      photo_url: photo_uri,
      seen: chat.seen ? 1 : 0,
      unlisted: chat.unlisted ? 1 : 0,
      private: chat.private ? 1 : 0,
    }});
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
  async checkRoute(cid){
    const chat = this.chats.find(ch=>ch.id===cid)
    if(!chat) return
    let pubkey
    if(chat.type===constants.chat_types.tribe) {
      pubkey = chat.owner_pubkey
    } else if(chat.type===constants.chat_types.conversation) {
      const contactid = chat.contact_ids.find(contid=>contid!=1)
      const contact = contactStore.contacts.find(con=>con.id===contactid)
      if(contact) {
        pubkey = contact.public_key
      }
    }
    if(!pubkey) return
    const r = await relay.get(`route?pubkey=${pubkey}`)
    if(r) return r
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

  @action reset(){
    this.chats = []
  }

}

export const chatStore = new ChatStore()
