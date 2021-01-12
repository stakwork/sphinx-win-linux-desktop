import React, { useRef, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import MainNav from './mainnav'
import { useStores } from '../store'
import { initPicSrc } from './utils/picSrc'
import * as push from './push'
import * as rsa from '../crypto/rsa'
import * as BadgeAndroid from 'react-native-android-badge'
import EE, { RESET_IP, RESET_IP_FINISHED } from './utils/ee'
import {check, VersionDialog} from './checkVersion'

async function createPrivateKeyIfNotExists(contacts) {
  const priv = await rsa.getPrivateKey()
  if (priv) return // all good

  const keyPair = await rsa.generateKeyPair()
  contacts.updateContact(1, {
    contact_key: keyPair.public
  })
}

let pushToken = ''
push.configure((t) => {
  console.log("PUSH TOKEN:", t && t.token)
  pushToken = t.token
}, (n) => {
  // console.log("ON FINISH",n)
})


export default function Main() {
  
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const { contacts, msg, details, user, meme, ui } = useStores()
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
      checkVersion()
    }
    if (appState.current.match(/active/) && nextAppState === "background") {
      const count = msg.countUnseenMessages()
      BadgeAndroid.setBadge(count);
    }
    appState.current = nextAppState;
  }

  async function checkVersion() {
    const showDialog = await check()
    if(showDialog) setShowVersionDialog(true)
  }

  async function loadHistory() {
    console.log("============> LOAD HISTORY", user.currentIP)
    ui.setLoadingHistory(true)
    await Promise.all([
      contacts.getContacts(),
      msg.getMessages()
    ])
    ui.setLoadingHistory(false)
    // msg.initLastSeen()
    await sleep(500)
    details.getBalance()
    await sleep(500)
    meme.authenticateAll()
  }

  useEffect(() => {
    (async () => {

      loadHistory()
      checkVersion()

      initPicSrc()

      if (pushToken && !user.deviceId || user.deviceId !== pushToken) {
        user.registerMyDeviceId(pushToken)
      }

      createPrivateKeyIfNotExists(contacts)
    })()

    EE.on(RESET_IP_FINISHED, loadHistory)
    return () => {
      EE.removeListener(RESET_IP_FINISHED, loadHistory)
    }
  }, [])

  function onCloseVersionDialog(){
    setShowVersionDialog(false)
  }

  return <>
    <MainNav />
    <VersionDialog 
      showVersionDialog={showVersionDialog}
      onCloseVersionDialog={onCloseVersionDialog}
    />
  </>
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}