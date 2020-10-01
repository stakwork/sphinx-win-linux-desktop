import React, { useEffect, useReducer } from 'react'
import { View, StyleSheet, InteractionManager, BackHandler, ToastAndroid } from 'react-native'
import Header from '../header'
import MsgList from '../msgList'
import BottomBar from '../bottomBar'
import { ChatRouteProp } from '../../../types'
import { useRoute } from '@react-navigation/native'
import { useStores } from '../../../store'
import { contactForConversation } from '../utils'
import EE from '../../utils/ee'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator, Snackbar } from 'react-native-paper'
import { constants } from '../../../constants'
import Frame from '../frame'
import { reducer, initialState } from './reducer'

export default function Chat() {
  const { contacts, user, chats, ui } = useStores()
  const [state, dispatch] = useReducer(reducer, initialState)

  const setReplyUUIDHandler = (payload: string | any) => {
    dispatch({ type: 'setReplyUUID', payload })
  }

  const setAppModeHandler = (payload: boolean) => {
    dispatch({ type: 'setAppMode', payload })
  }
  
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
      dispatch({ type: 'setShow', payload: true })
    })

    handleBack()

    fetchTribeParams()

    return () => {
      ui.setApplicationURL('')
    }

  }, [])

  async function fetchTribeParams() {
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const isTribeAdmin = isTribe && chat.owner_pubkey === user.publicKey
    let isAppURL = false
    if (isTribe) { //&& !isTribeAdmin) {
      setAppModeHandler(true)
      dispatch({ type: 'setLoadingChat', payload: true })
      const params = await chats.getTribeDetails(chat.host, chat.uuid)
      if (params) {
        const price = params.price_per_message + params.escrow_amount
        dispatch({ type: 'setPricePerMessage', payload: price })
        dispatch({ type: 'setShowPricePerMessage', payload: true })
        ToastAndroid.showWithGravityAndOffset(
          'Price Per Message: '+price+' sat',
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
          0, 125
        );

        chats.updateTribeAsNonAdmin(chat.id, params.name, params.img)
        if(params.app_url) {
          isAppURL = true
          ui.setApplicationURL(params.app_url)
        }
        if(params.bots && Array.isArray(params.bots)) {
          dispatch({ type: 'setTribeBots', payload: params.bots })
        }
      }
      dispatch({ type: 'setLoadingChat', payload: false })
    } else {
      setAppModeHandler(false)
    }
    if (!isAppURL) ui.setApplicationURL('') // remove the app_url
  }

  const onDismissHandler = () => dispatch({ type: 'setShowPricePerMessage', payload: false })

  const appURL = ui.applicationURL
  const theShow = state.show && !state.loadingChat
  return <View style={styles.main}>
    <Header chat={chat} appMode={state.appMode} setAppMode={setAppModeHandler} />
    {(appURL ? true : false) && <View style={{ ...styles.layer, zIndex: state.appMode ? 100 : 99 }}>
      <Frame url={appURL} />
    </View>}
    <View style={{ ...styles.layer, zIndex: state.appMode ? 99 : 100 }}>
      {!theShow && <View style={styles.loadWrap}>
        <ActivityIndicator animating={true} color="grey" />
      </View>}
      {theShow && <MsgList chat={chat} setReplyUUID={setReplyUUIDHandler} replyUuid={state.replyUuid} />}
      {theShow && <BottomBar chat={chat} pricePerMessage={state.pricePerMessage}
        replyUuid={state.replyUuid} setReplyUUID={setReplyUUIDHandler}
        tribeBots={state.tribeBots}
      />}
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
