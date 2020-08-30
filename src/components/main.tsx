import React, {useRef, useEffect} from 'react'
import {AppState} from 'react-native'
import MainNav from './mainnav'
import {useStores} from '../store'
import {initPicSrc} from './utils/picSrc'
import * as push from './push'
import { is24HourFormat } from 'react-native-device-time-format'
import * as rsa from '../crypto/rsa'

async function createPrivateKeyIfNotExists(contacts){
  const priv = await rsa.getPrivateKey()
  if(priv) return // all good

  const keyPair = await rsa.generateKeyPair()
  contacts.updateContact(1, {
    contact_key: keyPair.public
  })
}

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

      push.configure((t)=>{
        // console.log("PUSH TOKEN:",t&&t.token)
        if(!user.deviceId || user.deviceId!==t.token) {
          user.registerMyDeviceId(t.token)
        }
      })

      const is24Hour = await is24HourFormat()
      ui.setIs24HourFormat(is24Hour)

      createPrivateKeyIfNotExists(contacts)
    })()
  },[])

  return <MainNav />
}
