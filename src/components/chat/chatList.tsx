import React from 'react'
import {useObserver} from 'mobx-react-lite'
import {useStores} from '../../store'
import { TouchableOpacity, ScrollView, RefreshControl, View, Text, StyleSheet, Image } from 'react-native'
import {allChats} from './utils'
import InviteRow, {styles} from './inviteRow'
import { useNavigation } from '@react-navigation/native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

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
        return <ChatRow key={i} {...c} />
      })}
    </ScrollView>
  })
}

function ChatRow(props){
  const {name} = props
  const navigation = useNavigation()
  return <TouchableOpacity style={styles.chatRow} activeOpacity={0.5}
    onPress={()=> navigation.navigate('Dashboard',{
      screen:'Chat', params: props
    })}>
    <View style={styles.avatar}>
      <Image source={require('../../../assets/avatar.png')} />
    </View>
    <View style={styles.chatContent}>
      <Text style={styles.chatName}>{name}</Text>
      {/* <Text style={styles.chatMsg}>{lastMsg}</Text> */}
    </View>
  </TouchableOpacity>
}

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}