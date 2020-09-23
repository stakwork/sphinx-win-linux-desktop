import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import TextMsg from './textMsg'
import PaymentMessage from './paymentMsg'
import MediaMsg from './mediaMsg'
import Invoice from './invoice'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { constantCodes, constants } from '../../../constants'
import InfoBar from './infoBar'
import sharedStyles from './sharedStyles'
import GroupNotification from './groupNotification'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { SwipeRow } from 'react-native-swipe-list-view'
import { IconButton, ActivityIndicator } from 'react-native-paper'
import ReplyContent from './replyContent'
import { Popover, PopoverTouchable, PopoverController } from 'react-native-modal-popover';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Avatar from './avatar'
import MemberRequest from './memberRequest'
import Clipboard from "@react-native-community/clipboard";
import BotResMsg from './botResMsg'

export default function MsgRow(props) {
  const [showReply, setShowReply] = useState(false)

  const swipeRowRef = useRef<any>(null)
  useEffect(() => {
    if (!props.replyUuid && showReply) {
      const sr = swipeRowRef.current
      if (sr && sr.closeRow) sr.closeRow()
      setShowReply(false)
    }
  }, [props.replyUuid])

  const isGroupNotification = props.type === constants.message_types.group_join || props.type === constants.message_types.group_leave
  if (isGroupNotification) {
    return <GroupNotification {...props} />
  }

  const chat = props.chat
  let isTribe = false
  let isTribeOwner = false
  if (chat) {
    isTribe = chat.type === constants.chat_types.tribe
    isTribeOwner = chat.owner_pubkey === props.myPubkey
  }

  const memberReqTypes = [constants.message_types.member_request, constants.message_types.member_approve, constants.message_types.member_reject]
  const isMemberRequest = memberReqTypes.includes(props.type)
  if (isMemberRequest) {
    return <MemberRequest {...props} isTribeOwner={isTribeOwner}
      onDeleteChat={props.onDeleteChat}
    />
  }

  const isMe = props.sender === 1
  const w = props.windowWidth
  // console.log("RERENDER MESG",props.id)
  return <View style={{
    display: 'flex', width: '100%', flexDirection: 'row',
    marginTop: props.showInfoBar ? 20 : 0
  }}>
    <Avatar alias={props.senderAlias}
      photo={props.senderPhoto}
      hide={!props.showInfoBar || isMe}
    />
    <View style={{ display: 'flex', width: w - 40 }}>
      {props.showInfoBar && <InfoBar {...props} senderAlias={props.senderAlias} />}
      <SwipeRow
        ref={swipeRowRef}
        disableRightSwipe={true} friction={100}
        disableLeftSwipe={!props.message_content}
        rightOpenValue={-60} stopRightSwipe={-60}
        onRowOpen={() => {
          if (props.setReplyUUID && props.message_content) {
            props.setReplyUUID(props.uuid)
            setShowReply(true)
          }
        }}
        onRowClose={() => {
          if (props.setReplyUUID) props.setReplyUUID('')
          setShowReply(false)
        }}
      >
        <View style={styles.replyWrap}>
          {showReply && <IconButton icon="reply" size={32} color="#aaa"
            style={{ marginLeft: 0, marginRight: 15 }}
          />}
        </View>
        <MsgBubble {...props} isTribe={isTribe} isTribeOwner={isTribeOwner} />
      </SwipeRow>
    </View>
  </View>
}

function MsgBubble(props) {
  const [deleting, setDeleting] = useState(false)
  const isMe = props.sender === 1
  const isInvoice = props.type === constants.message_types.invoice
  const isPaid = props.status === constants.statuses.confirmed

  let dashed = false
  let backgroundColor = isMe ? 'whitesmoke' : 'white'
  let borderColor = '#DADFE2'
  if (isInvoice && !isPaid) {
    backgroundColor = 'white'
    dashed = true
    borderColor = '#777'
    if (!isMe) borderColor = '#4AC998'
  }
  const isDeleted = props.status === constants.statuses.deleted
  return <PopoverController>
    {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
      <>
        <View ref={setPopoverAnchor} style={{
          ...sharedStyles.bubble,
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor, borderColor,
          borderStyle: dashed ? 'dashed' : 'solid',
          overflow: 'hidden',
        }}>
          {isDeleted && <DeletedMsg />}
          {!isDeleted && (props.reply_message_content ? true : false) && <ReplyContent
            reply_message_content={props.reply_message_content}
            reply_message_sender_alias={props.reply_message_sender_alias}
          />}
          {!isDeleted && <Message {...props} onLongPress={() => {
            ReactNativeHapticFeedback.trigger("impactLight", {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false
            })
            openPopover()
          }} />}
        </View>
        <Popover
          contentStyle={styles.content}
          arrowStyle={styles.arrow}
          backgroundStyle={styles.background}
          visible={popoverVisible}
          onClose={closePopover}
          fromRect={popoverAnchorRect}
          placement="top"
          supportedOrientations={['portrait', 'landscape']}
        >
          <TouchableOpacity onPress={() => {
            Clipboard.setString(props.message_content || '')
            closePopover()
          }}
            style={{ padding: 6 }}>
            <Text style={{ textAlign: 'center' }}>Copy</Text>
          </TouchableOpacity>
          {(isMe || props.isTribeOwner) && <TouchableOpacity onPress={async () => {
            if (!deleting) {
              setDeleting(true)
              await props.onDelete(props.id)
              closePopover()
              setDeleting(false)
            }
          }}
            style={{ padding: 6, borderTopWidth: 1, borderTopColor: '#ddd', display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            {deleting && <ActivityIndicator color="#888" size={10} />}
            <Text style={{ textAlign: 'center', marginLeft: 6 }}>Delete</Text>
          </TouchableOpacity>}
        </Popover>
      </>
    )}
  </PopoverController>
}

// only show "messages"
// also "group_join" and "group_leave"
function Message(props) {
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
    case 'bot_res':
      return <BotResMsg {...props} />
    default:
      return <></>
  }
}

function DeletedMsg() {
  return <View style={{ padding: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <Icon color="#aaa" size={12} name="cancel" />
    <Text style={{ color: '#aaa', marginLeft: 5 }}>This message has been deleted</Text>
  </View>
}

const styles = StyleSheet.create({
  replyWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 100,
  },
  arrow: {
    borderTopColor: 'white',
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)'
  },
})