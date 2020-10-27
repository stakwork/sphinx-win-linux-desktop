import React, { useEffect, useState } from 'react'
import { View, StyleSheet, InteractionManager, BackHandler, ToastAndroid } from 'react-native'
import Header from './header'
import MsgList from './msgList'
import BottomBar from './bottomBar'
import { ChatRouteProp } from '../../types'
import { useRoute } from '@react-navigation/native'
import { useStores, useTheme } from '../../store'
import { contactForConversation } from './utils'
import EE, {LEFT_GROUP,LEFT_IMAGE_VIEWER} from '../utils/ee'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native-paper'
import { constants } from '../../constants'
import Frame from './frame'
import Pod from './pod'
import {StreamPayment} from '../../store/feed'

export type RouteStatus = 'active' | 'inactive' | null

export default function Chat() {
  const { contacts, user, chats, ui, msg } = useStores()
  const theme = useTheme()

  const [show, setShow] = useState(false)
  const [pricePerMessage, setPricePerMessage] = useState(0)
  const [appMode, setAppMode] = useState(false)
  // const [showPod, setShowPod] = useState(false)
  const [tribeBots,setTribeBots] = useState([])
  const [status, setStatus] = useState<RouteStatus>(null)
  
  const route = useRoute<ChatRouteProp>()
  const chatID = route.params.id
  const chat = chats.chats.find(c => c.id === chatID) || route.params

  const navigation = useNavigation()

  function handleBack() {
    BackHandler.addEventListener('hardwareBackPress', function () {
      navigation.navigate('Home', { params: { rnd: Math.random() } })
      return true
    })
  }

  useEffect(() => { // check for contact key, exchange if none
    const contact = contactForConversation(chat, contacts.contacts)
    if (contact && !contact.contact_key) {
      contacts.exchangeKeys(contact.id)
    }
    EE.on(LEFT_GROUP, () => {
      navigation.navigate('Home', { params: { rnd: Math.random() } })
    })
    EE.on(LEFT_IMAGE_VIEWER, () => {
      handleBack()
    })
    InteractionManager.runAfterInteractions(() => {
      setShow(true)
    })

    handleBack()

    fetchTribeParams()

    return () => {
      ui.setApplicationURL('')
      ui.setFeedURL('')
    }

  }, [])

  async function fetchTribeParams() {
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const isTribeAdmin = isTribe && chat.owner_pubkey === user.publicKey
    let isAppURL = false
    let isFeedURL = false
    if (isTribe) { //&& !isTribeAdmin) {
      setAppMode(true)
      // setLoadingChat(true)
      const params = await chats.getTribeDetails(chat.host, chat.uuid)
      if (params) {
        const price = params.price_per_message + params.escrow_amount
        setPricePerMessage(price)
        ToastAndroid.showWithGravityAndOffset(
          'Price Per Message: '+price+' sat',
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
          0, 125
        );
        if(!isTribeAdmin) {
          chats.updateTribeAsNonAdmin(chat.id, params.name, params.img)
        }
        if(params.app_url) {
          isAppURL = true
          ui.setApplicationURL(params.app_url)
        }
        if(params.feed_url) {
          isFeedURL = true
          ui.setFeedURL(params.feed_url)
        }
        if(params.bots && Array.isArray(params.bots)) {
          setTribeBots(params.bots)
        }
      }
      // setLoadingChat(false)
    } else {
      setAppMode(false)
    }
    if (!isAppURL && ui.applicationURL) ui.setApplicationURL('') // remove the app_url
    if (!isFeedURL && ui.feedURL) ui.setFeedURL('')

    const r = await chats.checkRoute(chat.id)
    if(r && r.success_prob && r.success_prob>0.001) {
      setStatus('active')
    } else {
      setStatus('inactive')
    }
  }

  const appURL = ui.applicationURL
  const theShow = show

  function onBoost(sp:StreamPayment){
    if(!(chat && chat.id)) return
    msg.sendMessage({
      contact_id:null,
      text:`boost::${JSON.stringify(sp)}`,
      chat_id: chat.id||null,
      amount: pricePerMessage,
      reply_uuid:''
    })
  }

  return <View style={{...styles.main,backgroundColor:theme.bg}} accessibilityLabel="chat">

    <Header chat={chat} appMode={appMode} setAppMode={setAppMode} status={status} />

    {(appURL ? true : false) && <View style={{ ...styles.layer, zIndex: appMode ? 100 : 99 }} accessibilityLabel="chat-application-frame">
      <Frame url={appURL} />
    </View>}

    <View style={{ ...styles.layer, zIndex: appMode ? 99 : 100, backgroundColor:theme.dark?theme.bg:'white' }} accessibilityLabel="chat-content">
      {!theShow && <View style={{...styles.loadWrap,backgroundColor:theme.bg}}>
        <ActivityIndicator animating={true} color={theme.subtitle} />
      </View>}
      {theShow && <MsgList chat={chat} />}

      <Pod chat={chat} show={ui.feedURL} url={ui.feedURL} onBoost={onBoost} />

      {theShow && <BottomBar chat={chat} pricePerMessage={pricePerMessage}
        tribeBots={tribeBots}
      />}
    </View>

  </View>
}

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    width: '100%', height: '100%',
    position: 'relative',
  },
  layer: {
    display: 'flex',
    width: '100%', height: '100%',
    position: 'absolute',
    paddingTop: 50
  },
  loadWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
