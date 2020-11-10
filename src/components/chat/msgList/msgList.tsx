import React, { useState } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks } from '../../../store'
import { Chat } from '../../../store/chats'
import { useNavigation } from '@react-navigation/native'
const { useMsgs } = hooks
import { MsgList } from './components'

export default function MsgListWrap({ chat }: { chat: Chat }) {
  const { msg, user, chats } = useStores()

  const [limit, setLimit] = useState(40)

  function onLoadMoreMsgs() {
    setLimit(c => c + 40)
  }

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
    const msgs = useMsgs(chat, limit) || []
    return <MsgList
      lastUpdated={msg.lastUpdated}
      msgs={msgs}
      msgsLength={(msgs && msgs.length) || 0}
      chat={chat}
      onDelete={onDelete}
      myPubkey={user.publicKey}
      onApproveOrDenyMember={onApproveOrDenyMember}
      onDeleteChat={onDeleteChat}
      onLoadMoreMsgs={onLoadMoreMsgs}
    />
  })
}