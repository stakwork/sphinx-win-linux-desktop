import { ToastAndroid } from 'react-native'
import {calcBotPrice} from '../../../../store/hooks/chat'

export default function sendMessage(
    text,
    chat,
    tribeBots,
    msg,
    pricePerMessage,
    replyUuid,
    setText,
    setReplyUUID,
) {
  if(!text) return
  let contact_id=chat.contact_ids.find(cid=>cid!==1)
  let {price, failureMessage} = calcBotPrice(tribeBots,text)
  if(failureMessage) {
    ToastAndroid.showWithGravityAndOffset(failureMessage, ToastAndroid.SHORT, ToastAndroid.TOP, 0, 125)
    return
  }
  msg.sendMessage({
    contact_id,
    text,
    chat_id: chat.id||null,
    amount:(price+pricePerMessage)||0,
    reply_uuid:replyUuid||''
  })
  setText({ type: 'setText', payload: '' })
  setReplyUUID('')
  // inputRef.current.blur()
  // setInputFocused(false)
}