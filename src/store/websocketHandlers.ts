import {msgStore} from './msg'
import {contactStore} from './contacts'

export function contact(data){ // on contact_key msg
  console.log('[ws] contact', data)
  contactStore.contactUpdated(data.response)
}

export function invite(data){
  console.log('[ws] invite', data)
  contactStore.updateInvite(data.response)
}

/* sphinx types */

export function message(data){
  console.log('[ws] message', data)
  msgStore.gotNewMessage(data.response)
}

export function confirmation(data){
  console.log("[ws] confirmation", data)
  msgStore.setMessageAsReceived(data.response)
}

export function invoice(data) {
  console.log("[ws] invoice", data)
  msgStore.gotNewMessage(data.response)
}

export function payment(data) {
  console.log("[ws] invoice", data)
  msgStore.invoicePaid(data.response)
}

export function cancellation(data) {
  console.log("[ws] cancellation", data)
}

export function direct_payment(data) {
  console.log("[ws] direct_payment", data)
  msgStore.gotNewMessage(data.response)
}

export function attachment(data) {
  console.log("[ws] attachment", data)
  msgStore.gotNewMessage(data.response)
}

export function purchase(data) {
  console.log("[ws] purchase", data)
}

export function purchase_accept(data) {
  console.log("[ws] purchase_accept", data)
}

export function purchase_deny(data) {
  console.log("[ws] purchase_deny", data)
}

export function group_create(data) {
  console.log("[ws] group_create", data)
}

export function group_join(data) {
  console.log("[ws] group_join", data)
  const msg = data.response && data.response.message
  if(msg && data.response.chat) {
    msg.chat = data.response.chat
    msgStore.gotNewMessage(msg)
  }
}

export function group_leave(data) {
  console.log("[ws] group_leave", data)
  const msg = data.response && data.response.message
  if(msg && data.response.chat) {
    msg.chat = data.response.chat
    msgStore.gotNewMessage(msg)
  }
}
