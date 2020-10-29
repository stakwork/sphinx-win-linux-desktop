import React, { useRef, useState, useCallback, useEffect } from 'react'
import { View, Text, Keyboard, Dimensions, VirtualizedList } from 'react-native'
import { useStores } from '../../../../../store'
import { wait, debounce } from '../../helpers'
import { constants } from '../../../../../constants'
import { ListItem } from '..'
import EE, {SHOW_REFRESHER} from '../../../../utils/ee'
import Refresher from '../Refresher'

const group = constants.chat_types.group
const tribe = constants.chat_types.tribe

export default function MsgList({ msgs, msgsLength, chat, setReplyUUID, replyUuid, onDelete, myPubkey, onApproveOrDenyMember, onDeleteChat, onLoadMoreMsgs, lastUpdated }) {
  const scrollViewRef = useRef(null)
  // const [viewableIds, setViewableIds] = useState({})
  const { contacts, msg, ui } = useStores()

  const resolvePendingsHandler = async () => await msg.resolvePendings();

  useEffect(() => {
    if (msg.netInfo.isConnected && ui.connected) {
      if (
        msg.pendingPayInvoice.length ||
        msg.pendingSendMessage.length ||
        msg.pendingAttachments.length ||
        msg.pendingSendPayment.length ||
        msg.pendingSendAnonPayment.length ||
        msg.pendingPurchaseMedia.length ||
        msg.pendingDeleteMessage.length ||
        msg.pendingSeeChat.length ||
        msg.pendingSendInvoice.length ||
        msg.pendingCreateRawInvoice.length
      ) {
        resolvePendingsHandler()
      }
    }
  }, [msg.netInfo.isConnected, ui.connected])

  const [refreshing, setRefreshing] = useState(false)
  // const onRefresh = useCallback(() => {
  //   setRefreshing(true)
  //   wait(2000).then(() => setRefreshing(false))
  // }, [refreshing])

  async function onEndReached() {
    EE.emit(SHOW_REFRESHER)
    wait(10).then(onLoadMoreMsgs)
  }


  useEffect(() => {
    const ref = setTimeout(() => {
      if (scrollViewRef && scrollViewRef.current && msgs.length) {
        scrollViewRef.current.scrollToOffset({ offset: 0 })
      }
    }, 500)
    Keyboard.addListener('keyboardDidShow', e => {
      if (scrollViewRef && scrollViewRef.current && msgs.length) {
        scrollViewRef.current.scrollToOffset({ offset: 0 })
      }
    })
    return () => {
      clearTimeout(ref)
      Keyboard.removeListener('keyboardDidShow', () => {})
      scrollViewRef.current = null;
    }
  }, [msgsLength])

  if (chat.status === constants.chat_statuses.pending) {
    return <View style={{ display: 'flex', alignItems: 'center' }}>
      <Text style={{ marginTop: 27 }}>Waiting for admin approval</Text>
    </View>
  }

  const windowWidth = Math.round(Dimensions.get('window').width)

  const isGroup = chat.type === group
  const isTribe = chat.type === tribe
  const initialNumToRender = 20

  return (<>
    <Refresher />
    <VirtualizedList
      accessibilityLabel="message-list"
      inverted
      windowSize={10} // ?
      ref={scrollViewRef}
      data={msgs}
      initialNumToRender={initialNumToRender}
      initialScrollIndex={0}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      viewabilityConfig={{
        waitForInteraction: false,
        viewAreaCoveragePercentThreshold: 20
      }}
      onViewableItemsChanged={({ viewableItems, changed }) => {
        // debounce(() => {
        //   const ids = {}
        //   if (viewableItems) {
        //     viewableItems.forEach(c => {
        //       if (c.item.id) ids[c.item.id] = true
        //     })
        //   }
        //   setViewableIds(current => ({ ...current, ...ids }))
        // }, 200)
      }}
      renderItem={({ item, index }) => {
        let senderAlias = ''
        const sender = contacts.contacts.find(c => c.id === item.sender)
        const senderPhoto = !isTribe && (sender && sender.photo_url) || ''
        if (isTribe) {
          senderAlias = item.sender_alias
        } else {
          senderAlias = sender && sender.alias
        }
        return <ListItem key={item.id}
          windowWidth={windowWidth}
          // viewable={viewableIds[item.id] === true}
          m={item} chat={chat}
          senderAlias={senderAlias} senderPhoto={senderPhoto}
          isGroup={isGroup} isTribe={isTribe}
          onDelete={onDelete} myPubkey={myPubkey}
          onApproveOrDenyMember={onApproveOrDenyMember}
          onDeleteChat={onDeleteChat}
        />
      }}
      keyExtractor={(item: any) => item.id + ''}
      getItemCount={() => msgs.length}
      getItem={(data, index) => (data[index])}
      ListHeaderComponent={<View style={{ height: 13 }} />}
    />
  </>)
}