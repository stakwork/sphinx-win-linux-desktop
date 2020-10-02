import React, {useRef, useEffect} from 'react'
import {AppState} from 'react-native'
import MainNav from './mainnav'
import {useStores} from '../store'
import {initPicSrc} from './utils/picSrc'
import * as push from './push'
import { is24HourFormat } from 'react-native-device-time-format'
import * as rsa from '../crypto/rsa'
import * as BadgeAndroid from 'react-native-android-badge'

async function createPrivateKeyIfNotExists(contacts){
  const priv = await rsa.getPrivateKey()
  if(priv) return // all good

  const keyPair = await rsa.generateKeyPair()
  contacts.updateContact(1, {
    contact_key: keyPair.public
  })
}

let pushToken = ''
push.configure((t)=>{
  console.log("PUSH TOKEN:",t&&t.token)
  pushToken = t.token
},(n)=>{
  console.log("ON FINISH",n)
})

export default function Main() {
  const {contacts,msg,details,user,meme,ui} = useStores()
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    }
  }, [])

  function handleAppStateChange(nextAppState) {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      loadHistory()
    }
    if (appState.current.match(/active/) && nextAppState === "background") {
      const count = msg.countUnseenMessages()
      BadgeAndroid.setBadge(count);
    }
    appState.current = nextAppState;
  }

  async function loadHistory(){
    ui.setLoadingHistory(true)
    await contacts.getContacts().then(()=>{
      meme.authenticateAll()
    })
    await details.getBalance()
    await msg.getMessages()
    ui.setLoadingHistory(false)
    msg.initLastSeen()
  }

  useEffect(()=>{
    (async () => {
      loadHistory()

      initPicSrc()

      if(pushToken && !user.deviceId || user.deviceId!==pushToken) {
        user.registerMyDeviceId(pushToken)
      }

      const is24Hour = await is24HourFormat()
      ui.setIs24HourFormat(is24Hour)

      createPrivateKeyIfNotExists(contacts)
    })()
  },[])

  return <MainNav />
}
