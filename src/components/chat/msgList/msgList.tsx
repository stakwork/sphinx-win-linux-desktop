import React from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks } from '../../../store'
import { Chat } from '../../../store/chats'
import { useNavigation } from '@react-navigation/native'
const { useMsgs } = hooks
import { MsgList } from './components'

export default function MsgListWrap({ chat, setReplyUUID, replyUuid }: { chat: Chat, setReplyUUID, replyUuid }) {
  const { msg, user, chats } = useStores()

  async function onDelete(id) {
    await msg.deleteMessage(id)
  }
  async function onApproveOrDenyMember(contactId, status, msgId) {
    await msg.approveOrRejectMember(contactId, status, msgId)
  }
  const navigation = useNavigation()
  async function onDeleteChat() {
    navigation.navigate('Home', { params: { rnd: Math.random() } })
    await chats.exitGroup(chat.id)
  }
  return useObserver(() => {
    const msgs = useMsgs(chat) || []
    return <MsgList
      msgs={msgs}
      msgsLength={(msgs && msgs.length) || 0}
      chat={chat}
      setReplyUUID={setReplyUUID}
      replyUuid={replyUuid}
      onDelete={onDelete}
      myPubkey={user.publicKey}
      onApproveOrDenyMember={onApproveOrDenyMember}
      onDeleteChat={onDeleteChat}
    />
  })
}