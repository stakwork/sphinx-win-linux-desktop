import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { TouchableOpacity, ScrollView, RefreshControl, View, Text, StyleSheet, Image } from 'react-native'
import {allChats} from './utils'
import {Button} from 'react-native-paper'
import InviteRow, {styles} from './inviteRow'
import { useNavigation } from '@react-navigation/native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import {useChatPicSrc} from '../utils/picSrc'
import moment from 'moment'

export default function ChatList() {
  const {ui,chats,contacts} = useStores()

  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = React.useCallback(async() => {
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false
    })
    setRefreshing(true)
    await contacts.getContacts()
    setRefreshing(false)
  }, [refreshing])

  return useObserver(()=>{
    const theChats = allChats(chats.chats, contacts.contacts)
    const chatsToShow = theChats.filter(c=> {
      if (!ui.searchTerm) return true
      return (c.invite?true:false) || 
        c.name.toLowerCase().includes(ui.searchTerm.toLowerCase())
    })
    chatsToShow.sort(a=>{
      if(a.invite) return -1
      return 0
    })
    return <ScrollView style={{width:'100%',height:'100%'}}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {chatsToShow.map((c,i)=> {
        if(c.invite) return <InviteRow key={i} {...c} />
        return <ChatRow key={c.id+''} {...c} />
      })}
      <View style={moreStyles.buttonsWrap}>
        <Button mode="contained" dark={true} icon="plus"
          onPress={()=> ui.setAddFriendModal(true)}
          style={{...moreStyles.button, backgroundColor:'#55D1A9'}}>
          Friend
        </Button>
        <Button mode="contained" dark={true} icon="plus"
          style={moreStyles.button}
          onPress={()=> ui.setNewGroupModal(true)}>
          Group
        </Button>
      </View>
    </ScrollView>
  })
}

function ChatRow(props){
  const {id,name,contact_ids} = props
  const navigation = useNavigation()
  const {msg} = useStores()

  const uri = useChatPicSrc(props)

  const hasImg = uri?true:false
  return useObserver(()=>{
    const msgs = msg.messages[id||'_']
    const lastMsg = msgs&&msgs[msgs.length-1]
    const lastMsgText = lastMessageText(lastMsg)
    const hasLastMsg = lastMsgText?true:false

    const now = new Date().getTime()
    const lastSeen = msg.lastSeen[id||'_'] || now
    const unseenCount = countUnseen(msgs, lastSeen)
    const hasUnseen = unseenCount>0?true:false
    return<TouchableOpacity style={styles.chatRow} activeOpacity={0.5}
      onPress={()=> {
        msg.seeChat(props.id)
        navigation.navigate('Dashboard',{
          screen:'Chat', params: props
        })
      }}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Image source={hasImg?{uri:'file://'+uri}:require('../../../assets/avatar.png')}
            style={{width:52,height:52}} resizeMode={'cover'}
          />
        </View>
        {hasUnseen && <View style={moreStyles.badgeWrap}>
          <View style={moreStyles.badge}>
            <Text style={moreStyles.badgeText}>{unseenCount}</Text>
          </View>
        </View>}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{name}</Text>
        {hasLastMsg && <Text style={{...styles.chatMsg,fontWeight:hasUnseen?'bold':'normal'}}>
          {lastMsgText}
        </Text>}
      </View>
    </TouchableOpacity>
  })
}

function lastMessageText(msg){
  if(!msg) return ''

  if(msg.message_content) return msg.message_content
  else if(msg.media_token) return 'Picture Received'

  return ''
}

function countUnseen(msgs, lastSeen:number):number{
  if(!msgs) return 0
  let unseenCount = 0
  msgs.forEach(m=>{
    const unseen = moment(new Date(lastSeen)).isBefore(moment(m.date))
    if(unseen) unseenCount+=1
  })
  return Math.min(unseenCount,99)
}

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const moreStyles = StyleSheet.create({
  buttonsWrap:{
    marginTop:40,
    display:'flex',
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-around'
  },
  button:{
    height:46,
    borderRadius:23,
    width:140,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  badgeWrap:{
    position:'absolute',
    width:'100%',
    height:'100%'
  },
  badge:{
    position:'absolute',
    right:0,
    bottom:0,
    backgroundColor:'#DB5554',
    width:18,height:18,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:10
  },
  badgeText:{
    color:'white',
    fontSize:10
  }
})