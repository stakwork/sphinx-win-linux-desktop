import React, {useState, useEffect, useRef} from 'react'
import TextMsg from './textMsg'
import PaymentMessage from './paymentMsg'
import MediaMsg from './mediaMsg'
import Invoice from './invoice'
import {View, Clipboard, StyleSheet} from 'react-native'
import {constantCodes, constants} from '../../../constants'
import InfoBar from './infoBar'
import sharedStyles from './sharedStyles'
import GroupNotification from './groupNotification'
import Popup from './popup'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import {SwipeRow} from 'react-native-swipe-list-view'
import {IconButton} from 'react-native-paper'
import ReplyContent from './replyContent' 

export default function MsgRow(props){
  const [copied, setCopied] = useState(false)
  const [showReply, setShowReply] = useState(false)
  function onCopy(msg){
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true
    })
    Clipboard.setString(msg||'')
    setCopied(true)
    setTimeout(()=> setCopied(false), 2000)
  }

  const isMe = props.sender===1
  const isInvoice = props.type===constants.message_types.invoice
  const isPaid = props.status===constants.statuses.confirmed

  const swipeRowRef = useRef<any>(null)
  useEffect(()=>{
    if(!props.replyUuid && showReply) {
      const sr = swipeRowRef.current
      if(sr&&sr.closeRow) sr.closeRow()
      setShowReply(false)
    }
  },[props.replyUuid])

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
    <SwipeRow 
      ref={swipeRowRef}
      disableRightSwipe={true} friction={100}
      disableLeftSwipe={!props.message_content}
      rightOpenValue={-60} stopRightSwipe={-60}
      onRowOpen={()=> {
        if(props.setReplyUUID&&props.message_content) {
          props.setReplyUUID(props.uuid)
          setShowReply(true)
        }
      }}
      onRowClose={()=> {
        if(props.setReplyUUID) props.setReplyUUID('')
        setShowReply(false)
      }}
      >
      <View style={styles.replyWrap}>
        {showReply && <IconButton icon="reply" size={32} color="#aaa"
          style={{marginLeft:0,marginRight:15}} 
        />}
      </View>
      <View style={{...sharedStyles.bubble,
        alignSelf: isMe?'flex-end':'flex-start',
        backgroundColor, borderColor,
        borderStyle:dashed?'dashed':'solid',
        overflow:'hidden',
      }}>
        {(props.reply_message_content?true:false) && <ReplyContent 
          reply_message_content={props.reply_message_content}
          reply_message_sender_alias={props.reply_message_sender_alias}
        />}
        <Message {...props} onCopy={onCopy}/>
      </View>
    </SwipeRow>
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

const styles = StyleSheet.create({
  replyWrap:{
    width:'100%',
    display:'flex',
    justifyContent:'flex-end',
    flexDirection:'row',
    alignItems:'center',
  }
})