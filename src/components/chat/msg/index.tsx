import React, {useState, useEffect} from 'react'
import TextMsg from './textMsg'
import PaymentMessage from './paymentMsg'
import MediaMsg from './mediaMsg'
import Invoice from './invoice'
import {View, Clipboard, Text} from 'react-native'
import {constantCodes, constants} from '../../../constants'
import InfoBar from './infoBar'
import sharedStyles from './sharedStyles'
import GroupNotification from './groupNotification'
import Popup from './popup'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export default function MsgRow(props){
  const [copied, setCopied] = useState(false)
  function onCopy(msg){
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    })
    Clipboard.setString(msg||'')
    setCopied(true)
    setTimeout(()=> setCopied(false), 2000)
  }

  const isMe = props.sender===1
  const isInvoice = props.type===constants.message_types.invoice
  const isPaid = props.status===constants.statuses.confirmed

  const isGroupNotification = props.type===constants.message_types.group_join || props.type===constants.message_types.group_leave
  if(isGroupNotification) {
    return <GroupNotification {...props} />
  }

  let dashed = false
  let backgroundColor = isMe?'whitesmoke':'white'
  let borderColor = '#DADFE2'
  if(isInvoice && !isPaid) {
    backgroundColor='white'
    dashed = true
    borderColor = '#777'
    if(!isMe) borderColor='#4AC998'
  }

  return <View style={{display:'flex',width:'100%',
      marginTop:props.showInfoBar?20:0
    }}>
    {props.showInfoBar && <InfoBar {...props} />}
    <View style={{...sharedStyles.bubble,
      alignSelf: isMe?'flex-end':'flex-start',
      backgroundColor, borderColor,
      borderStyle:dashed?'dashed':'solid',
      overflow:'hidden',
    }}>
      <Message {...props} onCopy={onCopy}/>
    </View>
    {copied && <Popup {...props} />}
  </View>
}

// only show "messages"
// also "group_join" and "group_leave"
function Message(props){
  const typ = constantCodes['message_types'][props.type]
  switch (typ) {
    case 'message':
      return <TextMsg {...props} />
    case 'attachment':
      return <MediaMsg {...props} />
    case 'invoice':
      return <Invoice {...props} />
    case 'payment':
      return <PaymentMessage {...props} />
    case 'direct_payment':
      return <PaymentMessage {...props} />
    case 'attachment':
      return <TextMsg {...props} />
    default:
      return <></>
  }
}

