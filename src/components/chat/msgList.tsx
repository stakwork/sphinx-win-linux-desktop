import React, {useRef, useState, useCallback, useEffect} from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { ScrollView, RefreshControl, View, Text, StyleSheet, Keyboard } from 'react-native'
import {Chat} from '../../store/chats'
import Message from './msg'
import {Msg} from '../../store/msg'
import moment from 'moment'
import { constants,constantCodes } from '../../constants'
import {parseLDAT,urlBase64FromAscii} from '../utils/ldat'

const group = constants.chat_types.group
const tribe = constants.chat_types.tribe

export default function MsgListWrap({chat,setReplyUUID,replyUuid}:{chat:Chat,setReplyUUID,replyUuid}){
  const {msg,chats,ui} = useStores()
  const [max, setMax] = useState(0)
  useEffect(()=>{
    (async () => {
      setMax(10) // first render just 10
      await sleep(150)
      setMax(Infinity) // then the rest
    })()
  },[])

  const isTribe = chat.type===tribe
  return useObserver(()=>{
    let theID = chat.id
    if(!theID) { // for very beginning, where chat doesnt have id
      const theChat = chats.chats.find(ch=>ch.type===0 && arraysEqual(ch.contact_ids, chat.contact_ids)) // this is the problem
      if(theChat) theID = theChat.id // new chat pops in, from first message confirmation!
    }
    const msgs = msg.messages[theID]
    const messages = processMsgs(msgs, isTribe)
    const msgsWithDates = msgs && injectDates(messages)
    const ms = msgsWithDates || []
    const filtered = ms.filter(m=> m.type!==constants.message_types.payment)
    let final = []
    if(max) final = filtered.slice(0).slice(max * -1)
    return <MsgList msgs={final} chat={chat} setReplyUUID={setReplyUUID} replyUuid={replyUuid} />
  })
}

function MsgList({msgs, chat, setReplyUUID, replyUuid}) {
  const scrollViewRef = useRef(null)
  const [y,setY] = useState(0)

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    wait(2000).then(() => setRefreshing(false))
  }, [refreshing])

  function scrollToBottom(contentHeight) {
    if (contentHeight > 0) {
      scrollViewRef.current.scrollToEnd({duration: 500})
    }
  }

  useEffect(()=>{
    setTimeout(()=>{
      scrollViewRef.current.scrollToEnd({duration: 500})
    },500)
    Keyboard.addListener('keyboardDidShow', e=>{
      if(scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({duration: 500})
      }
    })
  },[msgs.length])

  const isGroup = chat.type===group
  const isTribe = chat.type===tribe
  return useObserver(()=> 
    <ScrollView style={styles.scroller}
      contentContainerStyle={{flexGrow:1}} // add paddingBottom?
      ref={scrollViewRef}
      onScroll={e=> {
        const y = e.nativeEvent.contentOffset.y
        debounce(()=> setY(y), 50)
      }}
      horizontal={false}
      // onContentSizeChange={(w, h) => scrollToBottom(h)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.msgList}>
        {msgs.map((m,i)=> {
          if (typeof m==='string') {
            return <DateLine key={i} dateString={m} />
          }
          const msg=m
          if(!m.chat) msg.chat = chat
          return <Message key={i} {...m} y={y} isGroup={isGroup} isTribe={isTribe} 
            setReplyUUID={setReplyUUID} replyUuid={replyUuid}
          />
        })}
        <View style={{height:20,width:'100%'}} />
      </View>
    </ScrollView>
  )
}

function DateLine({dateString}){
  return <View style={styles.dateLine}>
    <View style={styles.line}></View>
    <Text style={styles.dateString}>{dateString}</Text>
  </View>
}

const styles = StyleSheet.create({
  scroller:{
    flex:1,
    overflow:'scroll',
    flexDirection:'column',
  },
  msgList:{
    flex:1,
  },
  line:{
    borderBottomWidth:1,
    borderColor:'#ddd',
    width:'90%',
    position:'absolute',
    left:'5%',
    top:10
  },
  dateLine:{
    width:'100%',
    display:'flex',
    height:20,
    marginBottom:10,
    marginTop:10,
    flexDirection:'row',
    justifyContent:'center',
    position:'relative',
  },
  dateString:{
    fontSize:12,
    backgroundColor:'white',
    paddingLeft:16,
    paddingRight:16
  }
})

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const hideTypes=['purchase','purchase_accept','purchase_deny']
function processMsgs(msgs: Msg[], isTribe:boolean){
  const ms = []
  if(!msgs) return ms
  for(let i=0; i<msgs.length; i++){
    let skip = false
    const msg = msgs[i]
    msg.showInfoBar = calcShowInfoBar(msgs, msg, i, isTribe)
    const typ = constantCodes['message_types'][msg.type]

    // attachment logic
    if(typ==='attachment' && msg.sender!==1){ // not from me
      const ldat = parseLDAT(msg.media_token)
      if(ldat.muid&&ldat.meta&&ldat.meta.amt) {
        const accepted = msgs.find(m=>{
          const mtype = constantCodes['message_types'][m.type]
          const start = urlBase64FromAscii(ldat.host)+"."+ldat.muid
          return (mtype==='purchase_accept'&&m.media_token.startsWith(start)) ||
            (isTribe&&mtype==='purchase_accept'&&m.original_muid===ldat.muid)
        })
        if(accepted){
          msg.media_token = accepted.media_token
          msg.media_key = accepted.media_key
        }
      }
    }
    if(typ==='attachment' && msg.sender===1) { // from me
      const ldat = parseLDAT(msg.media_token)
      if(ldat.muid&&ldat.meta&&ldat.meta.amt) {
        const purchase = msgs.find(m=>{
          const mtype = constantCodes['message_types'][m.type]
          const start = urlBase64FromAscii(ldat.host)+"."+ldat.muid
          return mtype==='purchase'&&m.media_token.startsWith(start)
        })
        if(purchase) {
          msg.sold = true
        }
      }
    }

    if(hideTypes.includes(typ)) skip=true
    if(!skip) ms.push(msg)
  }
  return ms
}

// need to filter out purchase, purchase_accept, purchase_deny
const filterOut = ['purchase','purchase_accept','purchase_deny']
function getPrevious(msgs: Msg[], i:number){
  if(i===0) return null
  const previous = msgs[i-1]
  const mtype = constantCodes['message_types'][previous.type]
  if(filterOut.includes(mtype)) {
    return getPrevious(msgs, i-1)
  }
  return previous
}
// only show info bar if first in a group from contact
function calcShowInfoBar(msgs: Msg[], msg: Msg, i: number, isTribe:boolean){
  const previous = getPrevious(msgs, i)
  if(previous===null) return true
  if(isTribe && msg.sender!==1) { // for self msgs, do normal way
    if(previous.sender_alias===msg.sender_alias && previous.type!==constants.message_types.group_join) {
      return false
    }
  } else {
    if(previous.sender===msg.sender && previous.type!==constants.message_types.group_join) {
      return false
    }
  }
  return true
}

function injectDates(msgs: Msg[]){
  let currentDate = ''
  const ms = []
  for(let i=0; i<msgs.length; i++){
    const msg = msgs[i]
    const dateString = moment(msg.date).format('dddd DD')
    if(dateString !== currentDate){
      ms.splice(i===0?0:i+1, 0, dateString) // inject date string
      currentDate = dateString
    }
    ms.push(msg)
  }
  return ms
}


function arraysEqual(_arr1, _arr2) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length!==_arr2.length) {
    return false
  }
  var arr1 = _arr1.concat().sort()
  var arr2 = _arr2.concat().sort()

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
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