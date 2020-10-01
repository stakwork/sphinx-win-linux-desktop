import React, { useMemo } from 'react'
import { DateLine } from '../'
import styles from '../../styles'
import Message from '../../../msg'
import { Props } from './types/props.interface'

export default function ListItem(props: Props) {
  const {
    m,
    chat,
    isGroup,
    isTribe,
    setReplyUUID,
    replyUuid,
    viewable,
    onDelete,
    myPubkey,
    senderAlias,
    senderPhoto,
    windowWidth,
    onApproveOrDenyMember,
    onDeleteChat,
  } = props
  // if (!viewable) { /* THESE RENDER FIRST????? AND THEN THE ACTUAL MSGS DO */
  //   return <View style={{ height: 50, width: 1 }} />
  // }
  if (m.dateLine) {
    return <DateLine dateString={m.dateLine} styles={styles} />
  }
  const msg = m
  if (!m.chat) msg.chat = chat
  return useMemo(() => <Message {...msg} viewable={viewable}
    isGroup={isGroup} isTribe={isTribe}
    senderAlias={senderAlias} senderPhoto={senderPhoto}
    setReplyUUID={setReplyUUID} replyUuid={replyUuid}
    onDelete={onDelete} myPubkey={myPubkey} windowWidth={windowWidth}
    onApproveOrDenyMember={onApproveOrDenyMember} onDeleteChat={onDeleteChat}
  />, [viewable, m.id, m.type, m.media_token, replyUuid, m.status])
}