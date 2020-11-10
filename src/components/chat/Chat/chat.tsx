import React, { useEffect, useReducer } from 'react'
import { View, StyleSheet, InteractionManager, BackHandler, ToastAndroid } from 'react-native'
import Header from '../header'
import MsgList from '../msgList/index'
import BottomBar from '../bottomBar'
import { ChatRouteProp } from '../../../types'
import { useRoute } from '@react-navigation/native'
import { useStores, useTheme } from '../../../store'
import { contactForConversation } from '../utils'
import EE from '../../utils/ee'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native-paper'
import { constants } from '../../../constants'
import Frame from '../frame'
import { reducer, initialState } from './reducer'
import Pod from '../pod'
import {StreamPayment} from '../../../store/feed'
import Anim from '../pod/anim'
import {useIncomingPayments} from '../../../store/hooks/pod'

export type RouteStatus = 'active' | 'inactive' | null

export default function Chat() {
  const { contacts, user, chats, ui, msg } = useStores()
  const [state, dispatch] = useReducer(reducer, initialState)
  const theme = useTheme()

  const setAppModeHandler = (payload: boolean) => {
    dispatch({ type: 'setAppMode', payload })
  }

  const setShowPodHandler = (payload: boolean) => {
    dispatch({ type: 'setShowPod', payload })
  }

  const setStatusHandler = (payload: any) => {
    dispatch({ type: 'setStatus', payload })
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
      dispatch({type:'setTribeParams',payload:null})
    }

  }, [])

  async function fetchTribeParams() {
    const isTribe = chat && chat.type === constants.chat_types.tribe
    const isTribeAdmin = isTribe && chat.owner_pubkey === user.publicKey
    // let isAppURL = false
    // let isFeedURL = false
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
        if(!isTribeAdmin) {
          if(chat.name!==params.name || chat.photo_url!==params.img) {
            chats.updateTribeAsNonAdmin(chat.id, params.name, params.img)
          }
        }
        dispatch({ type: 'setTribeParams', payload: params })
        if(params.feed_url) {
          loadPod(params)
        }
      }
      dispatch({ type: 'setLoadingChat', payload: false })
    } else {
      setAppModeHandler(false)
    }

    const r = await chats.checkRoute(chat.id)
    if(r && r.success_prob && r.success_prob>0) {
      setStatusHandler('active')
    } else {
      setStatusHandler('inactive')
    }
  }

  async function loadPod(tr) {
    const params = await chats.loadFeed(chat.host, chat.uuid, tr.feed_url)
    if (params) dispatch({type:'setPod',payload:params})
    if(!params) dispatch({type:'setPodError',payload:'no podcast found'})
    // if (params) initialSelect(params)
  }

  const appURL = state.tribeParams && state.tribeParams.app_url
  const pod = state.pod
  const feedURL = state.tribeParams && state.tribeParams.feed_url
  const tribeBots = state.tribeParams && state.tribeParams.bots
  const theShow = state.show

  function onBoost(sp:StreamPayment){
    if(!(chat && chat.id)) return
    msg.sendMessage({
      contact_id:null,
      text:`boost::${JSON.stringify(sp)}`,
      chat_id: chat.id||null,
      amount: state.pricePerMessage,
      reply_uuid:''
    })
  }

  const podID = pod&&pod.id
  const {earned,spent} = useIncomingPayments(podID)

  let pricePerMinute = 0
  if(pod && pod.value && pod.value.model && pod.value.model.suggested) {
    pricePerMinute = Math.round(parseFloat(pod.value.model.suggested) * 100000000)
  }
  return <View style={{...styles.main,backgroundColor:theme.bg}}>
    <Header chat={chat} appMode={state.appMode} setAppMode={setAppModeHandler} status={state.status} 
      tribeParams={state.tribeParams} pricePerMinute={pricePerMinute}
      earned={earned} spent={spent}
    />
    {(appURL ? true : false) && <View style={{ ...styles.layer, zIndex: state.appMode ? 100 : 99 }}>
      <Frame url={appURL} />
    </View>}


    <View style={{ ...styles.layer, zIndex: state.appMode ? 99 : 100, backgroundColor:theme.dark?theme.bg:'white' }} accessibilityLabel="chat-content">
      {!theShow && <View style={{...styles.loadWrap,backgroundColor:theme.bg}}>
        <ActivityIndicator animating={true} color={theme.subtitle} />
      </View>}
      {theShow && <MsgList chat={chat} />}

      <Pod pod={pod} show={feedURL?true:false} chatID={chat.id} onBoost={onBoost} podError={state.podError} />

      <Anim dark={theme.dark} />

      {theShow && <BottomBar chat={chat} pricePerMessage={state.pricePerMessage}
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
