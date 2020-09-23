import React, { useEffect, useState } from 'react'
import { View, StyleSheet, InteractionManager, BackHandler } from 'react-native'
import Header from './header'
import MsgList from './msgList'
import BottomBar from './bottomBar'
import { ChatRouteProp } from '../../types'
import { useRoute } from '@react-navigation/native'
import { useStores } from '../../store'
import { contactForConversation } from './utils'
import EE from '../utils/ee'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator, Snackbar } from 'react-native-paper'
import { constants } from '../../constants'
import Frame from './frame'

export default function Chat() {
  const { contacts, user, chats, ui } = useStores()

  const [show, setShow] = useState(false)
  const [pricePerMessage, setPricePerMessage] = useState(0)
  const [showPricePerMessage, setShowPricePerMessage] = useState(false)
  const [replyUuid, setReplyUUID] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [appMode, setAppMode] = useState(false)
  const [tribeBots,setTribeBots] = useState([])
  
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
    EE.on('left-group', () => {
      navigation.navigate('Home', { params: { rnd: Math.random() } })
    })
    EE.on('left-image-viewer', () => {
      handleBack()
    })
    InteractionManager.runAfterInteractions(() => {
      setShow(true)
    })

    handleBack()

    fetchTribeParams()

  }, [])

  async function fetchTribeParams() {
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const isTribeAdmin = isTribe && chat.owner_pubkey === user.publicKey
    let isAppURL = false
    if (isTribe && !isTribeAdmin) {
      setAppMode(true)
      setLoadingChat(true)
      const params = await chats.getTribeDetails(chat.host, chat.uuid)
      if (params) {
        setPricePerMessage(params.price_per_message + params.escrow_amount)
        setShowPricePerMessage(true)
        chats.updateTribeAsNonAdmin(chat.id, params.name, params.img)
        if(params.app_url) {
          isAppURL = true
          ui.setApplicationURL(params.app_url)
        }
        if(params.bots && Array.isArray(params.bots)) {
          setTribeBots(params.bots)
        }
      }
      setLoadingChat(false)
    } else {
      setAppMode(false)
    }
    if (!isAppURL) ui.setApplicationURL('') // remove the app_url
  }

  const appURL = ui.applicationURL
  const theShow = show && !loadingChat
  return <View style={styles.main}>
    <Header chat={chat} appMode={appMode} setAppMode={setAppMode} />
    {(appURL ? true : false) && <View style={{ ...styles.layer, zIndex: appMode ? 100 : 99 }}>
      <Frame url={appURL} />
    </View>}
    <View style={{ ...styles.layer, zIndex: appMode ? 99 : 100 }}>
      {!theShow && <View style={styles.loadWrap}>
        <ActivityIndicator animating={true} color="grey" />
      </View>}
      {theShow && <MsgList chat={chat} setReplyUUID={setReplyUUID} replyUuid={replyUuid} />}
      {theShow && <BottomBar chat={chat} pricePerMessage={pricePerMessage}
        replyUuid={replyUuid} setReplyUUID={setReplyUUID}
        tribeBots={tribeBots}
      />}
      <Snackbar
        visible={showPricePerMessage}
        duration={1000}
        onDismiss={() => setShowPricePerMessage(false)}>
        {`Price per Message: ${pricePerMessage} sat`}
      </Snackbar>
    </View>
  </View>
}

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    width: '100%', height: '100%',
    backgroundColor: 'white',
    position: 'relative',
  },
  layer: {
    display: 'flex',
    width: '100%', height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    paddingTop: 50
  },
  loadWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
