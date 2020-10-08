import {msgStore} from './msg'
import {contactStore} from './contacts'
import {uiStore} from './ui'
import {chatStore} from './chats'

export function contact(data){ // on contact_key msg
  log('[ws] contact', data)
  contactStore.contactUpdated(data.response)
}

export function invite(data){
  log('[ws] invite', data)
  contactStore.updateInvite(data.response)
}

export function invoice_payment(data){
  log('[ws] invoice_payment', data.response)
  if(data.response&&data.response.invoice){
    uiStore.setLastPaidInvoice(data.response.invoice)
  }
}

/* sphinx types */

export function message(data){
  log('[ws] message', data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function confirmation(data){
  log("[ws] confirmation", data)
  msgStore.setMessageAsReceived(data.response)
}

export function invoice(data) {
  log("[ws] invoice", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function payment(data) {
  log("[ws] payment", data)
  msgStore.invoicePaid(data.response)
}

export function cancellation(data) {
  log("[ws] cancellation", data)
}

export function direct_payment(data) {
  log("[ws] direct_payment", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function attachment(data) {
  log("[ws] attachment", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function purchase(data) {
  log("[ws] purchase", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function purchase_accept(data) {
  log("[ws] purchase_accept", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function purchase_deny(data) {
  log("[ws] purchase_deny", data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function group_create(data) {
  log("[ws] group_create", data)
  chatStore.gotChat(data.response.chat)
}

export function group_join(data) {
  log("[ws] group_join", data)
  const msg = data.response && data.response.message
  if(msg && data.response.chat) {
    msg.chat = data.response.chat
    msgStore.gotNewMessageFromWS(msg)
  }
}

export function group_leave(data) {
  log("[ws] group_leave", data)
  const msg = data.response && data.response.message
  if(msg && data.response.chat) {
    msg.chat = data.response.chat
    msgStore.gotNewMessageFromWS(msg)
  }
}

export function deleteMessage(data){
  log('[ws] delete message', data)
  msgStore.gotNewMessageFromWS(data.response)
}

export function member_request(data){
  log('[ws] member_request message', data)
  if(!data.response.message) return
  msgStore.gotNewMessageFromWS(data.response.message)
}

export function member_approve(data){
  log('[ws] member_approve message', data)
  if(!data.response.message) return
  msgStore.gotNewMessageFromWS(data.response.message)
}

export function member_reject(data){
  log('[ws] member_reject message', data)
  if(!data.response.message) return
  msgStore.gotNewMessageFromWS(data.response.message)
}

export function bot_res(data){
  log('[ws] bot_res', data)
  msgStore.gotNewMessageFromWS(data.response)
}

const oktolog=false

function log(a,b){
  if(oktolog) {
    console.log(a,b)
  }
}