import React, {useEffect,useState} from 'react'
import { View, StyleSheet, InteractionManager, BackHandler } from 'react-native'
import Header from './header'
import MsgList from './msgList'
import BottomBar from './bottomBar'
import {ChatRouteProp} from '../../types'
import { useRoute } from '@react-navigation/native'
import {useStores} from '../../store'
import {contactForConversation} from './utils'
import EE from '../utils/ee'
import { useNavigation } from '@react-navigation/native'
import {ActivityIndicator} from 'react-native-paper'

export default function Chat(){
  const [show,setShow] = useState(false)
  const {contacts} = useStores()
  const route = useRoute<ChatRouteProp>()
  const chat = route.params

  const navigation = useNavigation()

  useEffect(()=>{ // check for contact key, exchange if none
    const contact = contactForConversation(chat, contacts.contacts)
    if(contact && !contact.contact_key) {
      contacts.exchangeKeys(contact.id)
    }
    EE.on('left-group', ()=>{
      navigation.navigate('Home')
    })
    // setTimeout(()=>{
    //   setShow(true)
    // },1)
    InteractionManager.runAfterInteractions(() => {
      setShow(true)
    })
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.navigate('Home')
      return false
    })
  },[])

  return <View style={styles.main}>
    <Header chat={chat} />
    {!show && <View style={styles.loadWrap}>
      <ActivityIndicator animating={true} color="grey" />
    </View>}
    {show && <MsgList chat={chat} />}
    {show && <BottomBar chat={chat} />}
  </View>
}

const styles = StyleSheet.create({
  main:{
    display:'flex',
    width:'100%',height:'100%',
    backgroundColor:'white'
  },
  loadWrap:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
})
