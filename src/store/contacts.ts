import {observable, action} from 'mobx'
import {relay,invite} from '../api'
import {chatStore} from './chats'
import {subStore} from './subs'
import {persist} from 'mobx-persist'
import {createFormData} from '../api/formdata'
import {userStore} from './user'

/*
invites:
create, returns contact:{status:0,invite:{}}    ... put in store
SOCKET when payment pending invite:{status=6, price:50, invite_string}
"pay" returns invite:{}

*/
export interface Contact {
  id: number
  public_key: string
  node_alias: string
  alias: string
  photo_url: string
  private_photo: boolean
  is_owner: boolean
  deleted: boolean
  auth_token: string
  remote_id: number
  status: number
  contact_key: string
  device_id: string
  created_at: string
  updated_at: string
  from_group: boolean

  invite: Invite

  photo_uri: string
}

export interface Invite {
  id: number
  invite_string: string
  welcome_message: string
  contact_id: number
  status: number
  price: number
  created_at: string
  updated_at: string
}

class ContactStore {
  @persist('list') @observable
  contacts: Contact[] = []

  @action
  async getContacts() {
    try {
      const r = await relay.get('contacts')
      if(r.contacts) {
        this.contacts = r.contacts
        const me = r.contacts.find(c=> c.id===1)
        if(me) {
          userStore.setAlias(me.alias)
          userStore.setPublicKey(me.public_key)
        }
      }
      if(r.chats) chatStore.setChats(r.chats)
      if(r.subscriptions) subStore.setSubs(r.subscriptions)
      return r
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async deleteContact(id) {
    try {
      await relay.del(`contacts/${id}`)
      this.contacts = this.contacts.filter(c=>c.id!==id)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async addContact(v) {
    try {
      if(!v.public_key) return console.log('no pub key')
      const r = await relay.post('contacts', {...v,status:1})
      const existingContact = this.contacts.find(c=> c.id===r.id)
      if(existingContact) {
        if(r.alias) existingContact.alias = r.alias
        existingContact.from_group = r.fromGroup||false
      } else {
        this.contacts = [...this.contacts, r]
      }
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async updateContact(id, v) {
    try {
      const r = await relay.put(`contacts/${id}`, v)
      const cs = [...this.contacts]
      console.log('updated contact:', r)
      this.contacts = cs.map(c=>{
        if(c.id===id){
          return {...c, ...v}
        }
        return c
      })
    } catch(e) {
      console.log(e)
    }
  }

  @action
  updatePhotoURI(id,photo_uri){
    const cs = [...this.contacts]
    this.contacts = cs.map(c=>{
      if(c.id===id){
        return {...c, photo_uri}
      }
      return c
    })
  }

  @action
  async contactUpdated(contact) {
    const ei = this.contacts.findIndex(c=>c.id===contact.id)
    if(ei>=0){
      this.contacts[ei] = contact
    } else {
      this.contacts.unshift(contact)
    }
  }

  @action
  async uploadProfilePic(file, params:{[k:string]:any}) {
    try {
      console.log("UPLOAD DATA:",file, params)
      const data = createFormData(file, params)
      console.log("FORM DATA",data)
      const r = await relay.upload(`upload`, data)
      console.log(r)
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async exchangeKeys(id) {
    try {
      await relay.post(`contacts/${id}/keys`, {})
    } catch(e) {
      console.log(e)
    }
  }

  @action
  async createInvite(nickname,welcome_message){
    try{
      await relay.post('invites',{
        nickname,
		    welcome_message: welcome_message || 'Welcome to Sphinx!'
      })
      this.getContacts()
    } catch(e) {
      console.log('could not create invite', e)
    }
  }

  @action 
  updateInvite(inv: Invite){
    const inviteContact = this.contacts.find(c=> {
      return c.invite&&c.invite.id===inv.id
    })
    if(inviteContact){
      inviteContact.invite = inv
    }
  }

  @action
  async payInvite(invite_string){
    try{
      const inv = await relay.post(`invites/${invite_string}/pay`,{})
      this.updateInvite(inv.invite)
    } catch(e) {
      console.log('could not pay invite', e)
    }
  }

  @action
  async getLowestPriceForInvite(){
    try{
      const r = await invite.get('nodes/pricing')
      if(r&&(r.price||r.price===0)) return r.price
    }catch(e){
      console.log(e)
    }
  }
}

export const contactStore = new ContactStore()