import React, {useRef, useState, useCallback} from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { ScrollView, RefreshControl, View, Text, StyleSheet, Image } from 'react-native'
import {Chat} from '../../store/chats'
import Message from './msg'
import {Msg} from '../../store/msg'
import moment from 'moment'
import { constants } from '../../constants'

export default function MsgListWrap({chat}:{chat: Chat}){
  const {msg,chats} = useStores()
  return useObserver(()=>{
    let theID = chat.id
    if(!theID) { // for very beginning, where chat doesnt have id
      const theChat = chats.chats.find(ch=>arraysEqual(ch.contact_ids, chat.contact_ids))
      if(theChat) theID = theChat.id // new chat pops in, from first message confirmation!
    }
    const msgs = msg.messages[theID]
    const msgsWithDates = msgs && injectDates(msgs)
    const ms = msgsWithDates || []
    const filtered = ms.filter(m=> m.type!==constants.message_types.payment)
    return <MsgList msgs={filtered} msgsLength={filtered.length}/>
  })
}

function MsgList({msgs,msgsLength}) {
  const scrollViewRef = useRef(null)

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    wait(2000).then(() => setRefreshing(false))
  }, [refreshing])

  function scrollToBottom(contentHeight) {
    if (contentHeight > 0) {
      scrollViewRef.current.scrollTo({y: contentHeight})
    }
  }

  return useObserver(()=>
    <ScrollView style={styles.scroller}
      ref={scrollViewRef}
      contentContainerStyle={{flexGrow:1}} horizontal={false}
      onContentSizeChange={(w, h) => scrollToBottom(h)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.msgList}>
        {msgs.map((m,i)=> {
          if (typeof m==='string') {
            return <DateLine key={i} dateString={m} />
          }
          return <Message key={i} {...m} />
        })}
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