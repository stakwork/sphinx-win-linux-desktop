import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks, useTheme } from '../../store'
import { VirtualizedList, View, Text, StyleSheet, Keyboard, Dimensions, ActivityIndicator } from 'react-native'
import { Chat } from '../../store/chats'
import Message from './msg'
import { useNavigation } from '@react-navigation/native'
import { constants } from '../../constants'
const { useMsgs } = hooks

const group = constants.chat_types.group
const tribe = constants.chat_types.tribe

export default function MsgListWrap({ chat, setReplyUUID, replyUuid }: { chat: Chat, setReplyUUID, replyUuid }) {
  const { msg, ui, user, chats } = useStores()
  const [limit, setLimit] = useState(25)

  function onLoadMoreMsgs() {
    setLimit(c => c + 20)
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
      setReplyUUID={setReplyUUID}
      replyUuid={replyUuid}
      onDelete={onDelete}
      myPubkey={user.publicKey}
      onApproveOrDenyMember={onApproveOrDenyMember}
      onDeleteChat={onDeleteChat}
      onLoadMoreMsgs={onLoadMoreMsgs}
    />
  })
}

function MsgList({ msgs, msgsLength, chat, setReplyUUID, replyUuid, onDelete, myPubkey, onApproveOrDenyMember, onDeleteChat, onLoadMoreMsgs, lastUpdated }) {
  const scrollViewRef = useRef(null)
  const theme = useTheme()
  const [viewableIds, setViewableIds] = useState({})
  const { contacts } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  // const onRefresh = useCallback(() => {
  //   console.log("ON REFRSH")
  //   setRefreshing(true)
  //   wait(2000).then(() => setRefreshing(false))
  // }, [refreshing])

  async function onEndReached() {
    setRefreshing(true)
    wait(10).then(onLoadMoreMsgs)
    wait(200).then(() => setRefreshing(false))
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
  const initialNumToRender = 9

  return (<>
    {refreshing && <View style={styles.refreshingWrap}>
      <View style={styles.refreshingCircle}>
        <ActivityIndicator animating={true} color="grey" size={25} />
      </View>
    </View>}
    <VirtualizedList
      inverted
      windowSize={8} // ?
      ref={scrollViewRef}
      data={msgs}
      extraData={replyUuid}
      initialNumToRender={initialNumToRender}
      initialScrollIndex={0}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      viewabilityConfig={{
        waitForInteraction: false,
        viewAreaCoveragePercentThreshold: 20
      }}
      onViewableItemsChanged={({ viewableItems, changed }) => {
        debounce(() => {
          const ids = {}
          if (viewableItems) {
            viewableItems.forEach(c => {
              if (c.item.id) ids[c.item.id] = true
            })
          }
          setViewableIds(current => ({ ...current, ...ids }))
        }, 200)
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
          viewable={viewableIds[item.id] === true}
          m={item} chat={chat}
          senderAlias={senderAlias} senderPhoto={senderPhoto}
          isGroup={isGroup} isTribe={isTribe}
          replyUuid={replyUuid} setReplyUUID={setReplyUUID}
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

function ListItem({ m, chat, isGroup, isTribe, setReplyUUID, replyUuid, viewable, onDelete, myPubkey, senderAlias, senderPhoto, windowWidth, onApproveOrDenyMember, onDeleteChat }) {
  // if (!viewable) { /* THESE RENDER FIRST????? AND THEN THE ACTUAL MSGS DO */
  //   return <View style={{ height: 50, width: 1 }} />
  // }
  if (m.dateLine) {
    return <DateLine dateString={m.dateLine} />
  }
  const msg = m
  if (!m.chat) msg.chat = chat
  return useMemo(() => <Message {...msg} viewable={viewable}
    isGroup={isGroup} isTribe={isTribe}
    senderAlias={senderAlias} senderPhoto={senderPhoto}
    setReplyUUID={setReplyUUID} replyUuid={replyUuid}
    onDelete={onDelete} myPubkey={myPubkey} windowWidth={windowWidth}
    onApproveOrDenyMember={onApproveOrDenyMember} onDeleteChat={onDeleteChat}
  />, [viewable, m.id, m.type, m.media_token, replyUuid, m.status, m.sold])
}

function DateLine({ dateString }) {
  return <View style={styles.dateLine}>
    <View style={styles.line}></View>
    <Text style={styles.dateString}>{dateString}</Text>
  </View>
}

const styles = StyleSheet.create({
  scroller: {
    flex: 1,
    overflow: 'scroll',
    flexDirection: 'column',
  },
  msgList: {
    flex: 1,
  },
  line: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    width: '90%',
    position: 'absolute',
    left: '5%',
    top: 10
  },
  dateLine: {
    width: '100%',
    display: 'flex',
    height: 20,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  dateString: {
    fontSize: 12,
    backgroundColor: 'white',
    paddingLeft: 16,
    paddingRight: 16
  },
  refreshingWrap:{
    position:'absolute',
    zIndex:102,
    top:55,
    width:'100%',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    height:60
  },
  refreshingCircle:{
    height:42,width:42,
    borderRadius:25,
    backgroundColor:'white',
    borderWidth:1,
    borderColor:'#ddd',
    borderStyle:'solid',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
  }
})

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

let inDebounce
function debounce(func, delay) {
  const context = this
  const args = arguments
  clearTimeout(inDebounce)
  inDebounce = setTimeout(() => func.apply(context, args), delay)
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}