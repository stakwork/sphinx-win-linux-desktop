import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useObserver } from 'mobx-react-lite'
import { useStores, hooks, useTheme } from '../../store'
import { VirtualizedList, View, Text, StyleSheet, Keyboard, Dimensions, ActivityIndicator } from 'react-native'
import { Chat } from '../../store/chats'
import Message from './msg'
import { useNavigation } from '@react-navigation/native'
import { constants } from '../../constants'
import EE, {SHOW_REFRESHER} from '../utils/ee'

const { useMsgs } = hooks

const group = constants.chat_types.group
const tribe = constants.chat_types.tribe

export default function MsgListWrap({ chat }: { chat: Chat }) {
  const { msg, ui, user, chats } = useStores()
  const [limit, setLimit] = useState(40)

  function onLoadMoreMsgs() {
    setLimit(c => c + 40)
  }

  async function onBoostMsg(){
    console.log('onBoostMsg')
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
      msgs={msgs}
      msgsLength={(msgs && msgs.length) || 0}
      chat={chat}
      onDelete={onDelete}
      myPubkey={user.publicKey}
      onApproveOrDenyMember={onApproveOrDenyMember}
      onDeleteChat={onDeleteChat}
      onLoadMoreMsgs={onLoadMoreMsgs}
      onBoostMsg={onBoostMsg}
    />
  })
}

function MsgList({ msgs, msgsLength, chat, onDelete, myPubkey, onApproveOrDenyMember, onDeleteChat, onLoadMoreMsgs, onBoostMsg }) {
  const scrollViewRef = useRef(null)
  const theme = useTheme()
  // const [viewableIds, setViewableIds] = useState({})
  const { contacts } = useStores()

  // const onRefresh = useCallback(() => {
  //   console.log("ON REFRSH")
  //   setRefreshing(true)
  //   wait(2000).then(() => setRefreshing(false))
  // }, [refreshing])

  async function onEndReached() {
    // EE.emit(SHOW_REFRESHER)
    wait(10).then(onLoadMoreMsgs)
  }

  useEffect(() => {
    const ref = setTimeout(() => {
      if (scrollViewRef && scrollViewRef.current && msgs && msgs.length) {
        scrollViewRef.current.scrollToOffset({ offset: 0 })
      }
    }, 500)
    Keyboard.addListener('keyboardDidShow', e => {
      if (scrollViewRef && scrollViewRef.current && msgs && msgs.length) {
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
      <Text style={{ marginTop: 27, color:theme.subtitle }}>Waiting for admin approval</Text>
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
      style={{zIndex:100}}
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
          onBoostMsg={onBoostMsg}
        />
      }}
      keyExtractor={(item: any) => item.id + ''}
      getItemCount={() => msgs.length}
      getItem={(data, index) => (data[index])}
      ListHeaderComponent={<View style={{ height: 13 }} />}
    />
  </>)
}

function Refresher(){
  const [show,setShow] = useState(false)
  useEffect(()=>{
    function doShow(){
      setShow(true)
      setTimeout(()=>{
        setShow(false)
      }, 1000)
    }
    EE.on(SHOW_REFRESHER, doShow)
    return ()=> EE.removeListener(SHOW_REFRESHER,doShow)
  },[])
  if(!show) return <></>
  return <View style={{...styles.refreshingWrap,height:show?60:0}}>
    <View style={styles.refreshingCircle}>
      <ActivityIndicator animating={true} color="grey" size={25} />
    </View>
  </View>
}

function ListItem({ m, chat, isGroup, isTribe, onDelete, myPubkey, senderAlias, senderPhoto, windowWidth, onApproveOrDenyMember, onDeleteChat, onBoostMsg }) {
  // if (!viewable) { /* THESE RENDER FIRST????? AND THEN THE ACTUAL MSGS DO */
  //   return <View style={{ height: 50, width: 1 }} />
  // }
  if (m.dateLine) {
    return <DateLine dateString={m.dateLine} />
  }
  const msg = m
  if (!m.chat) msg.chat = chat
  return useMemo(() => <Message {...msg}
    isGroup={isGroup} isTribe={isTribe}
    senderAlias={senderAlias} senderPhoto={senderPhoto}
    onDelete={onDelete} myPubkey={myPubkey} windowWidth={windowWidth}
    onApproveOrDenyMember={onApproveOrDenyMember} onDeleteChat={onDeleteChat}
    onBoostMsg={onBoostMsg}
  />, [m.id, m.type, m.media_token, m.status, m.sold])
}

function DateLine({ dateString }) {
  const theme = useTheme()
  return <View style={styles.dateLine}>
    <View style={styles.line}></View>
    <Text style={{...styles.dateString,
      backgroundColor:theme.dark?theme.bg:'white',
      color:theme.title
    }}>
      {dateString}
    </Text>
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
    overflow:'hidden'
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