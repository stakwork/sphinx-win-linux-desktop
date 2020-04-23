import React, {useRef, useState, useCallback, useEffect} from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { ScrollView, RefreshControl, View, Text, StyleSheet, Image } from 'react-native'
import {Chat} from '../../store/chats'
import Message from './msg'
import {Msg} from '../../store/msg'
import moment from 'moment'
import { constants,constantCodes } from '../../constants'
import {parseLDAT,urlBase64FromAscii} from '../utils/ldat'

const group = constants.chat_types.group

export default function MsgListWrap({chat}:{chat: Chat}){
  const {msg,chats} = useStores()
  const [ok, setOK] = useState(false)
  useEffect(()=>{
    setOK(true)
  },[])
  return useObserver(()=>{
    let theID = chat.id
    if(!theID) { // for very beginning, where chat doesnt have id
      const theChat = chats.chats.find(ch=>arraysEqual(ch.contact_ids, chat.contact_ids))
      if(theChat) theID = theChat.id // new chat pops in, from first message confirmation!
    }
    const msgs = msg.messages[theID]
    const messages = processMsgs(msgs)
    const msgsWithDates = msgs && injectDates(messages)
    const ms = msgsWithDates || []
    const filtered = ms.filter(m=> m.type!==constants.message_types.payment)
    return <MsgList msgs={ok?filtered:[]} chat={chat} />
  })
}

function MsgList({msgs, chat}) {
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
    
  },[msgs.length])

  const isGroup = chat.type===group
  return useObserver(()=>
    <ScrollView style={styles.scroller}
      ref={scrollViewRef}
      onScroll={e=> {
        const y = e.nativeEvent.contentOffset.y
        debounce(()=> setY(y), 50)
      }}
      contentContainerStyle={{flexGrow:1}} horizontal={false}
      // onContentSizeChange={(w, h) => scrollToBottom(h)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.msgList}>
        {msgs.map((m,i)=> {
          if (typeof m==='string') {
            return <DateLine key={i} dateString={m} />
          }
          const msg=m
          if(!m.chat) msg.chat = chat
          return <Message key={i} {...m} y={y} isGroup={isGroup} />
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
function processMsgs(msgs: Msg[]){
  const ms = []
  if(!msgs) return ms
  for(let i=0; i<msgs.length; i++){
    let skip = false
    const msg = msgs[i]
    msg.showInfoBar = calcShowInfoBar(msgs, msg, i)
    const typ = constantCodes['message_types'][msg.type]

    // attachment logic
    if(typ==='attachment' && msg.sender!==1){ // not from me
      const ldat = parseLDAT(msg.media_token)
      if(ldat.muid&&ldat.meta&&ldat.meta.amt) {
        const accepted = msgs.find(m=>{
          const mtype = constantCodes['message_types'][m.type]
          const start = urlBase64FromAscii(ldat.host)+"."+ldat.muid
          return mtype==='purchase_accept'&&m.media_token.startsWith(start)
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
// only show info bar if first in a group from contact
function calcShowInfoBar(msgs: Msg[], msg: Msg, i: number){
  if(i===0) return true
  const previous = msgs[i-1]
  if(previous.sender===msg.sender) {
    return false
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