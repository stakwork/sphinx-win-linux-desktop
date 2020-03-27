import React, {useEffect} from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './header'
import MsgList from './msgList'
import BottomBar from './bottomBar'
import {ChatRouteProp} from '../../types'
import { useRoute } from '@react-navigation/native'
import {useStores} from '../../store'
import {contactForConversation} from './utils'

export default function Chat(){

  const {contacts} = useStores()
  const route = useRoute<ChatRouteProp>()
  const chat = route.params

  useEffect(()=>{ // check for contact key, exchange if none
    const contact = contactForConversation(chat, contacts.contacts)
    if(contact && !contact.contact_key) {
      contacts.exchangeKeys(contact.id)
    }
  },[])

  return <View style={styles.main}>
    <Header chat={chat} />
    <MsgList chat={chat} />
    <BottomBar chat={chat} />
  </View>
}

const styles = StyleSheet.create({
  main:{
    display:'flex',
    width:'100%',height:'100%',
    backgroundColor:'white'
  }
})
