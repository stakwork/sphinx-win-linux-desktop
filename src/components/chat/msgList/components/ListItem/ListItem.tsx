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
  return useMemo(() => <Message {...msg}
    isGroup={isGroup} isTribe={isTribe}
    senderAlias={senderAlias} senderPhoto={senderPhoto}
    onDelete={onDelete} myPubkey={myPubkey} windowWidth={windowWidth}
    onApproveOrDenyMember={onApproveOrDenyMember} onDeleteChat={onDeleteChat}
  />, [m.id, m.type, m.media_token, m.status, m.sold])
}