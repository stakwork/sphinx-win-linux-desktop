import { observable, action } from 'mobx'
import {Chat} from './chats'
import {Msg} from './msg'

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

}

export const uiStore = new UiStore()