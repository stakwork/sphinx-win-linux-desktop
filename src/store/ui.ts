import { observable, action } from 'mobx'
import {Chat} from './chats'
import {Msg} from './msg'
import {Contact} from './contacts'

class UiStore {
  @observable ready: boolean = false
  @action
  setReady(ready){
    this.ready = ready
  }

  @observable searchTerm: string = ''
  @action
  setSearchTerm(term) {
    this.searchTerm = term
  }

  @observable contactsSearchTerm: string = ''
  @action
  setContactsSearchTerm(term) {
    this.contactsSearchTerm = term
  }

  @observable qrModal: boolean = false
  @action
  setQrModal(b) {
    this.qrModal = b
  }

  @observable addFriendModal: boolean = false
  @action
  setAddFriendModal(b) {
    this.addFriendModal = b
  }

  @observable editContactModal: boolean = false
  @observable editContactParams: Contact
  @action
  setEditContactModal(p: Contact) {
    this.editContactModal = true
    this.editContactParams = p
  }
  @action
  closeEditContactModal() {
    this.editContactModal = false
    setTimeout(()=>{
      this.editContactParams = null
    },500)
  }

  @observable newGroupModal: boolean = false
  @action
  setNewGroupModal(b) {
    this.newGroupModal = b
  }

  @observable groupModal: boolean = false
  @observable groupModalParams: Chat
  @action
  setGroupModal(g: Chat) {
    this.groupModal = true
    this.groupModalParams = g
  }
  @action
  closeGroupModal() {
    this.groupModal = false
    setTimeout(()=>{
      this.groupModalParams = null
    },500)
  }

  @observable pubkeyModal: boolean = false
  @action
  setPubkeyModal(b) {
    this.pubkeyModal = b
  }

  @observable shareInviteModal: boolean = false
  @observable shareInviteString: string = ''
  @action
  setShareInviteModal(s: string) {
    this.shareInviteModal = true
    this.shareInviteString = s
  }

  @action
  clearShareInviteModal() {
    this.shareInviteModal = false
    setTimeout(()=>{
      this.shareInviteString = ''
    },500)
  }

  @observable showPayModal: boolean = false
  @observable payMode: string = ''
  @observable chatForPayModal: Chat | null
  @action
  setPayMode(m,c) {
    this.payMode = m
    this.chatForPayModal = c
    this.showPayModal = true
  }

  @action
  clearPayModal() {
    this.showPayModal = false
    setTimeout(()=>{
      this.payMode=''
      this.chatForPayModal = null
    }, 500) // delay 
  }

  @observable confirmInvoiceMsg: Msg
  @action setConfirmInvoiceMsg(s) {
    this.confirmInvoiceMsg = s
  }

  @observable rawInvoiceModal: boolean = false
  @observable rawInvoiceModalParams: {[k:string]:string} = null
  @action
  setRawInvoiceModal(params) {
    this.rawInvoiceModal = true
    this.rawInvoiceModalParams = params
  }

  @action
  clearRawInvoiceModal() {
    this.rawInvoiceModal = false
    setTimeout(()=>{
      this.rawInvoiceModalParams=null
    }, 500) // delay 
  }

  @observable imgViewerParams: {[k:string]:any} = null
  setImgViewerParams(obj:{[k:string]:any}) {
    this.imgViewerParams = obj
  }

}

export const uiStore = new UiStore()