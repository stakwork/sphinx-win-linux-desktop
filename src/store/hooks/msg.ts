
import {useStores} from '../index'
import { constants,constantCodes } from '../../constants'
import {Msg} from '../msg'
import {Contact} from '../contacts'
import moment from 'moment'
import {parseLDAT,urlBase64FromAscii} from '../utils/ldat'
import * as base64 from 'base-64'

const group = constants.chat_types.group
const tribe = constants.chat_types.tribe

export function useMsgs(chat){
    const {chats,msg,contacts} = useStores()
    if(!chat) return
    let theID = chat.id
    const isTribe = chat.type===tribe
    if(!theID) { // for very beginning, where chat doesnt have id
      const theChat = chats.chats.find(ch=>ch.type===0 && arraysEqual(ch.contact_ids, chat.contact_ids)) // this is the problem
      if(theChat) theID = theChat.id // new chat pops in, from first message confirmation!
    }
    const msgs = msg.messages[theID]
    const messages = processMsgs(msgs, isTribe, contacts.contacts)

    const msgsWithDates = msgs && injectDates(messages)
    const ms = msgsWithDates || []
    
    const filtered = ms.filter(m=> m.type!==constants.message_types.payment)
    return filtered
}

const hideTypes=['purchase','purchase_accept','purchase_deny']
function processMsgs(msgs: Msg[], isTribe:boolean, contacts: Contact[]){
  const ms = []
  if(!msgs) return ms
  for(let i=0; i<msgs.length; i++){
    let skip = false
    const msg = msgs[i]
    msg.showInfoBar = calcShowInfoBar(msgs, msg, i, isTribe)
    const typ = constantCodes['message_types'][msg.type]

    // attachment logic
    if(typ==='attachment' && msg.sender!==1){ // not from me
      const ldat = parseLDAT(msg.media_token)
      if(ldat.muid&&ldat.meta&&ldat.meta.amt) {
        const accepted = msgs.find(m=>{
          const mtype = constantCodes['message_types'][m.type]
          const start = urlBase64FromAscii(ldat.host)+"."+ldat.muid
          return (mtype==='purchase_accept'&&m.media_token.startsWith(start)) ||
            (isTribe&&mtype==='purchase_accept'&&m.original_muid===ldat.muid)
        })
        if(accepted){
          msg.media_token = accepted.media_token
          msg.media_key = accepted.media_key
        }
      }
    }
    if(typ==='attachment' && msg.sender===1) { // from me
      const ldat = parseLDAT(msg.media_token)
      if(ldat&&ldat.muid&&ldat.meta&&ldat.meta.amt) {
        const purchase = msgs.find(m=>{
          const mtype = constantCodes['message_types'][m.type]
          const start =   (ldat.host)+"."+ldat.muid
          return mtype==='purchase'&&m.media_token.startsWith(start)
        })
        if(purchase) {
          msg.sold = true
        }
      }
    }

    // reply logic
    if(typ==='message' && msg.reply_uuid) {
      let senderAlias = ''
      const repmsg = msgs.find(m=>m.uuid===msg.reply_uuid)
      if(repmsg) senderAlias = repmsg.sender_alias
      if(!senderAlias&&!isTribe&&repmsg&&repmsg.sender){
        const contact = contacts.find(c=> c.id===repmsg.sender)
        senderAlias = contact.alias
      }
      if(repmsg) msg.reply_message_content = repmsg.message_content
      msg.reply_message_sender_alias = senderAlias
    }

    if(hideTypes.includes(typ)) skip=true
    if(!skip) ms.push(msg)
  }
  return ms
}

// LIST IS REVERSED
// need to filter out purchase, purchase_accept, purchase_deny
const filterOut = ['purchase','purchase_accept','purchase_deny']
function getPrevious(msgs: Msg[], i:number){
  if(i===msgs.length-1) return null
  const previous = msgs[i+1]
  const mtype = constantCodes['message_types'][previous.type]
  if(filterOut.includes(mtype)) {
    return getPrevious(msgs, i+1)
  }
  return previous
}

const msgTypesNoInfoBar=[constants.message_types.member_request, constants.message_types.member_approve, constants.message_types.member_reject]
// only show info bar if first in a group from contact
function calcShowInfoBar(msgs: Msg[], msg: Msg, i: number, isTribe:boolean){
  if(msgTypesNoInfoBar.includes(msg.type)) return false
  const previous = getPrevious(msgs, i)
  if(!previous) return true
  if(isTribe && msg.sender!==1) { // for self msgs, do normal way
    if(previous.sender_alias===msg.sender_alias && previous.type!==constants.message_types.group_join) {
      return false
    }
  } else {
    if(previous.sender===msg.sender && previous.type!==constants.message_types.group_join) {
      return false
    }
  }
  return true
}

function injectDates(msgs: Msg[]){
  let currentDate = ''
  const ms = []
  for(let i=0; i<msgs.length; i++){
    const msg = msgs[i]
    const dateString = moment(msg.date).format('dddd DD')
    if(dateString !== currentDate){
      if(i>0) ms.splice(i+1, 0, {dateLine:currentDate,id:rando()}) // inject date string
      currentDate = dateString
    }
    ms.push(msg)
  }
  return ms
}

function arraysEqual(_arr1, _arr2) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length!==_arr2.length) {
    return false
  }
  var arr1 = _arr1.concat().sort()
  var arr2 = _arr2.concat().sort()

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}

function rando(){
  return Math.random().toString(12).substring(0)
}

export function useParsedGiphyMsg(message_content:string){
  const arr = message_content.split('::')
  if(!(arr&&arr[1])) return {}
  const dec = base64.decode(arr[1])
  try {
    const r = JSON.parse(dec)
    const aspectRatio = parseFloat(r.aspect_ratio)
    const thumb = r.url.replace(/giphy.gif/g, '200w.gif')
    return {...r,aspectRatio,thumb}
  } catch(e) {
    return {}
  }
}