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
import {ActivityIndicator,Snackbar} from 'react-native-paper'
import { constants } from '../../constants'

export default function Chat(){
  const [show,setShow] = useState(false)
  const [pricePerMessage, setPricePerMessage] = useState(0)
  const [showPricePerMessage, setShowPricePerMessage] = useState(false)
  const {contacts,user,chats} = useStores()
  const route = useRoute<ChatRouteProp>()
  const chat = route.params

  const navigation = useNavigation()

  function handleBack(){
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.navigate('Home',{params:{rnd:Math.random()}})
      return true
    })
  }

  useEffect(()=>{ // check for contact key, exchange if none
    const contact = contactForConversation(chat, contacts.contacts)
    if(contact && !contact.contact_key) {
      contacts.exchangeKeys(contact.id)
    }
    EE.on('left-group', ()=>{
      navigation.navigate('Home',{params:{rnd:Math.random()}})
    })
    EE.on('left-image-viewer', ()=>{
      handleBack()
    })
    InteractionManager.runAfterInteractions(() => {
      setShow(true)
    })

    handleBack()

    fetchTribeParams()
  },[])

  async function fetchTribeParams(){
    const isTribe = chat.type===constants.chat_types.tribe
    const isTribeAdmin = isTribe && chat.owner_pubkey===user.publicKey
    if(isTribe && !isTribeAdmin){
      const params = await chats.getTribeDetails(chat.host,chat.uuid)
      if(params){
        setPricePerMessage(params.pricePerMessage)
        setShowPricePerMessage(true)
      }
    }
  }

  return <View style={styles.main}>
    <Header chat={chat} />
    {!show && <View style={styles.loadWrap}>
      <ActivityIndicator animating={true} color="grey" />
    </View>}
    {show && <MsgList chat={chat} />}
    {show && <BottomBar chat={chat} pricePerMessage={pricePerMessage} />}
    <Snackbar
      visible={showPricePerMessage}
      duration={1000}
      onDismiss={()=> setShowPricePerMessage(false)}>
      {`Price per Message: ${pricePerMessage} sat`}
    </Snackbar>
  </View>
}

const styles = StyleSheet.create({
  main:{
    display:'flex',
    width:'100%',height:'100%',
    backgroundColor:'white',
    position:'relative',
  },
  loadWrap:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
})
